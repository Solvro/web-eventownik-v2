"use client";

import { atom } from "jotai";

import type { EventForm } from "@/types/forms";

type NewEventForm = Omit<EventForm, "id" | "eventId">;

export const newEventFormAtom = atom<NewEventForm>({
  isOpen: true,
  description: "lorem ipsum",
  name: "",
  slug: "",
  startDate: new Date(),
  endDate: new Date(),
});
