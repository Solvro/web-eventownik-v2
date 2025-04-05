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

export const EMAIL_TAGS = [
  { name: "Nazwa wydarzenia", value: "/event_name" },
  { name: "Data rozpoczęcia wydarzenia", value: "/event_start_date" },
  { name: "Data zakończenia wydarzenia", value: "/event_end_date" },
  { name: "Slug wydarzenia", value: "/event_slug" },
  { name: "Kolor wydarzenia", value: "/event_primary_color" },
  { name: "Email uczestnika", value: "/participant_email" },
  { name: "ID uczestnika", value: "/participant_id" },
  { name: "Slug uczestnika", value: "/participant_slug" },
  { name: "Data rejestracji uczestnika", value: "/participant_created_at" },
] as const;
