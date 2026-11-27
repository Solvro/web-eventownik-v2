"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Clock,
  Loader2,
  Lock,
  RefreshCw,
  SmilePlus,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { MobileAvatar } from "@/components/mobile/avatar";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { useEventSlug } from "@/components/mobile/use-event-slug";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MobileApiError, mobileApi, mobileKeys } from "@/lib/mobile/client";
import { downscaleImage } from "@/lib/mobile/image";
import { cn } from "@/lib/utils";
import type {
  MobileBerealPost,
  MobileBerealRound,
  MobileBerealState,
} from "@/types/mobile";

import { EmptyState, ErrorState, Skeleton } from "./states";
import { clockTime } from "./time";
import { useObjectUrl } from "./use-object-url";

const MAX_CAPTION = 200;

function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = globalThis.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => {
      globalThis.clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}

function Countdown({ round }: { round: MobileBerealRound }) {
  const now = useNow();
  const remaining = new Date(round.endsAt).getTime() - now;
  if (remaining <= 0) {
    return (
      <div className="flex items-center gap-2 rounded-3xl bg-white/10 px-4 py-3 text-sm leading-5 font-semibold text-white">
        <Clock className="size-4 shrink-0 text-[var(--mobile-accent)]" />
        Czas minął – możesz jeszcze wrzucić zdjęcie jako spóźniony
      </div>
    );
  }
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return (
    <div className="flex items-end justify-between gap-3">
      <span className="pb-1.5 text-xs font-semibold text-white/60">
        Pozostało
      </span>
      <span
        className={cn(
          "text-5xl leading-none font-extrabold tracking-[-0.02em] tabular-nums",
          totalSeconds <= 60
            ? "text-[var(--mobile-danger)]"
            : "text-[var(--mobile-accent)]",
        )}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function DualPhoto({
  photoUrl,
  selfieUrl,
  alt,
}: {
  photoUrl: string;
  selfieUrl: string | null;
  alt: string;
}) {
  const [swapped, setSwapped] = useState(false);
  const main = swapped && selfieUrl !== null ? selfieUrl : photoUrl;
  const inset = swapped ? photoUrl : selfieUrl;
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[32px] bg-[#F4F4F4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={main}
        alt={alt}
        loading="lazy"
        className="size-full object-cover"
      />
      {inset === null ? null : (
        <button
          type="button"
          aria-label="Zamień zdjęcia"
          onClick={() => {
            setSwapped((value) => !value);
          }}
          className="absolute top-4 left-4 aspect-[3/4] w-[30%] overflow-hidden rounded-[17px] border-[3px] border-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={inset}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        </button>
      )}
    </div>
  );
}

function CaptureFlow({
  round,
  isActive,
}: {
  round: MobileBerealRound;
  isActive: boolean;
}) {
  const eventSlug = useEventSlug();
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const photoUrl = useObjectUrl(photo);
  const selfieUrl = useObjectUrl(selfie);

  const mutation = useMutation({
    mutationFn: async () => {
      if (photo === null) {
        throw new Error("missing photo");
      }
      const body = new FormData();
      body.append("photo", await downscaleImage(photo), "photo.jpg");
      if (selfie !== null) {
        body.append("selfie", await downscaleImage(selfie), "selfie.jpg");
      }
      if (caption.trim() !== "") {
        body.append("caption", caption.trim());
      }
      return mobileApi<MobileBerealPost>(
        eventSlug,
        `bereal/rounds/${encodeURIComponent(round.uuid)}/posts`,
        { method: "POST", body },
      );
    },
    onSuccess: async () => {
      toast({ title: "Wrzucone! 📸" });
      await queryClient.invalidateQueries({
        queryKey: mobileKeys.bereal(eventSlug),
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title:
          error instanceof MobileApiError && error.status === 409
            ? "Już wrzuciłeś zdjęcie w tej rundzie"
            : "Nie udało się wrzucić zdjęcia",
      });
      if (error instanceof MobileApiError && error.status === 409) {
        void queryClient.invalidateQueries({
          queryKey: mobileKeys.bereal(eventSlug),
        });
      }
    },
  });

  return (
    <div className="flex flex-col gap-4 px-5 pt-5 tracking-[-0.01em]">
      <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(221deg,#262626_0%,#343434_100%)] p-6 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-[var(--mobile-accent)] opacity-30 blur-[40px]"
        />
        <div className="relative flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <Zap
              className="size-3.5 text-[var(--mobile-accent)]"
              fill="currentColor"
            />
            {isActive ? "Czas na BeReal!" : "Runda zakończona"}
          </p>
          <span className="rounded-[22px] bg-[#2D2D2D] px-1.5 py-1 text-[10px] font-semibold">
            {isActive ? "Twoja kolej" : "Po czasie"}
          </span>
        </div>
        <p className="relative mt-3 text-xl leading-[1.3] font-semibold">
          {round.prompt ?? "Pokaż, co teraz robisz!"}
        </p>
        <div className="relative mt-5">
          <Countdown round={round} />
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          setPhoto(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <input
        ref={selfieInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(event) => {
          setSelfie(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      {photoUrl === null ? (
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-[32px] bg-[#F8F8F8] text-[#121212] transition active:scale-[0.99]"
        >
          <span className="flex size-20 items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]">
            <Camera className="size-9" />
          </span>
          <span className="text-base font-semibold">Zrób zdjęcie</span>
          <span className="text-muted-foreground text-sm font-medium">
            Najpierw to, co widzisz przed sobą
          </span>
        </button>
      ) : (
        <>
          <div className="relative">
            <DualPhoto
              photoUrl={photoUrl}
              selfieUrl={selfieUrl}
              alt="Podgląd"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="absolute right-4 bottom-4 flex min-h-10 items-center gap-1.5 rounded-[22px] bg-black/60 px-4 text-xs font-semibold text-white backdrop-blur-sm"
            >
              <RefreshCw className="size-3.5" />
              Zmień zdjęcie
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => selfieInputRef.current?.click()}
            className="h-14 rounded-3xl border-[#E4E4E4] text-base font-semibold"
          >
            <SmilePlus />
            {selfie === null ? "Dodaj selfie (opcjonalnie)" : "Zmień selfie"}
          </Button>
          <div>
            <input
              value={caption}
              onChange={(event) => {
                setCaption(event.target.value.slice(0, MAX_CAPTION));
              }}
              maxLength={MAX_CAPTION}
              placeholder="Dodaj podpis (opcjonalnie)"
              aria-label="Podpis"
              className="h-14 w-full rounded-3xl bg-[#F4F4F4] px-5 text-base font-medium outline-none placeholder:text-[#868686] focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)]"
            />
          </div>
          <Button
            disabled={mutation.isPending}
            onClick={() => {
              mutation.mutate();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-[60px] rounded-3xl text-base font-semibold tracking-[0.01em]"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : null}
            {isActive ? "Wrzuć" : "Wrzuć (spóźniony)"}
          </Button>
        </>
      )}
    </div>
  );
}

function LockedFeed() {
  return (
    <div className="relative mx-5 mt-8 overflow-hidden rounded-[32px] bg-[#F8F8F8]">
      <div className="grid grid-cols-2 gap-2 blur-xl" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="aspect-[3/4] rounded-3xl bg-[linear-gradient(221deg,#262626_0%,var(--mobile-accent)_100%)] opacity-60"
          />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-full">
          <Lock className="size-6" />
        </span>
        <p className="text-base leading-[1.2] font-semibold">
          Wrzuć swoje zdjęcie, żeby zobaczyć innych
        </p>
      </div>
    </div>
  );
}

function Feed({ round }: { round: MobileBerealRound }) {
  const eventSlug = useEventSlug();
  const query = useQuery({
    queryKey: mobileKeys.berealPosts(eventSlug, round.uuid),
    queryFn: async () =>
      mobileApi<MobileBerealPost[]>(
        eventSlug,
        `bereal/rounds/${encodeURIComponent(round.uuid)}/posts`,
      ),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  if (query.isPending) {
    return (
      <div className="space-y-6 px-5 pt-8">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton
            key={index}
            className="aspect-[3/4] w-full rounded-[32px]"
          />
        ))}
      </div>
    );
  }
  if (query.isError) {
    if (query.error instanceof MobileApiError && query.error.status === 403) {
      return <LockedFeed />;
    }
    return <ErrorState onRetry={() => void query.refetch()} />;
  }
  if (query.data.length === 0) {
    return (
      <p className="text-muted-foreground px-5 py-10 text-center text-sm font-medium">
        Nikt jeszcze nie wrzucił zdjęcia w tej rundzie.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4 px-5 pt-8 pb-8 tracking-[-0.01em]">
      {query.data.map((post) => (
        <article
          key={post.uuid}
          className="flex flex-col gap-4 rounded-[32px] bg-[#F8F8F8] p-4"
        >
          <header className="flex items-center gap-3 px-2 pt-2">
            <MobileAvatar person={post.author} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base leading-[1.2] font-semibold">
                {post.isMine ? "Ty" : post.author.displayName}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                {clockTime(post.createdAt)}
              </p>
            </div>
            {post.isLate ? (
              <span className="rounded-[22px] bg-[var(--mobile-accent)] px-1.5 py-1 text-[10px] font-semibold text-[var(--mobile-accent-foreground)]">
                Spóźniony
              </span>
            ) : null}
          </header>
          <DualPhoto
            photoUrl={post.photoUrl}
            selfieUrl={post.selfieUrl}
            alt={`Zdjęcie: ${post.author.displayName}`}
          />
          {post.caption === null || post.caption === "" ? null : (
            <p className="px-2 pb-2 text-base leading-6 font-medium">
              {post.caption}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

export function BerealScreen() {
  const eventSlug = useEventSlug();
  const query = useQuery({
    queryKey: mobileKeys.bereal(eventSlug),
    queryFn: async () => mobileApi<MobileBerealState>(eventSlug, "bereal"),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  let content: React.ReactNode;
  if (query.isPending) {
    content = (
      <div className="space-y-4 px-5 pt-5">
        <Skeleton className="h-44 w-full rounded-[32px]" />
        <Skeleton className="aspect-[3/4] w-full rounded-[32px]" />
      </div>
    );
  } else if (query.isError) {
    content = <ErrorState onRetry={() => void query.refetch()} />;
  } else if (query.data.round === null) {
    content = (
      <EmptyState
        icon={Camera}
        title="Jeszcze nie było rundy"
        description="Gdy organizator ogłosi BeReal, dostaniesz kilka minut na zdjęcie tego, co akurat robisz. Bądź gotowy!"
      />
    );
  } else {
    const { round, myPost, canViewFeed, isActive } = query.data;
    content = (
      <div className="flex flex-col">
        {myPost === null ? (
          <CaptureFlow round={round} isActive={isActive} />
        ) : (
          <div className="px-5 pt-5">
            <div className="rounded-[32px] bg-[linear-gradient(221deg,#262626_0%,#343434_100%)] p-6 text-white">
              <p className="text-xs font-semibold text-white/70">BeReal</p>
              <p className="mt-2 text-base leading-[1.3] font-semibold">
                {round.prompt ?? "BeReal"}
              </p>
            </div>
          </div>
        )}
        {canViewFeed || myPost !== null ? (
          <Feed round={round} />
        ) : (
          <LockedFeed />
        )}
      </div>
    );
  }

  return (
    <MobileScreen title="BeReal" backHref={`/${eventSlug}/app`}>
      {content}
    </MobileScreen>
  );
}
