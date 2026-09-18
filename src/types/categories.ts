export const EVENT_CATEGORIES = [
  "parties",
  "trips",
  "educational",
  "cultural",
  "sport",
  "volunteering",
  "recruitment",
  "other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<EventCategory | "all", string> = {
  all: "Wszystkie",
  parties: "Imprezy",
  trips: "Wyjazdy",
  educational: "Edukacyjne",
  cultural: "Kulturalne",
  sport: "Sport",
  volunteering: "Wolontariat",
  recruitment: "Rekrutacje",
  other: "Inne",
};

export const CATEGORY_COLORS: Record<
  EventCategory,
  { bg: string; text: string }
> = {
  parties: { bg: "var(--tag-pink-bg)", text: "var(--tag-pink-text)" },
  trips: { bg: "var(--tag-green-bg)", text: "var(--tag-green-text)" },
  educational: { bg: "var(--tag-indigo-bg)", text: "var(--tag-indigo-text)" },
  cultural: { bg: "var(--tag-purple-bg)", text: "var(--tag-purple-text)" },
  sport: { bg: "var(--tag-teal-bg)", text: "var(--tag-teal-text)" },
  volunteering: { bg: "var(--tag-yellow-bg)", text: "var(--tag-yellow-text)" },
  recruitment: { bg: "var(--tag-red-bg)", text: "var(--tag-red-text)" },
  other: { bg: "var(--tag-brown-bg)", text: "var(--tag-brown-text)" },
};
