"use client";

import { atom } from "jotai";

import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";

export const AttributeTypes = [
  "text",
  "number",
  "textarea",
  "file",
  "select",
  "multiselect",
  "block",
  "date",
  "time",
  "datetime",
  "email",
  "tel",
  "color",
  // "password",
  "checkbox",
] as const;

export interface Event {
  name: string;
  description: string | undefined;
  startDate: Date;
  endDate: Date;
  location: string | undefined;
  organizer: string | undefined;
  image: string;
  color: string;
  participantsNumber: number;
  links: string[];
  slug: string;
  coorganizers: CoOrganizer[];
  attributes: EventAttribute[];
}

export const eventAtom = atom<Event>({
  name: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  location: "",
  organizer: "",
  image: "",
  color: "#3672fd",
  participantsNumber: 1,
  links: [],
  slug: "",
  coorganizers: [],
  attributes: [],
});
