import type { LooseAutocomplete } from "@/types/utils";

export const EMAIL_TRIGGERS = [
  {
    name: "Rejestracja uczestnika",
    description:
      "Ten szablon zostanie automatycznie wysłany do uczestnika po jego rejestracji na wydarzenie.",
    value: "participant_registered",
  },
  {
    name: "Usunięcie uczestnika",
    description:
      "Ten szablon zostanie automatycznie wysłany do uczestnika po jego usunięciu z listy uczestników.",
    value: "participant_deleted",
  },
  {
    name: "Wypełnienie formularza",
    description:
      "Ten szablon zostanie automatycznie wysłany do uczestnika po wypełnieniu określonego formularza.",
    value: "form_filled",
  },
  {
    name: "Zmiana atrybutu",
    description:
      "Ten szablon zostanie automatycznie wysłany do uczestnika, gdy wartość określonego atrybutu ulegnie zmianie na daną wartość.",
    value: "attribute_changed",
  },
  {
    name: "Manualny",
    description:
      "Ten szablon nie jest wysyłany automatycznie i służy do ręcznej wysyłki z poziomu listy uczestników. Szablony z pozostałymi wyzwalaczami również mogą zostać wysłane manualnie.",
    value: "manual",
  },
] as const;

type EmailTagColor = LooseAutocomplete<
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "brown"
>;

export interface EmailTag {
  title: string;
  description: string;
  value: string;
  color: EmailTagColor;
}

export const EMAIL_TAGS = [
  {
    title: "Nazwa wydarzenia",
    description: "Zamienia się w prawdziwą nazwę wydarzenia",
    value: "event_name",
    color: "red",
  },
  {
    title: "Data rozpoczęcia",
    description: "Zamienia się w datę rozpoczęcia wydarzenia",
    value: "event_start_date",
    color: "orange",
  },
  {
    title: "Data zakończenia",
    description: "Zamienia się w datę zakończenia wydarzenia",
    value: "event_end_date",
    color: "yellow",
  },
  {
    title: "Slug wydarzenia",
    description: "Zamienia się w slug wydarzenia",
    value: "event_slug",
    color: "green",
  },
  {
    title: "Kolor wydarzenia",
    description: "Zamienia się w wybrany kolor wydarzenia",
    value: "event_primary_color",
    color: "teal",
  },
  {
    title: "Email uczestnika",
    description: "Zamienia się w email uczestnika",
    value: "participant_email",
    color: "blue",
  },
  {
    title: "ID uczestnika",
    description: "Zamienia się w ID uczestnika",
    value: "participant_id",
    color: "indigo",
  },
  {
    title: "Slug uczestnika",
    description: "Zamienia się w slug uczestnika",
    value: "participant_slug",
    color: "purple",
  },
  {
    title: "Data rejestracji",
    description:
      "Zamienia się w datę zarejestrowania się uczestnika na wydarzenie",
    value: "participant_created_at",
    color: "pink",
  },
] as const satisfies EmailTag[];
