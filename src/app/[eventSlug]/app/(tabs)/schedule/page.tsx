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

  const { days, currentUuid, nextUuid } = useMemo(() => {
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
    let current: string | null = null;
    let next: string | null = null;
    for (const item of items) {
      const start = new Date(item.startsAt).getTime();
      const end =
        item.endsAt === null
          ? start + 60 * 60_000
          : new Date(item.endsAt).getTime();
      if (start <= now && now < end) {
        current ??= item.uuid;
      } else if (start > now && next === null) {
        next = item.uuid;
      }
    }
    return { days: grouped, currentUuid: current, nextUuid: next };
  }, [schedule.data, now]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const activeGroup =
    days.find((group) => group.day.toDateString() === selectedDay) ??
    days.find((group) => isToday(group.day)) ??
    days.find((group) =>
      group.items.some(
        (item) => item.uuid === currentUuid || item.uuid === nextUuid,
      ),
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
            <section>
              <h2 className="mb-4 text-base leading-[1.2] font-semibold first-letter:uppercase">
                {format(activeGroup.day, "EEEE, d MMMM", { locale: pl })}
              </h2>
              <ol className="bg-card flex flex-col gap-3 rounded-[32px] px-4 py-5">
                {activeGroup.items.map((item, index) => {
                  const isCurrent = item.uuid === currentUuid;
                  const isNext = item.uuid === nextUuid;
                  const start = new Date(item.startsAt);
                  const previous = activeGroup.items.at(index - 1);
                  const showNowLine =
                    isToday(activeGroup.day) &&
                    start.getTime() > now &&
                    (index === 0 ||
                      (previous !== undefined &&
                        new Date(previous.startsAt).getTime() <= now));
                  return (
                    <li key={item.uuid} className="flex flex-col gap-3">
                      {showNowLine ? (
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
                      ) : null}
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
              </ol>
            </section>
          )}
        </div>
      )}
    </MobileTabPage>
  );
}
