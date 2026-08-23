"use client";

import { atom } from "jotai";

import { getDefaultFormDates } from "@/lib/event-form-utils";
import type { FormAttributeBase } from "@/types/attributes";
import type { CompleteEventForm } from "@/types/forms";

export interface NewEventForm extends Omit<
  CompleteEventForm,
  "uuid" | "eventUuid" | "attributes" | "order" | "createdAt" | "updatedAt"
> {
  attributes: FormAttributeBase[];
}

export const newEventFormAtom = atom<NewEventForm>({
  isOpen: true,
  isFirstForm: false,
  description: "<p></p>",
  name: "",
  slug: "",
  ...getDefaultFormDates(),
  openCondition: "MANUAL",
  attributes: [],
  isOpen: true,
});
