"use client";

import { atom } from "jotai";

import type { FormAttributeBase } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

export interface NewEventForm
  extends Omit<EventForm, "id" | "eventId" | "attributes"> {
  startTime: string;
  endTime: string;
  attributes: FormAttributeBase[];
}

export const newEventFormAtom = atom<NewEventForm>({
  isOpen: true,
  isFirstForm: false,
  description: "",
  name: "",
  slug: "",
  startTime: "",
  endTime: "",
  startDate: new Date(),
  endDate: new Date(),
  attributes: [],
});
