"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Bell,
  Camera,
  ChevronRight,
  Clock,
  Flame,
  Grid3x3,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useMobile } from "@/components/mobile/mobile-context";
import { MobilePushPrompt } from "@/components/mobile/push-prompt";
import {
  MobileEmptyState,
  MobileErrorState,
  MobileHeaderGlow,
  MobileListSkeleton,
  MobileSectionHeading,
} from "@/components/mobile/tab-page";
import { useMobileMe } from "@/components/mobile/use-me";
import { mobileApi, mobileKeys } from "@/lib/mobile/client";
import { cn } from "@/lib/utils";
import type {
  MobileFeatures,
  MobileNotification,
  MobileScheduleItem,
} from "@/types/mobile";

const HOUR_MS = 60 * 60_000;
const HOUR_PX = 44;
const BLOCK_MIN_PX = 76;

function itemEnd(item: MobileScheduleItem): number {
  return item.endsAt === null
    ? new Date(item.startsAt).getTime() + HOUR_MS
    : new Date(item.endsAt).getTime();
}

function floorHour(time: number): number {
  const date = new Date(time);
  date.setMinutes(0, 0, 0);
  return date.getTime();
}

/** Compact day timeline with the current/next schedule items and the red now-line */
/**
 * Where an announcement leads when tapped. Only known screens of features that
 * are switched on; anything else stays a plain announcement.
 */
function notificationTarget(
  link: string | null,
  features: MobileFeatures,
): { path: string; label: string } | null {
  if (link === "bereal" && features.bereal) {
    return { path: "bereal", label: "Otwórz BeerReal" };
  }
  return null;
}

function UpcomingTimeline({
  items,
  now,
}: {
  items: MobileScheduleItem[];
  now: number;
}) {
  const first = items[0];
  const anchor = new Date(first.startsAt).getTime();
  const rangeStart = floorHour(
    now < anchor && anchor - now < 2 * HOUR_MS ? now : anchor,
  );
  const lastEnd = Math.max(...items.map((item) => itemEnd(item)));
  const hours = Math.min(
    6,
    Math.max(3, Math.ceil((lastEnd - rangeStart) / HOUR_MS)),
  );
  const labels = Array.from(
    { length: hours + 1 },
    (_, index) => rangeStart + index * HOUR_MS,
  );

  let previousBottom = -Infinity;
  const blocks = items.map((item) => {
    const start = new Date(item.startsAt).getTime();
    const ideal = ((start - rangeStart) / HOUR_MS) * HOUR_PX + 6;
    const top = Math.max(ideal, previousBottom + 6);
    const height = Math.max(
      ((itemEnd(item) - start) / HOUR_MS) * HOUR_PX - 4,
      BLOCK_MIN_PX,
    );
    previousBottom = top + height;
    return { item, top, height };
  });
  const canvasHeight = Math.max(hours * HOUR_PX + 12, previousBottom + 6);
  const nowTop = ((now - rangeStart) / HOUR_MS) * HOUR_PX + 6;
  const showNow = now >= rangeStart && nowTop <= canvasHeight;

  return (
    <div className="relative" style={{ height: canvasHeight }}>
      {labels.map((label, index) => (
        <div
          key={label}
          className="absolute inset-x-0 flex items-center gap-2"
          style={{ top: index * HOUR_PX }}
        >
          <span className="text-muted-foreground w-10 shrink-0 text-xs leading-[1.2] font-semibold">
            {format(label, "HH:mm")}
          </span>
          <span className="bg-border h-px flex-1" />
        </div>
      ))}
      {blocks.map(({ item, top, height }) => (
        <div
          key={item.uuid}
          className="absolute right-0 left-12 flex flex-col gap-1.5 overflow-hidden rounded-[17px] bg-[var(--mobile-accent)] px-[18px] py-3.5 text-[var(--mobile-accent-foreground)]"
          style={{ top, minHeight: height }}
        >
          <p className="truncate text-sm leading-[1.2] font-semibold">
            {item.title}
          </p>
          {item.location === null ? null : (
            <p className="flex items-center gap-1 text-xs leading-[1.2] font-medium text-[var(--mobile-accent-muted)]">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
          )}
          <p className="flex items-center gap-1 text-xs leading-[1.2] font-medium text-[var(--mobile-accent-muted)]">
            <Clock className="size-3.5 shrink-0" />
            {format(new Date(item.startsAt), "HH:mm")}
            {item.endsAt === null
              ? null
              : ` - ${format(new Date(item.endsAt), "HH:mm")}`}
          </p>
        </div>
      ))}
      {showNow ? (
        <div
          aria-label="Teraz"
          className="pointer-events-none absolute right-0 left-9 z-10 flex items-center"
          style={{ top: nowTop - 4 }}
        >
          <span className="size-2 shrink-0 rounded-full bg-[#FF0000]" />
          <span className="h-px flex-1 bg-[#FF0000]" />
        </div>
      ) : null}
    </div>
  );
}

function readSeenSeq(key: string): number {
  try {
    const value = Number(globalThis.localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeSeenSeq(key: string, value: number) {
  try {
    globalThis.localStorage.setItem(key, String(value));
  } catch {
    // storage unavailable (private mode) — unread markers just won't persist
  }
}

export default function MobileHomePage() {
  const { eventSlug, config } = useMobile();
  // A photo that fails to load falls back to the same block as "no photo"
  const [photoFailed, setPhotoFailed] = useState(false);
  const me = useMobileMe(eventSlug);
  const features = config.app.features;
  const storageKey = `mobile-seen-seq-${eventSlug}`;
  const [seenSeq, setSeenSeq] = useState<number | null>(null);

  const notifications = useQuery({
    queryKey: mobileKeys.notifications(eventSlug),
    queryFn: async () =>
      mobileApi<MobileNotification[]>(eventSlug, "notifications"),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const schedule = useQuery({
    queryKey: mobileKeys.schedule(eventSlug),
    queryFn: async () => mobileApi<MobileScheduleItem[]>(eventSlug, "schedule"),
    enabled: features.schedule,
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setSeenSeq(readSeenSeq(storageKey));
  }, [storageKey]);

  /** The current item(s) plus the next one, all on the same day as the first */
  const upcoming = useMemo(() => {
    const items = (schedule.data ?? [])
      .filter((item) => itemEnd(item) > now)
      .toSorted(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
    const first = items.at(0);
    if (first === undefined) {
      return [];
    }
    const day = new Date(first.startsAt).toDateString();
    const current = items.filter(
      (item) => new Date(item.startsAt).getTime() <= now,
    );
    const next = items.find((item) => new Date(item.startsAt).getTime() > now);
    return [...current.slice(0, 2), ...(next === undefined ? [] : [next])]
      .filter((item) => new Date(item.startsAt).toDateString() === day)
      .slice(0, 3);
  }, [schedule.data, now]);

  const maxSeq = useMemo(
    () =>
      (notifications.data ?? []).reduce(
        (max, item) => Math.max(max, item.seq),
        0,
      ),
    [notifications.data],
  );

  // Mark everything as seen a moment after it was shown, keeping the markers visible for this visit
  useEffect(() => {
    if (maxSeq === 0) {
      return;
    }
    const timer = setTimeout(() => {
      writeSeenSeq(storageKey, maxSeq);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, [maxSeq, storageKey]);

  const cards = [
    {
      key: "bereal",
      enabled: features.bereal,
      eyebrow: "BeerReal",
      title: "Pstryknij fotę i znajdź znajomych.",
      badge: "Pstryk",
      icon: Camera,
      className: "bg-[linear-gradient(221deg,#262626_0%,#343434_100%)]",
      eyebrowClassName: "text-white",
      badgeClassName: "bg-[#3D3D3D] text-white",
      iconClassName: "bg-white/10 text-white",
    },
    {
      key: "bingo",
      enabled: features.bingo,
      eyebrow: "Bingo",
      title: "Graj, skreślaj i łap wygraną.",
      badge: "Graj",
      icon: Grid3x3,
      // Follows the event colour (the design shows it in the sample event's yellow)
      className:
        "bg-[linear-gradient(221deg,var(--mobile-accent)_0%,color-mix(in_srgb,var(--mobile-accent)_80%,#000)_100%)] text-[var(--mobile-accent-foreground)]",
      eyebrowClassName: "text-[var(--mobile-accent-muted)]",
      badgeClassName:
        "bg-[color-mix(in_srgb,var(--mobile-accent-foreground)_16%,transparent)] text-[var(--mobile-accent-foreground)]",
      iconClassName:
        "bg-[color-mix(in_srgb,var(--mobile-accent-foreground)_16%,transparent)] text-[var(--mobile-accent-foreground)]",
    },
    {
      key: "tinder",
      enabled: features.tinder,
      eyebrow: "Tinderownik",
      title: "Przesuwaj i poznaj innych uczestników.",
      badge: "Poznaj",
      icon: Flame,
      className: "bg-[linear-gradient(221deg,#F25C6B_0%,#E8455A_100%)]",
      eyebrowClassName: "text-[#FFE1E5]",
      badgeClassName: "bg-[rgba(255,214,220,0.35)] text-white",
      iconClassName: "bg-white/20 text-white",
    },
  ].filter((card) => card.enabled);

  const name = me.data?.profile?.displayName;
  const base = `/${eventSlug}/app`;
  const firstUpcoming = upcoming.at(0);
  const upcomingDay =
    firstUpcoming === undefined ? null : new Date(firstUpcoming.startsAt);

  return (
    <div className="relative flex flex-col gap-8 px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <MobileHeaderGlow />

      <header className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 truncate text-base leading-[1.2] font-semibold">
            <span className="text-[#414141] dark:text-[#C4C4C4]">Cześć</span>
            {name === undefined ? "" : `, ${name}`} 👋🏼
          </p>
          <div className="flex shrink-0 items-center gap-4">
            {features.chat ? (
              <Link
                href={`${base}/chats`}
                aria-label="Czaty"
                className="flex size-6 items-center justify-center"
              >
                <MessageCircle className="size-6" strokeWidth={1.8} />
              </Link>
            ) : null}
            <Link
              href={`${base}/profile`}
              aria-label="Profil"
              className="flex size-6 items-center justify-center"
            >
              <UserRound className="size-6" strokeWidth={1.8} />
            </Link>
          </div>
        </div>

        {config.event.photoUrl === null || photoFailed ? (
          <div className="flex h-[245px] w-full items-center justify-center rounded-[36px] bg-[var(--mobile-accent)] px-8 text-center">
            <span className="line-clamp-3 text-3xl leading-[1.1] font-extrabold text-[var(--mobile-accent-foreground)]">
              {config.event.name}
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.event.photoUrl}
            alt=""
            className="bg-secondary h-[245px] w-full rounded-[36px] object-cover"
            onError={() => {
              setPhotoFailed(true);
            }}
          />
        )}

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl leading-[1.2] font-bold">
            {config.event.name}
          </h1>
          {config.app.welcomeMessage === null ? null : (
            <p className="text-muted-foreground text-base leading-6 font-medium whitespace-pre-line">
              {config.app.welcomeMessage}
            </p>
          )}
        </div>
      </header>

      {features.schedule && upcoming.length > 0 && upcomingDay !== null ? (
        <section>
          <MobileSectionHeading
            action={
              <Link
                href={`${base}/schedule`}
                className="text-muted-foreground text-xs leading-[1.2] font-semibold"
              >
                Cały harmonogram→
              </Link>
            }
          >
            Nadchodzące wydarzenie
          </MobileSectionHeading>
          <Link
            href={`${base}/schedule`}
            className="bg-card block rounded-[32px] px-6 py-4"
          >
            {isToday(upcomingDay) ? null : (
              <p className="text-muted-foreground mb-3 text-xs leading-[1.2] font-semibold first-letter:uppercase">
                {isTomorrow(upcomingDay)
                  ? "Jutro"
                  : format(upcomingDay, "EEEE, d MMMM", { locale: pl })}
              </p>
            )}
            <UpcomingTimeline items={upcoming} now={now} />
          </Link>
        </section>
      ) : null}

      <MobilePushPrompt />

      <section>
        <MobileSectionHeading>Ogłoszenia</MobileSectionHeading>
        {notifications.isPending ? (
          <MobileListSkeleton />
        ) : notifications.isError ? (
          <MobileErrorState
            onRetry={() => {
              void notifications.refetch();
            }}
          />
        ) : notifications.data.length === 0 ? (
          <MobileEmptyState
            icon={<Bell />}
            title="Brak ogłoszeń"
            description="Tu pojawią się wiadomości od organizatorów."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {notifications.data.map((item) => {
              const unread = seenSeq !== null && item.seq > seenSeq;
              const target = notificationTarget(item.link, features);
              return (
                <li
                  key={item.uuid}
                  className={cn(
                    "bg-card relative flex flex-col gap-3 rounded-[32px] p-6",
                    unread && "ring-2 ring-[var(--mobile-accent)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-muted-foreground text-xs leading-[1.2] font-semibold">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: pl,
                      })}
                    </p>
                    {unread ? (
                      <span className="rounded-[22px] bg-[var(--mobile-accent)] px-1.5 py-1 text-[10px] leading-none font-semibold tracking-normal text-[var(--mobile-accent-foreground)]">
                        Nowe
                      </span>
                    ) : null}
                  </div>
                  <div className="text-foreground text-base leading-6 font-medium">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-2 whitespace-pre-line">{item.body}</p>
                  </div>
                  {target === null ? null : (
                    <Link
                      href={`${base}/${target.path}`}
                      className="bg-primary text-primary-foreground flex h-11 w-fit items-center gap-2 rounded-3xl px-5 text-sm font-semibold tracking-[0.01em] transition after:absolute after:inset-0 after:rounded-[32px] active:scale-[0.98]"
                    >
                      {target.label}
                      <ChevronRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {cards.length > 0 ? (
        <section className="pb-4">
          <MobileSectionHeading>Gry i zabawy</MobileSectionHeading>
          <div
            className={cn(
              "flex gap-2",
              cards.length > 2 &&
                "-mx-5 snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 [scrollbar-width:none]",
            )}
          >
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.key}
                  href={`${base}/${card.key}`}
                  className={cn(
                    "relative flex h-[191px] snap-start flex-col justify-between overflow-hidden rounded-[23px] p-4 text-white transition active:scale-[0.98]",
                    cards.length > 2 ? "w-[177px] shrink-0" : "flex-1",
                    card.className,
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-14 items-center justify-center rounded-full",
                        card.iconClassName,
                      )}
                    >
                      <Icon className="size-7" strokeWidth={1.8} />
                    </span>
                    <span
                      className={cn(
                        "rounded-[22px] px-1.5 py-1 text-[10px] leading-none font-semibold tracking-normal",
                        card.badgeClassName,
                      )}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "text-xs leading-[1.2] font-semibold",
                        card.eyebrowClassName,
                      )}
                    >
                      {card.eyebrow}
                    </span>
                    <span className="text-base leading-[1.3] font-semibold">
                      {card.title}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
