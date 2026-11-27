"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Megaphone, SendHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { MobileAvatar } from "@/components/mobile/avatar";
import { useEventSlug } from "@/components/mobile/use-event-slug";
import { toast } from "@/hooks/use-toast";
import { MobileApiError, mobileApi, mobileKeys } from "@/lib/mobile/client";
import { cn } from "@/lib/utils";
import type { MobileChatMessage, MobileChatRoom } from "@/types/mobile";

import { ErrorState, Skeleton } from "./states";
import { clockTime, dayLabel } from "./time";

const MAX_LENGTH = 1000;
const PAGE_SIZE = 50;

function messagesPath(roomUuid: string): string {
  return `chat/rooms/${encodeURIComponent(roomUuid)}/messages`;
}

interface PendingMessage {
  temporaryId: string;
  body: string;
  failed: boolean;
}

/**
 * Highest message number received from the server, per room. Polling continues
 * from here, not from the newest message on screen: a message we just sent is
 * shown immediately and may be numbered well past messages not fetched yet.
 */
const syncedSeqByRoom = new Map<string, number>();

/** How far behind the last fetched message each poll re-reads */
const POLL_OVERLAP = 50;

function mergeMessages(
  current: MobileChatMessage[],
  incoming: MobileChatMessage[],
): MobileChatMessage[] {
  if (incoming.length === 0) {
    return current;
  }
  const bySeq = new Map<number, MobileChatMessage>();
  for (const message of current) {
    bySeq.set(message.seq, message);
  }
  for (const message of incoming) {
    bySeq.set(message.seq, message);
  }
  return [...bySeq.values()].toSorted((a, b) => a.seq - b.seq);
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

function OrganizerAvatar() {
  return (
    <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
      <Megaphone className="size-4" />
    </span>
  );
}

function MessageBubble({
  message,
  showAuthor,
}: {
  message: MobileChatMessage;
  showAuthor: boolean;
}) {
  if (message.isMine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-[var(--mobile-accent)] px-4 py-2.5 text-[var(--mobile-accent-foreground)]">
          <p className="text-base leading-6 font-medium break-words whitespace-pre-wrap">
            {message.body}
          </p>
          <p className="mt-0.5 text-right text-[10px] font-semibold text-[var(--mobile-accent-muted)]">
            {clockTime(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }
  const name = message.isOrganizer
    ? "Organizator"
    : (message.sender?.displayName ?? "Uczestnik");
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 shrink-0">
        {showAuthor ? (
          message.isOrganizer || message.sender === null ? (
            <OrganizerAvatar />
          ) : (
            <MobileAvatar person={message.sender} size={32} />
          )
        ) : null}
      </div>
      <div
        className={cn(
          "max-w-[78%] rounded-3xl rounded-bl-lg px-4 py-2.5",
          message.isOrganizer
            ? "border-primary bg-background border-2"
            : "bg-card",
        )}
      >
        {showAuthor ? (
          <p
            className={cn(
              "mb-1 flex items-center gap-1 text-xs font-semibold",
              message.isOrganizer ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {message.isOrganizer ? (
              <span className="bg-primary text-primary-foreground rounded-[22px] px-1.5 py-0.5 text-[10px] font-semibold">
                {name}
              </span>
            ) : (
              name
            )}
            {message.isOrganizer && message.sender !== null ? (
              <span className="text-muted-foreground font-normal">
                · {message.sender.displayName}
              </span>
            ) : null}
          </p>
        ) : null}
        <p className="text-base leading-6 font-medium break-words whitespace-pre-wrap">
          {message.body}
        </p>
        <p className="text-muted-foreground mt-0.5 text-right text-[10px] font-semibold">
          {clockTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function ChatConversation({ roomUuid }: { roomUuid: string }) {
  const eventSlug = useEventSlug();
  const queryClient = useQueryClient();
  const messagesKey = mobileKeys.chatMessages(eventSlug, roomUuid);
  const basePath = messagesPath(roomUuid);

  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const forceScrollRef = useRef(true);
  const preserveHeightRef = useRef<number | null>(null);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);

  const roomsQuery = useQuery({
    queryKey: mobileKeys.chatRooms(eventSlug),
    queryFn: async () => mobileApi<MobileChatRoom[]>(eventSlug, "chat/rooms"),
    staleTime: 60_000,
  });
  const room = roomsQuery.data?.find((item) => item.uuid === roomUuid);

  const messagesQuery = useQuery({
    queryKey: mobileKeys.chatMessages(eventSlug, roomUuid),
    queryFn: async () => {
      const previous = queryClient.getQueryData<MobileChatMessage[]>(
        mobileKeys.chatMessages(eventSlug, roomUuid),
      );
      if (previous === undefined || previous.length === 0) {
        const latest = await mobileApi<MobileChatMessage[]>(
          eventSlug,
          `${messagesPath(roomUuid)}?limit=${String(PAGE_SIZE)}`,
        );
        // Also runs on every poll while the room is still empty, so the answer
        // can change from "nothing older" to "there is more"
        setHasOlder(latest.length >= PAGE_SIZE);
        syncedSeqByRoom.set(roomUuid, latest.at(-1)?.seq ?? 0);
        return latest;
      }
      // Falls back to the newest cached message after a full page reload
      const syncedSeq =
        syncedSeqByRoom.get(roomUuid) ?? previous.at(-1)?.seq ?? 0;
      // Message numbers are handed out before a message is saved, so one with
      // a lower number can appear after a higher one was already fetched.
      // Re-reading a small window behind the cursor picks those up.
      const newer = await mobileApi<MobileChatMessage[]>(
        eventSlug,
        `${messagesPath(roomUuid)}?afterSeq=${String(Math.max(0, syncedSeq - POLL_OVERLAP))}&limit=100`,
      );
      syncedSeqByRoom.set(
        roomUuid,
        Math.max(syncedSeq, newer.at(-1)?.seq ?? 0),
      );
      return mergeMessages(
        queryClient.getQueryData<MobileChatMessage[]>(
          mobileKeys.chatMessages(eventSlug, roomUuid),
        ) ?? [],
        newer,
      );
    },
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
  const messages = messagesQuery.data ?? [];

  // Refresh the room list (unread counts) when leaving the conversation
  useEffect(() => {
    return () => {
      void queryClient.invalidateQueries({
        queryKey: mobileKeys.chatRooms(eventSlug),
      });
    };
  }, [queryClient, eventSlug]);

  const scrollToBottom = useCallback(() => {
    const element = scrollRef.current;
    if (element !== null) {
      element.scrollTop = element.scrollHeight;
    }
  }, []);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element === null) {
      return;
    }
    if (preserveHeightRef.current !== null) {
      element.scrollTop += element.scrollHeight - preserveHeightRef.current;
      preserveHeightRef.current = null;
      return;
    }
    if (forceScrollRef.current || nearBottomRef.current) {
      forceScrollRef.current = false;
      scrollToBottom();
    }
  }, [messages.length, pending.length, scrollToBottom]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element === null) {
      return;
    }
    nearBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 120;
  };

  const loadOlder = async () => {
    const firstSeq = messages.at(0)?.seq;
    if (firstSeq === undefined || loadingOlder) {
      return;
    }
    setLoadingOlder(true);
    try {
      const older = await mobileApi<MobileChatMessage[]>(
        eventSlug,
        `${basePath}?beforeSeq=${String(firstSeq)}&limit=${String(PAGE_SIZE)}`,
      );
      if (older.length < PAGE_SIZE) {
        setHasOlder(false);
      }
      preserveHeightRef.current = scrollRef.current?.scrollHeight ?? null;
      queryClient.setQueryData<MobileChatMessage[]>(messagesKey, (current) =>
        mergeMessages(current ?? [], older),
      );
    } catch {
      toast({
        variant: "destructive",
        title: "Nie udało się wczytać starszych wiadomości",
      });
    } finally {
      setLoadingOlder(false);
    }
  };

  const send = async (body: string, temporaryId: string) => {
    try {
      const created = await mobileApi<MobileChatMessage>(eventSlug, basePath, {
        method: "POST",
        json: { body },
      });
      queryClient.setQueryData<MobileChatMessage[]>(messagesKey, (current) =>
        mergeMessages(current ?? [], [created]),
      );
      setPending((items) =>
        items.filter((item) => item.temporaryId !== temporaryId),
      );
    } catch (error) {
      setPending((items) =>
        items.map((item) =>
          item.temporaryId === temporaryId ? { ...item, failed: true } : item,
        ),
      );
      toast({
        variant: "destructive",
        title:
          error instanceof MobileApiError && error.status === 429
            ? "Zwolnij trochę! Wysyłasz wiadomości za szybko."
            : "Nie udało się wysłać wiadomości",
      });
    }
  };

  const submit = () => {
    const body = draft.trim();
    if (body === "" || body.length > MAX_LENGTH) {
      return;
    }
    const temporaryId = `${String(Date.now())}-${String(Math.random())}`;
    setPending((items) => [...items, { temporaryId, body, failed: false }]);
    setDraft("");
    forceScrollRef.current = true;
    void send(body, temporaryId);
  };

  const retry = (item: PendingMessage) => {
    setPending((items) =>
      items.map((entry) =>
        entry.temporaryId === item.temporaryId
          ? { ...entry, failed: false }
          : entry,
      ),
    );
    void send(item.body, item.temporaryId);
  };

  const title = room?.title ?? (roomsQuery.isPending ? "" : "Czat");

  return (
    <div className="bg-background flex h-dvh flex-col tracking-[-0.01em]">
      <header className="border-border bg-background/90 z-20 flex shrink-0 items-center gap-2 border-b px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="flex h-16 w-full items-center gap-3">
          <Link
            href={`/${eventSlug}/app/chats`}
            aria-label="Wróć"
            className="bg-secondary flex size-11 shrink-0 items-center justify-center rounded-full transition active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </Link>
          {room === undefined ? null : room.type === "EVENT" ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)]">
              <Megaphone className="size-4" />
            </span>
          ) : (
            <MobileAvatar
              person={{ displayName: room.title, photoUrl: room.photoUrl }}
              size={40}
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base leading-[1.2] font-bold">
              {title}
            </h1>
            {room?.type === "EVENT" ? (
              <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                Czat wszystkich uczestników
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4"
      >
        {messagesQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={cn("flex", index % 2 === 0 ? "" : "justify-end")}
              >
                <Skeleton className="h-12 w-2/3" />
              </div>
            ))}
          </div>
        ) : messagesQuery.isError && messages.length === 0 ? (
          <ErrorState
            message={
              messagesQuery.error instanceof MobileApiError &&
              (messagesQuery.error.status === 403 ||
                messagesQuery.error.status === 404)
                ? "Ten czat jest niedostępny."
                : "Nie udało się wczytać wiadomości."
            }
            onRetry={() => void messagesQuery.refetch()}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            {hasOlder && messages.length > 0 ? (
              <button
                type="button"
                onClick={() => void loadOlder()}
                disabled={loadingOlder}
                className="text-muted-foreground border-border bg-background mx-auto mb-2 flex min-h-11 items-center gap-2 rounded-3xl border px-5 text-xs font-semibold"
              >
                {loadingOlder ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : null}
                Wczytaj starsze
              </button>
            ) : null}
            {messages.length === 0 && pending.length === 0 ? (
              <p className="text-muted-foreground py-16 text-center text-sm font-medium">
                Nie ma tu jeszcze wiadomości. Przywitaj się! 👋
              </p>
            ) : null}
            {messages.map((message, index) => {
              const previous: MobileChatMessage | undefined =
                index > 0 ? messages[index - 1] : undefined;
              const newDay =
                previous === undefined ||
                dayKey(previous.createdAt) !== dayKey(message.createdAt);
              const sameAuthor =
                previous !== undefined &&
                !newDay &&
                previous.isMine === message.isMine &&
                previous.isOrganizer === message.isOrganizer &&
                previous.sender?.participantUuid ===
                  message.sender?.participantUuid;
              return (
                <Fragment key={message.seq}>
                  {newDay ? (
                    <div className="my-3 flex justify-center">
                      <span className="bg-card text-muted-foreground rounded-[22px] px-3 py-1 text-xs font-semibold first-letter:uppercase">
                        {dayLabel(message.createdAt)}
                      </span>
                    </div>
                  ) : null}
                  <div className={sameAuthor ? "" : "mt-2"}>
                    <MessageBubble message={message} showAuthor={!sameAuthor} />
                  </div>
                </Fragment>
              );
            })}
            {pending.map((item) => (
              <div key={item.temporaryId} className="flex flex-col items-end">
                <div
                  className={cn(
                    "max-w-[80%] rounded-3xl rounded-br-lg bg-[var(--mobile-accent)] px-4 py-2.5 text-[var(--mobile-accent-foreground)]",
                    item.failed ? "opacity-60" : "opacity-75",
                  )}
                >
                  <p className="text-base leading-6 font-medium break-words whitespace-pre-wrap">
                    {item.body}
                  </p>
                </div>
                {item.failed ? (
                  <button
                    type="button"
                    onClick={() => {
                      retry(item);
                    }}
                    className="mt-1 min-h-8 px-2 py-1 text-xs font-semibold text-[var(--mobile-danger)]"
                  >
                    Nie wysłano · Ponów
                  </button>
                ) : (
                  <span className="text-muted-foreground mt-0.5 text-[10px]">
                    Wysyłanie…
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="border-border bg-background shrink-0 border-t px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.slice(0, MAX_LENGTH));
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder="Napisz wiadomość…"
            aria-label="Treść wiadomości"
            className="bg-secondary placeholder:text-muted-foreground field-sizing-content max-h-32 min-h-12 flex-1 resize-none rounded-3xl px-5 py-3 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)]"
          />
          <button
            type="submit"
            aria-label="Wyślij"
            disabled={draft.trim() === ""}
            className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full transition active:scale-95 disabled:opacity-30"
          >
            <SendHorizontal className="size-5" />
          </button>
        </div>
        {draft.length > MAX_LENGTH - 100 ? (
          <p className="text-muted-foreground mt-1 text-right text-xs">
            {draft.length}/{MAX_LENGTH}
          </p>
        ) : null}
      </form>
    </div>
  );
}
