"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Check,
  Grid3X3,
  Loader2,
  PartyPopper,
  Trophy,
  Undo2,
} from "lucide-react";
import { useRef, useState } from "react";

import { MobileAvatar } from "@/components/mobile/avatar";
import { useMobile } from "@/components/mobile/mobile-context";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { useEventSlug } from "@/components/mobile/use-event-slug";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MobileApiError, mobileApi, mobileKeys } from "@/lib/mobile/client";
import { downscaleImage } from "@/lib/mobile/image";
import { cn } from "@/lib/utils";
import type {
  MobileBingoBoard,
  MobileBingoCell,
  MobileBingoLeaderboardEntry,
} from "@/types/mobile";

import { EmptyState, ErrorState, Skeleton } from "./states";
import { useObjectUrl } from "./use-object-url";

function CellSheet({
  cell,
  onClose,
}: {
  cell: MobileBingoCell | null;
  onClose: () => void;
}) {
  const eventSlug = useEventSlug();
  const { surface } = useMobile();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const preview = useObjectUrl(photo);

  const mutation = useMutation({
    mutationFn: async ({
      taskUuid,
      complete,
    }: {
      taskUuid: string;
      complete: boolean;
    }) => {
      const path = `bingo/tasks/${encodeURIComponent(taskUuid)}/complete`;
      if (!complete) {
        return mobileApi<MobileBingoBoard>(eventSlug, path, {
          method: "DELETE",
        });
      }
      const body = new FormData();
      if (photo !== null) {
        const blob = await downscaleImage(photo);
        body.append("photo", blob, "photo.jpg");
      }
      return mobileApi<MobileBingoBoard>(eventSlug, path, {
        method: "POST",
        body,
      });
    },
    onSuccess: (board, variables) => {
      const hadBingo =
        queryClient.getQueryData<MobileBingoBoard>(mobileKeys.bingo(eventSlug))
          ?.hasBingo ?? false;
      queryClient.setQueryData(mobileKeys.bingo(eventSlug), board);
      void queryClient.invalidateQueries({
        queryKey: mobileKeys.bingoLeaderboard(eventSlug),
      });
      if (variables.complete) {
        toast({
          title: board.hasBingo && !hadBingo ? "BINGO! 🎉" : "Zaliczone! ✅",
        });
      }
      setPhoto(null);
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title:
          error instanceof MobileApiError && error.status === 413
            ? "Zdjęcie jest za duże"
            : "Nie udało się zapisać zadania",
      });
    },
  });

  return (
    <Dialog
      open={cell !== null}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) {
          setPhoto(null);
          onClose();
        }
      }}
    >
      <DialogContent
        className={cn(
          surface.className,
          "max-w-[calc(100vw-2.5rem)] gap-5 rounded-[32px] border-0 p-6 tracking-[-0.01em] sm:max-w-sm",
        )}
        style={surface.style}
      >
        {cell === null ? null : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl leading-[1.3] font-bold">
                {cell.text}
              </DialogTitle>
              <DialogDescription>
                {cell.completed
                  ? "To zadanie masz już zaliczone."
                  : "Wykonaj zadanie i oznacz je jako zaliczone. Możesz dodać zdjęcie jako dowód."}
              </DialogDescription>
            </DialogHeader>

            {cell.completed && cell.photoUrl !== null ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cell.photoUrl}
                alt=""
                className="max-h-72 w-full rounded-3xl object-cover"
              />
            ) : null}

            {cell.completed ? (
              <Button
                variant="outline"
                className="border-border h-[60px] rounded-3xl text-base font-semibold"
                disabled={mutation.isPending}
                onClick={() => {
                  mutation.mutate({ taskUuid: cell.taskUuid, complete: false });
                }}
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Undo2 />
                )}
                Cofnij
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) => {
                    setPhoto(event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
                {preview === null ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-muted-foreground bg-secondary flex h-28 flex-col items-center justify-center gap-2 rounded-3xl text-sm font-semibold transition active:scale-[0.99]"
                  >
                    <Camera className="size-6" />
                    Dodaj zdjęcie (opcjonalnie)
                  </button>
                ) : (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Podgląd zdjęcia"
                      className="max-h-64 w-full rounded-3xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                      }}
                      className="absolute top-3 right-3 flex min-h-9 items-center rounded-[22px] bg-black/60 px-3 text-xs font-semibold text-white"
                    >
                      Usuń
                    </button>
                  </div>
                )}
                <Button
                  disabled={mutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-[60px] rounded-3xl text-base font-semibold tracking-[0.01em]"
                  onClick={() => {
                    mutation.mutate({
                      taskUuid: cell.taskUuid,
                      complete: true,
                    });
                  }}
                >
                  {mutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check />
                  )}
                  Zaliczone
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Leaderboard() {
  const eventSlug = useEventSlug();
  const query = useQuery({
    queryKey: mobileKeys.bingoLeaderboard(eventSlug),
    queryFn: async () =>
      mobileApi<MobileBingoLeaderboardEntry[]>(eventSlug, "bingo/leaderboard"),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  return (
    <section className="px-5 pt-8 pb-8 tracking-[-0.01em]">
      <h2 className="mb-4 flex items-center gap-2 text-base leading-[1.2] font-semibold">
        <Trophy className="size-5" />
        Ranking
      </h2>
      {query.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <p className="text-muted-foreground text-sm font-medium">
          Nie udało się wczytać rankingu.
        </p>
      ) : query.data.length === 0 ? (
        <p className="text-muted-foreground text-sm font-medium">
          Nikt jeszcze nie zaliczył zadania. Bądź pierwszy!
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {query.data.map((entry, index) => (
            <li
              key={entry.participantUuid}
              className={cn(
                "flex items-center gap-3 rounded-3xl px-4 py-3",
                index === 0 ? "bg-[var(--mobile-accent-soft)]" : "bg-card",
              )}
            >
              <span className="w-6 text-center text-sm font-bold tabular-nums">
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : index + 1}
              </span>
              <MobileAvatar person={entry} size={40} />
              <span className="min-w-0 flex-1 truncate text-base font-semibold">
                {entry.displayName}
              </span>
              <span className="bg-background rounded-[22px] px-2.5 py-1 text-xs font-bold tabular-nums">
                {entry.completedCount}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function BingoScreen() {
  const eventSlug = useEventSlug();
  const [selected, setSelected] = useState<string | null>(null);
  const query = useQuery({
    queryKey: mobileKeys.bingo(eventSlug),
    queryFn: async () => mobileApi<MobileBingoBoard>(eventSlug, "bingo"),
  });
  const selectedCell =
    query.data?.cells.find((cell) => cell.taskUuid === selected) ?? null;

  let content: React.ReactNode;
  if (query.isPending) {
    content = (
      <div className="flex flex-col gap-6 px-5 pt-5">
        <Skeleton className="h-36 w-full rounded-[23px]" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, index) => (
            <Skeleton key={index} className="aspect-square rounded-[17px]" />
          ))}
        </div>
      </div>
    );
  } else if (query.isError) {
    content = <ErrorState onRetry={() => void query.refetch()} />;
  } else if (query.data.cells.length === 0) {
    content = (
      <EmptyState
        icon={Grid3X3}
        title="Organizator nie dodał jeszcze zadań"
        description="Zajrzyj tu za chwilę – plansza bingo pojawi się, gdy tylko będą gotowe zadania."
      />
    );
  } else {
    const board = query.data;
    const total = board.cells.length;
    content = (
      <>
        <div className="flex flex-col gap-6 px-5 pt-5 tracking-[-0.01em]">
          <div className="relative overflow-hidden rounded-[23px] bg-[linear-gradient(221deg,var(--mobile-accent)_0%,color-mix(in_srgb,var(--mobile-accent)_80%,#000)_100%)] p-5 text-[var(--mobile-accent-foreground)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[var(--mobile-accent-muted)]">
                Bingo
              </span>
              <span className="rounded-[22px] bg-[color-mix(in_srgb,var(--mobile-accent-foreground)_16%,transparent)] px-1.5 py-1 text-[10px] font-semibold">
                Linie: {board.bingoLines}
              </span>
            </div>
            <p className="mt-3 text-base leading-[1.3] font-semibold">
              Zaliczone: {board.completedCount}/{total}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--mobile-accent-foreground)_16%,transparent)]">
              <div
                className="h-full rounded-full bg-[var(--mobile-accent-foreground)] transition-all"
                style={{
                  width: `${String((board.completedCount / total) * 100)}%`,
                }}
              />
            </div>
          </div>
          {board.hasBingo ? (
            <div className="flex items-center gap-4 rounded-[32px] bg-[var(--mobile-accent)] px-6 py-5 text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]">
              <PartyPopper className="size-8 shrink-0 animate-bounce" />
              <div>
                <p className="text-2xl leading-[1.1] font-black tracking-wide">
                  BINGO!
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--mobile-accent-muted)]">
                  {board.bingoLines === 1
                    ? "Masz pełną linię!"
                    : `Masz ${String(board.bingoLines)} pełne linie!`}
                </p>
              </div>
            </div>
          ) : null}
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${String(board.size)}, minmax(0, 1fr))`,
            }}
          >
            {board.cells.map((cell) => (
              <button
                key={cell.taskUuid}
                type="button"
                onClick={() => {
                  setSelected(cell.taskUuid);
                }}
                className={cn(
                  "relative flex aspect-square items-center justify-center overflow-hidden p-1 text-center leading-tight font-semibold transition-transform active:scale-95",
                  board.size >= 5
                    ? "rounded-[17px] text-[9px]"
                    : "rounded-[20px] text-[11px]",
                  cell.completed
                    ? "bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)]"
                    : "bg-card text-foreground",
                )}
              >
                {cell.completed && cell.photoUrl !== null ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cell.photoUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover opacity-30"
                  />
                ) : null}
                <span className="relative line-clamp-5 break-words hyphens-auto">
                  {cell.text}
                </span>
                {cell.completed ? (
                  <Check
                    className="bg-primary text-primary-foreground absolute top-1 right-1 size-4 rounded-full p-0.5"
                    strokeWidth={4}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <Leaderboard />
        <CellSheet
          cell={selectedCell}
          onClose={() => {
            setSelected(null);
          }}
        />
      </>
    );
  }

  return (
    <MobileScreen title="Bingo" backHref={`/${eventSlug}/app`}>
      {content}
    </MobileScreen>
  );
}
