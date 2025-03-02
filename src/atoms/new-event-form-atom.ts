"use client";

import { atom } from "jotai";

import type { EventForm } from "@/types/forms";

interface NewEventForm extends Omit<EventForm, "id" | "eventId"> {
  startTime: string;
  endTime: string;
}

export const newEventFormAtom = atom<NewEventForm>({
  isOpen: true,
  description: "",
  name: "",
  slug: "",
  startTime: "",
  endTime: "",
  startDate: new Date(),
  endDate: new Date(),
  attributes: [],
});
