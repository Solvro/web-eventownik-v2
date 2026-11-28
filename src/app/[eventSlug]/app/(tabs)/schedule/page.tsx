"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, isToday } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useMobile } from "@/components/mobile/mobile-context";
import {
  MobileEmptyState,
  MobileErrorState,
  MobileListSkeleton,
  MobileTabPage,
} from "@/components/mobile/tab-page";
import { mobileApi, mobileKeys } from "@/lib/mobile/client";
import { cn } from "@/lib/utils";
import type { MobileScheduleItem } from "@/types/mobile";

export default function MobileSchedulePage() {
  const { eventSlug } = useMobile();
  const [now, setNow] = useState(() => Date.now());
  const schedule = useQuery({
    queryKey: mobileKeys.schedule(eventSlug),
    queryFn: async () => mobileApi<MobileScheduleItem[]>(eventSlug, "schedule"),
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const { days, current, next } = useMemo(() => {
    const items = (schedule.data ?? []).toSorted(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
    const grouped: { day: Date; items: MobileScheduleItem[] }[] = [];
    for (const item of items) {
      const start = new Date(item.startsAt);
      const last = grouped.at(-1);
      if (last !== undefined && isSameDay(last.day, start)) {
        last.items.push(item);
      } else {
        grouped.push({ day: start, items: [item] });
      }
    }
    // Everything happening right now is "Teraz", not just the first one
    const ongoing = new Set<string>();
    const upcoming = new Set<string>();
    let nextStart: number | null = null;
    for (const item of items) {
      const start = new Date(item.startsAt).getTime();
      if (start <= now && now < endOf(item)) {
        ongoing.add(item.uuid);
      } else if (start > now && (nextStart === null || start === nextStart)) {
        nextStart = start;
        upcoming.add(item.uuid);
      }
    }
    return { days: grouped, current: ongoing, next: upcoming };
  }, [schedule.data, now]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const activeGroup =
    days.find((group) => group.day.toDateString() === selectedDay) ??
    days.find((group) => isToday(group.day)) ??
    days.find((group) =>
      group.items.some((item) => current.has(item.uuid) || next.has(item.uuid)),
    ) ??
    days.at(0);

  return (
    <MobileTabPage title="Harmonogram">
      {schedule.isPending ? (
        <MobileListSkeleton rows={5} />
      ) : schedule.isError ? (
        <MobileErrorState
          onRetry={() => {
            void schedule.refetch();
          }}
        />
      ) : days.length === 0 ? (
        <MobileEmptyState
          icon={<CalendarDays />}
          title="Harmonogram jest pusty"
          description="Organizatorzy jeszcze go nie opublikowali."
        />
      ) : (
        <div className="flex flex-col gap-6 pb-4">
          {days.length > 1 ? (
            <div
              role="tablist"
              aria-label="Dni"
              className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]"
            >
              {days.map((group) => {
                const selected = group === activeGroup;
                return (
                  <button
                    key={group.day.toISOString()}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setSelectedDay(group.day.toDateString());
                    }}
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center gap-1 rounded-3xl py-3 transition",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground",
                    )}
                  >
                    <span className="text-xl leading-none font-bold">
                      {format(group.day, "d")}
                    </span>
                    <span
                      className={cn(
                        "text-xs leading-none font-semibold",
                        selected
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {format(group.day, "LLL", { locale: pl })}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
          {activeGroup === undefined ? null : (
            <ScheduleDay
              group={activeGroup}
              now={now}
              current={current}
              next={next}
            />
          )}
        </div>
      )}
    </MobileTabPage>
  );
}

/** Events without an end time are treated as an hour long */
function endOf(item: MobileScheduleItem): number {
  return item.endsAt === null
    ? new Date(item.startsAt).getTime() + 60 * 60_000
    : new Date(item.endsAt).getTime();
}

function formatLeft(minutes: number): string {
  if (minutes < 60) {
    return `${String(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${String(hours)} godz.`
    : `${String(hours)} godz. ${String(rest)} min`;
}

/** How far into an ongoing event we are, shown on its card */
function Progress({ item, now }: { item: MobileScheduleItem; now: number }) {
  const start = new Date(item.startsAt).getTime();
  const end = endOf(item);
  const fraction = Math.min(1, Math.max(0, (now - start) / (end - start)));
  const left = Math.max(1, Math.ceil((end - now) / 60_000));
  return (
    <div className="mt-1 flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
        aria-label="Postęp wydarzenia"
        className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--mobile-accent-foreground)]/20"
      >
        <div
          className="h-full rounded-full bg-[var(--mobile-accent-foreground)]"
          style={{ width: `${String(fraction * 100)}%` }}
        />
      </div>
      <span className="shrink-0 text-[11px] leading-none font-semibold text-[var(--mobile-accent-muted)]">
        jeszcze {formatLeft(left)}
      </span>
    </div>
  );
}

/** One day's events, with the "now" line or progress for what is on */
function ScheduleDay({
  group,
  now,
  current,
  next,
}: {
  group: { day: Date; items: MobileScheduleItem[] };
  now: number;
  current: Set<string>;
  next: Set<string>;
}) {
  // The line marks a gap between events; while something is on, its card shows the progress instead
  const nowLineIndex =
    isToday(group.day) && !group.items.some((item) => current.has(item.uuid))
      ? group.items.findIndex((item) => new Date(item.startsAt).getTime() > now)
      : null;
  const nowLine = (
    <div
      aria-label={`Teraz, ${format(now, "HH:mm")}`}
      className="flex items-center"
    >
      <span className="w-12 shrink-0 text-xs leading-[1.2] font-semibold text-[#FF0000]">
        {format(now, "HH:mm")}
      </span>
      <span className="size-2 shrink-0 rounded-full bg-[#FF0000]" />
      <span className="h-px flex-1 bg-[#FF0000]" />
    </div>
  );
  return (
    <section>
      <h2 className="mb-4 text-base leading-[1.2] font-semibold first-letter:uppercase">
        {format(group.day, "EEEE, d MMMM", { locale: pl })}
      </h2>
      <ol className="bg-card flex flex-col gap-3 rounded-[32px] px-4 py-5">
        {group.items.map((item, index) => {
          const isCurrent = current.has(item.uuid);
          const isNext = next.has(item.uuid);
          const start = new Date(item.startsAt);
          return (
            <li key={item.uuid} className="flex flex-col gap-3">
              {index === nowLineIndex ? nowLine : null}
              <div className="flex gap-0">
                <span className="text-muted-foreground w-12 shrink-0 pt-3.5 text-xs leading-[1.2] font-semibold">
                  {format(start, "HH:mm")}
                </span>
                <div
                  className={cn(
                    "flex min-w-0 flex-1 flex-col gap-1.5 rounded-[17px] px-[18px] py-3.5",
                    isCurrent || isNext
                      ? "bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)]"
                      : "border-border bg-background border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-[1.2] font-semibold">
                      {item.title}
                    </p>
                    {isCurrent || isNext ? (
                      <span className="shrink-0 rounded-[22px] bg-[#121212] px-1.5 py-1 text-[10px] leading-none font-semibold tracking-normal text-white">
                        {isCurrent ? "Teraz" : "Następne"}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "flex items-center gap-1 text-xs leading-[1.2] font-medium",
                      isCurrent || isNext
                        ? "text-[var(--mobile-accent-muted)]"
                        : "text-muted-foreground",
                    )}
                  >
                    <Clock className="size-3.5 shrink-0" />
                    {format(start, "HH:mm")}
                    {item.endsAt === null
                      ? null
                      : ` - ${format(new Date(item.endsAt), "HH:mm")}`}
                  </p>
                  {item.location === null ? null : (
                    <p
                      className={cn(
                        "flex items-center gap-1 text-xs leading-[1.2] font-medium",
                        isCurrent || isNext
                          ? "text-[var(--mobile-accent-muted)]"
                          : "text-muted-foreground",
                      )}
                    >
                      <MapPin className="size-3.5 shrink-0" />
                      {item.location}
                    </p>
                  )}
                  {isCurrent && item.endsAt !== null ? (
                    <Progress item={item} now={now} />
                  ) : null}
                  {item.description === null ? null : (
                    <p className="mt-1 text-sm leading-5 font-medium whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {nowLineIndex === -1 ? <li>{nowLine}</li> : null}
      </ol>
    </section>
  );
}
