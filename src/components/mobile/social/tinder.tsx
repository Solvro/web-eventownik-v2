"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  HeartCrack,
  Loader2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { MobileAvatar } from "@/components/mobile/avatar";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { useEventSlug } from "@/components/mobile/use-event-slug";
import { useMobileMe } from "@/components/mobile/use-me";
import { toast } from "@/hooks/use-toast";
import { MobileApiError, mobileApi, mobileKeys } from "@/lib/mobile/client";
import { cn } from "@/lib/utils";
import type {
  MobileMe,
  MobileProfile,
  MobileSwipeResult,
  MobileTinderCandidate,
  MobileTinderMatch,
} from "@/types/mobile";

import { EmptyState, ErrorState, Skeleton } from "./states";
import { timeAgo } from "./time";

const SWIPE_THRESHOLD = 110;
const FLY_OUT_MS = 280;
const LOW_STACK = 3;

function gradientFor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 360;
  }
  // Accent-based gradient, varied per person by the angle and the dark stop
  const angle = 160 + (hash % 80);
  return `linear-gradient(${String(angle)}deg, var(--mobile-accent) 0%, color-mix(in srgb, var(--mobile-accent) 55%, #262626) 100%)`;
}

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

function isNoProfileError(error: unknown): boolean {
  return error instanceof MobileApiError && error.status === 403;
}

function NoProfilePrompt({ eventSlug }: { eventSlug: string }) {
  return (
    <EmptyState
      icon={UserRound}
      title="Najpierw włącz Tinderownika"
      description="Żeby swipować, potrzebujesz profilu z włączoną opcją Tinderownika. Uzupełnij go w zakładce Profil."
    >
      <Link
        href={`/${eventSlug}/app/profile`}
        className="bg-primary text-primary-foreground flex h-[60px] items-center rounded-3xl px-8 text-base font-semibold tracking-[0.01em] transition active:scale-[0.98]"
      >
        Przejdź do profilu
      </Link>
    </EmptyState>
  );
}

/** Shown to participants who have a profile but have not joined Tinderownik yet */
function JoinPrompt({
  profile,
  onJoined,
}: {
  profile: MobileProfile;
  onJoined: () => void;
}) {
  const eventSlug = useEventSlug();
  const queryClient = useQueryClient();
  const [joining, setJoining] = useState(false);

  const join = async () => {
    setJoining(true);
    try {
      await mobileApi<MobileProfile>(eventSlug, "me/profile", {
        method: "PUT",
        json: {
          displayName: profile.displayName,
          bio: profile.bio,
          tinderOptIn: true,
        },
      });
      // Drop refusals remembered from before joining, so the deck starts clean
      queryClient.removeQueries({
        queryKey: mobileKeys.tinderCandidates(eventSlug),
      });
      queryClient.removeQueries({
        queryKey: mobileKeys.tinderMatches(eventSlug),
      });
      onJoined();
      await queryClient.invalidateQueries({
        queryKey: mobileKeys.me(eventSlug),
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Nie udało się dołączyć. Spróbuj ponownie.",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <EmptyState
      icon={Heart}
      title="Dołącz do Tinderownika"
      description="Twój profil (imię, zdjęcie i opis) będzie widoczny dla innych uczestników, którzy też dołączyli. W każdej chwili możesz to wyłączyć w zakładce Profil."
    >
      <button
        type="button"
        disabled={joining}
        onClick={() => {
          void join();
        }}
        className="bg-primary text-primary-foreground flex h-[60px] items-center rounded-3xl px-8 text-base font-semibold tracking-[0.01em] transition active:scale-[0.98] disabled:opacity-60"
      >
        {joining ? "Dołączanie…" : "Dołączam"}
      </button>
    </EmptyState>
  );
}

function CandidateCard({ candidate }: { candidate: MobileTinderCandidate }) {
  return (
    <div className="bg-card relative size-full overflow-hidden rounded-[32px] tracking-[-0.01em] select-none">
      {candidate.photoUrl === null ? (
        <div
          className="flex size-full items-center justify-center text-7xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
          style={{ background: gradientFor(candidate.displayName) }}
        >
          {initialsOf(candidate.displayName)}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidate.photoUrl}
          alt={candidate.displayName}
          draggable={false}
          className="pointer-events-none size-full object-cover"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-6 pt-24 pb-6 text-white">
        <h2 className="text-[28px] leading-[1.2] font-extrabold">
          {candidate.displayName}
        </h2>
        {candidate.bio === null || candidate.bio === "" ? null : (
          <p className="mt-2 line-clamp-4 text-sm leading-5 font-medium text-white/85">
            {candidate.bio}
          </p>
        )}
      </div>
    </div>
  );
}

interface DragState {
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  pointerId: number;
}

function SwipeDeck({ onNoProfile }: { onNoProfile: () => void }) {
  const eventSlug = useEventSlug();
  const queryClient = useQueryClient();
  const [stack, setStack] = useState<MobileTinderCandidate[]>([]);
  const seenRef = useRef(new Set<string>());
  const [drag, setDrag] = useState<DragState | null>(null);
  const [exit, setExit] = useState<{ uuid: string; liked: boolean } | null>(
    null,
  );
  const [match, setMatch] = useState<{
    candidate: MobileTinderCandidate;
    roomUuid: string;
  } | null>(null);

  const candidatesQuery = useQuery({
    queryKey: mobileKeys.tinderCandidates(eventSlug),
    queryFn: async () =>
      mobileApi<MobileTinderCandidate[]>(
        eventSlug,
        "tinder/candidates?limit=20",
      ),
    staleTime: 0,
    retry: (count, error) => !isNoProfileError(error) && count < 2,
  });
  const meQuery = useQuery({
    queryKey: mobileKeys.me(eventSlug),
    queryFn: async () => mobileApi<MobileMe>(eventSlug, "me"),
    staleTime: 60_000,
  });

  useEffect(() => {
    const data = candidatesQuery.data;
    if (data === undefined) {
      return;
    }
    setStack((current) => {
      const inStack = new Set(current.map((item) => item.participantUuid));
      const fresh = data.filter(
        (item) =>
          !inStack.has(item.participantUuid) &&
          !seenRef.current.has(item.participantUuid),
      );
      return fresh.length === 0 ? current : [...current, ...fresh];
    });
  }, [candidatesQuery.data]);

  const noProfile = isNoProfileError(candidatesQuery.error);
  useEffect(() => {
    if (noProfile) {
      onNoProfile();
    }
  }, [noProfile, onNoProfile]);

  const { refetch, isFetching } = candidatesQuery;
  useEffect(() => {
    if (
      stack.length <= LOW_STACK &&
      !isFetching &&
      candidatesQuery.isSuccess &&
      candidatesQuery.data.length > 0
    ) {
      void refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack.length]);

  const sendSwipe = async (
    candidate: MobileTinderCandidate,
    liked: boolean,
  ) => {
    try {
      const result = await mobileApi<MobileSwipeResult>(
        eventSlug,
        "tinder/swipes",
        {
          method: "POST",
          json: { toParticipantUuid: candidate.participantUuid, liked },
        },
      );
      if (result.matched && result.roomUuid !== null) {
        setMatch({ candidate, roomUuid: result.roomUuid });
        void queryClient.invalidateQueries({
          queryKey: mobileKeys.tinderMatches(eventSlug),
        });
        void queryClient.invalidateQueries({
          queryKey: mobileKeys.chatRooms(eventSlug),
        });
      }
    } catch (error) {
      if (isNoProfileError(error)) {
        onNoProfile();
        return;
      }
      toast({
        variant: "destructive",
        title: "Nie udało się zapisać swipe'a",
      });
    }
  };

  const top = stack.at(0);

  const flyOut = (liked: boolean) => {
    if (top === undefined || exit !== null) {
      return;
    }
    seenRef.current.add(top.participantUuid);
    setExit({ uuid: top.participantUuid, liked });
    setDrag(null);
    void sendSwipe(top, liked);
    globalThis.setTimeout(() => {
      setStack((current) =>
        current.filter((item) => item.participantUuid !== top.participantUuid),
      );
      setExit(null);
    }, FLY_OUT_MS);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (exit !== null) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      pointerId: event.pointerId,
    });
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag?.pointerId !== event.pointerId) {
      return;
    }
    setDrag({
      ...drag,
      dx: event.clientX - drag.startX,
      dy: event.clientY - drag.startY,
    });
  };
  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag?.pointerId !== event.pointerId) {
      return;
    }
    if (Math.abs(drag.dx) > SWIPE_THRESHOLD) {
      flyOut(drag.dx > 0);
    } else {
      setDrag(null);
    }
  };

  if (candidatesQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-5 pt-5">
        <Skeleton className="aspect-[3/4] w-full rounded-[32px]" />
        <div className="flex justify-center gap-8">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="size-16 rounded-full" />
        </div>
      </div>
    );
  }
  if (noProfile) {
    return <NoProfilePrompt eventSlug={eventSlug} />;
  }
  if (candidatesQuery.isError && stack.length === 0) {
    return <ErrorState onRetry={() => void candidatesQuery.refetch()} />;
  }

  const dx = drag?.dx ?? 0;
  const dy = drag?.dy ?? 0;
  const likeOpacity = Math.min(Math.max(dx / SWIPE_THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dx / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="flex flex-1 flex-col px-5 pt-5">
      <div className="relative mx-auto aspect-[3/4] max-h-[62dvh] w-full">
        {stack.length === 0 ? (
          <div className="bg-card flex size-full items-center justify-center rounded-[32px]">
            {isFetching ? (
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            ) : (
              <EmptyState
                icon={HeartCrack}
                title="To już wszyscy!"
                description="Przejrzałeś wszystkie profile. Zajrzyj później – mogą pojawić się nowe osoby."
              >
                <button
                  type="button"
                  onClick={() => void candidatesQuery.refetch()}
                  className="border-border bg-background flex h-12 items-center rounded-3xl border px-6 text-sm font-semibold"
                >
                  Odśwież
                </button>
              </EmptyState>
            )}
          </div>
        ) : null}
        {stack
          .slice(0, 3)
          .map((candidate, index) => {
            const isTop = index === 0;
            const isExiting = exit?.uuid === candidate.participantUuid;
            let transform = `scale(${String(1 - index * 0.04)}) translateY(${String(index * 12)}px)`;
            let transition = "transform 250ms ease";
            if (isTop && isExiting) {
              const direction = exit.liked ? 1 : -1;
              transform = `translate(${String(direction * 150)}%, ${String(dy)}px) rotate(${String(direction * 30)}deg)`;
              transition = `transform ${String(FLY_OUT_MS)}ms ease-in`;
            } else if (isTop && drag !== null) {
              transform = `translate(${String(dx)}px, ${String(dy)}px) rotate(${String(dx / 15)}deg)`;
              transition = "none";
            }
            return (
              <div
                key={candidate.participantUuid}
                className={cn(
                  "absolute inset-0 touch-none",
                  isTop ? "cursor-grab active:cursor-grabbing" : "",
                )}
                style={{ transform, transition, zIndex: 10 - index }}
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerEnd : undefined}
                onPointerCancel={isTop ? onPointerEnd : undefined}
              >
                <CandidateCard candidate={candidate} />
                {isTop ? (
                  <>
                    <span
                      className="pointer-events-none absolute top-8 left-6 -rotate-12 rounded-[17px] border-4 border-[var(--mobile-accent)] bg-black/25 px-3 py-1 text-4xl font-black tracking-wider text-[var(--mobile-accent)] backdrop-blur-[2px]"
                      style={{
                        opacity: isExiting && exit.liked ? 1 : likeOpacity,
                      }}
                    >
                      LIKE
                    </span>
                    <span
                      className="pointer-events-none absolute top-8 right-6 rotate-12 rounded-[17px] border-4 border-white bg-black/25 px-3 py-1 text-4xl font-black tracking-wider text-white backdrop-blur-[2px]"
                      style={{
                        opacity: isExiting && !exit.liked ? 1 : nopeOpacity,
                      }}
                    >
                      NOPE
                    </span>
                  </>
                ) : null}
              </div>
            );
          })
          .toReversed()}
      </div>

      <div className="flex items-center justify-center gap-8 py-6">
        <button
          type="button"
          aria-label="Nie"
          disabled={top === undefined}
          onClick={() => {
            flyOut(false);
          }}
          className="border-border bg-card text-foreground flex size-[68px] items-center justify-center rounded-full border transition-transform active:scale-90 disabled:opacity-40"
        >
          <X className="size-8" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Lubię"
          disabled={top === undefined}
          onClick={() => {
            flyOut(true);
          }}
          className="flex size-[68px] items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow),0_8px_24px_var(--mobile-accent-glow)] transition-transform active:scale-90 disabled:opacity-40"
        >
          <Heart className="size-8" fill="currentColor" />
        </button>
      </div>

      {match === null ? null : (
        <div className="animate-in fade-in fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[linear-gradient(221deg,#262626_0%,#343434_100%)] px-6 text-center tracking-[-0.01em] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[18%] mx-auto h-64 w-64 rounded-full bg-[var(--mobile-accent)] opacity-40 blur-[60px]"
          />
          <Sparkles className="relative size-10 text-[var(--mobile-accent)]" />
          <h2 className="relative text-5xl font-black tracking-tight text-[var(--mobile-accent)] italic">
            To match!
          </h2>
          <p className="relative text-base font-medium text-white/80">
            Ty i {match.candidate.displayName} polubiliście się nawzajem.
          </p>
          <div className="relative flex items-center">
            <MobileAvatar
              person={
                meQuery.data?.profile ?? {
                  displayName: "Ty",
                  photoUrl: null,
                }
              }
              size={112}
              className="-rotate-6 border-4 border-white bg-white/20 text-white shadow-2xl"
            />
            <MobileAvatar
              person={match.candidate}
              size={112}
              className="-ml-6 rotate-6 border-4 border-white bg-white/20 text-white shadow-2xl"
            />
          </div>
          <div className="relative flex w-full max-w-xs flex-col gap-4">
            <Link
              href={`/${eventSlug}/app/chats/${match.roomUuid}`}
              className="flex h-[60px] items-center justify-center rounded-3xl bg-[var(--mobile-accent)] px-6 text-base font-semibold tracking-[0.01em] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]"
            >
              Napisz wiadomość
            </Link>
            <button
              type="button"
              onClick={() => {
                setMatch(null);
              }}
              className="flex h-[60px] items-center justify-center rounded-3xl border border-white/30 px-6 text-base font-semibold tracking-[0.01em]"
            >
              Swipuj dalej
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchesList({ onNoProfile }: { onNoProfile: () => void }) {
  const eventSlug = useEventSlug();
  const query = useQuery({
    queryKey: mobileKeys.tinderMatches(eventSlug),
    queryFn: async () =>
      mobileApi<MobileTinderMatch[]>(eventSlug, "tinder/matches"),
    retry: (count, error) => !isNoProfileError(error) && count < 2,
  });
  const noProfile = isNoProfileError(query.error);
  useEffect(() => {
    if (noProfile) {
      onNoProfile();
    }
  }, [noProfile, onNoProfile]);

  if (query.isPending) {
    return (
      <div className="space-y-3 px-5 pt-5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  if (noProfile) {
    return <NoProfilePrompt eventSlug={eventSlug} />;
  }
  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }
  if (query.data.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Jeszcze brak matchy"
        description="Swipuj w prawo osoby, które chcesz poznać. Gdy polubicie się nawzajem, pojawią się tutaj."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-3 px-5 pt-5 pb-8">
      {query.data.map((item) => (
        <li key={item.participantUuid}>
          <Link
            href={`/${eventSlug}/app/chats/${item.roomUuid}`}
            className="bg-secondary flex items-center gap-4 rounded-3xl p-4 tracking-[-0.01em] transition active:scale-[0.99] active:brightness-95"
          >
            <MobileAvatar person={item} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base leading-[1.2] font-bold">
                {item.displayName}
              </p>
              <p className="text-muted-foreground mt-1.5 truncate text-sm font-medium">
                {item.bio === null || item.bio === ""
                  ? `Match ${timeAgo(item.matchedAt)}`
                  : item.bio}
              </p>
            </div>
            <span className="rounded-[22px] bg-[var(--mobile-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--mobile-accent-foreground)]">
              Czat
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TinderScreen() {
  const eventSlug = useEventSlug();
  const [tab, setTab] = useState<"swipe" | "matches">("swipe");
  const [noProfile, setNoProfile] = useState(false);
  const markNoProfile = useRef(() => {
    setNoProfile(true);
  }).current;
  const meQuery = useMobileMe(eventSlug);
  const profile = meQuery.data?.profile ?? null;

  return (
    <MobileScreen title="Tinderownik" backHref={`/${eventSlug}/app`}>
      {meQuery.isPending ? (
        // The deck must not ask for candidates before we know whether the
        // participant has joined; that request would be refused
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : profile !== null && !profile.tinderOptIn ? (
        <JoinPrompt
          profile={profile}
          onJoined={() => {
            setNoProfile(false);
          }}
        />
      ) : noProfile || (meQuery.isSuccess && profile === null) ? (
        <NoProfilePrompt eventSlug={eventSlug} />
      ) : (
        <>
          <div className="px-5 pt-4">
            <div className="bg-secondary grid grid-cols-2 gap-1 rounded-3xl p-1">
              {(
                [
                  ["swipe", "Odkrywaj"],
                  ["matches", "Matche"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTab(value);
                  }}
                  className={cn(
                    "min-h-11 rounded-[20px] text-sm font-semibold tracking-[-0.01em] transition-colors",
                    tab === value
                      ? "bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div
            className={cn(
              "flex flex-1 flex-col",
              tab === "swipe" ? "" : "hidden",
            )}
          >
            <SwipeDeck onNoProfile={markNoProfile} />
          </div>
          {tab === "matches" ? (
            <MatchesList onNoProfile={markNoProfile} />
          ) : null}
        </>
      )}
    </MobileScreen>
  );
}
