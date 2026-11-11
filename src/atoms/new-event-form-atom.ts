"use client";

import { atom } from "jotai";

import { getDefaultFormDates } from "@/lib/event-form-utils";
import type { CompleteEventForm, FormAttribute } from "@/types/forms";

export interface NewEventForm extends Omit<
  CompleteEventForm,
  "uuid" | "eventUuid" | "attributes" | "order" | "createdAt" | "updatedAt"
> {
  attributes: FormAttribute[];
}

export const newEventFormAtom = atom<NewEventForm>({
  isFirstForm: false,
  description: "<p></p>",
  name: "",
  slug: "",
  ...getDefaultFormDates(),
  openCondition: "MANUAL",
  attributes: [],
  isOpen: true,
});
