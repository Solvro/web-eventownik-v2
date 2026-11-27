"use client";

import { useQuery } from "@tanstack/react-query";
import { Megaphone, MessagesSquare } from "lucide-react";
import Link from "next/link";

import { MobileAvatar } from "@/components/mobile/avatar";
import { useEventSlug } from "@/components/mobile/use-event-slug";
import { mobileApi, mobileKeys } from "@/lib/mobile/client";
import type { MobileChatRoom } from "@/types/mobile";

import { EmptyState, ErrorState, Skeleton } from "./states";
import { relativeTime } from "./time";

function RoomRow({
  room,
  eventSlug,
}: {
  room: MobileChatRoom;
  eventSlug: string;
}) {
  const unread = room.unreadCount > 0;
  const preview =
    room.lastMessage === null
      ? "Brak wiadomości — napisz pierwszy!"
      : room.lastMessage.senderName === null
        ? room.lastMessage.body
        : `${room.lastMessage.senderName}: ${room.lastMessage.body}`;
  return (
    <li>
      <Link
        href={`/${eventSlug}/app/chats/${room.uuid}`}
        className="bg-secondary flex items-center gap-4 rounded-3xl px-4 py-4 tracking-[-0.01em] transition active:scale-[0.99] active:brightness-95"
      >
        {room.type === "EVENT" ? (
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)]">
            {room.photoUrl === null ? (
              <Megaphone className="size-6" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={room.photoUrl}
                alt=""
                className="size-full object-cover"
              />
            )}
          </div>
        ) : (
          <MobileAvatar
            person={{ displayName: room.title, photoUrl: room.photoUrl }}
            size={48}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={`truncate text-base leading-[1.2] ${unread ? "font-bold" : "font-semibold"}`}
            >
              {room.title}
            </p>
            {room.lastMessage === null ? null : (
              <span
                className={`shrink-0 text-xs ${unread ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}`}
              >
                {relativeTime(room.lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p
              className={`truncate text-sm ${unread ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}`}
            >
              {preview}
            </p>
            {unread ? (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-accent)] px-1.5 text-[10px] font-bold text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]">
                {room.unreadCount > 99 ? "99+" : room.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function ChatRoomList() {
  const eventSlug = useEventSlug();
  const query = useQuery({
    queryKey: mobileKeys.chatRooms(eventSlug),
    queryFn: async () => mobileApi<MobileChatRoom[]>(eventSlug, "chat/rooms"),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  if (query.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="bg-card flex items-center gap-4 rounded-3xl p-4"
          >
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const rooms = query.data;
  const eventRooms = rooms.filter((room) => room.type === "EVENT");
  const directRooms = rooms.filter((room) => room.type === "DIRECT");

  return (
    <div>
      <ul className="flex flex-col gap-3">
        {[...eventRooms, ...directRooms].map((room) => (
          <RoomRow key={room.uuid} room={room} eventSlug={eventSlug} />
        ))}
      </ul>
      {directRooms.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Brak prywatnych rozmów"
          description="Gdy dopasujesz się z kimś w Tinderowniku, wasz czat pojawi się tutaj."
        >
          <Link
            href={`/${eventSlug}/app/tinder`}
            className="bg-primary text-primary-foreground flex h-[60px] items-center rounded-3xl px-8 text-base font-semibold tracking-[0.01em] transition active:scale-[0.98]"
          >
            Otwórz Tinderownik
          </Link>
        </EmptyState>
      ) : null}
    </div>
  );
}
