export const EVENT_CATEGORIES = [
  "parties",
  "trips",
  "recruitment",
  "educational",
  "sport",
  "volunteering",
  "other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<EventCategory | "all", string> = {
  all: "Wszystkie",
  parties: "Imprezy",
  trips: "Wyjazdy",
  sport: "Sport",
  recruitment: "Rekrutacja",
  educational: "Edukacja",
  volunteering: "Wolontariat",
  other: "Inne",
};

export const CATEGORY_COLORS: Record<
  EventCategory,
  { bg: string; text: string }
> = {
  parties: { bg: "var(--tag-pink-bg)", text: "var(--tag-pink-text)" },
  trips: { bg: "var(--tag-green-bg)", text: "var(--tag-green-text)" },
  sport: { bg: "var(--tag-teal-bg)", text: "var(--tag-teal-text)" },
  educational: { bg: "var(--tag-indigo-bg)", text: "var(--tag-indigo-text)" },
  recruitment: { bg: "var(--tag-red-bg)", text: "var(--tag-red-text)" },
  volunteering: { bg: "var(--tag-yellow-bg)", text: "var(--tag-yellow-text)" },
  other: { bg: "var(--tag-brown-bg)", text: "var(--tag-brown-text)" },
};
