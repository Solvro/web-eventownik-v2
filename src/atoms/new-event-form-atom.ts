"use client";

import { atom } from "jotai";

import type { FormAttributeBase } from "@/types/attributes";
import { OpenCondition } from "@/types/forms";
import type { NonNullableEventForm } from "@/types/forms";

export interface NewEventForm extends Omit<
  NonNullableEventForm,
  "uuid" | "eventUuid" | "attributes" | "order"
> {
  attributes: FormAttributeBase[];
}

export const newEventFormAtom = atom<NewEventForm>({
  isOpen: true,
  isFirstForm: false,
  description: "<p></p>",
  name: "",
  slug: "",
  openTime: "12:00",
  closeTime: "12:00",
  // Tomorrow, midnight
  openDate: new Date(new Date().setHours(24, 0, 0, 0)),
  // Day after tomorrow, midnight
  closeDate: new Date(new Date().setHours(48, 0, 0, 0)),
  openCondition: OpenCondition.MANUAL,
  attributes: [],
});
