import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isYesterday,
} from "date-fns";
import { pl } from "date-fns/locale";

export function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) {
    return "teraz";
  }
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "wczoraj";
  }
  if (differenceInCalendarDays(new Date(), date) < 7) {
    return format(date, "EEE", { locale: pl });
  }
  return format(date, "d MMM", { locale: pl });
}

export function dayLabel(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) {
    return "Dzisiaj";
  }
  if (isYesterday(date)) {
    return "Wczoraj";
  }
  return format(date, "EEEE, d MMMM", { locale: pl });
}

export function clockTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function timeAgo(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), {
    locale: pl,
    addSuffix: true,
  });
}
