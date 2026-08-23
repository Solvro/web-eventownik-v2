"use client";

import { atom } from "jotai";

import type { CreateEventFormDto } from "@/types/forms";

export const newEventFormAtom = atom<CreateEventFormDto>({
  name: "",
  isEditable: true,
  description: "<p></p>",
  isFirstForm: false,
  attributes: [],
  isOpen: true,
});
