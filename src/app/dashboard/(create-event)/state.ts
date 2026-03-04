"use client";

import { formatISO9075 } from "date-fns";
import { atom } from "jotai";

import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";

export const AttributeTypes = [
  "text",
  "number",
  "textarea",
  "file",
  "drawing",
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
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string | undefined;
  organizer: string | undefined;
  photoUrl: string;
  primaryColor: string;
  participantsNumber: number;
  socialMediaLinks: { label?: string; link: string }[];
  slug: string;
  contactEmail: string | undefined;
  coorganizers: CoOrganizer[];
  attributes: EventAttribute[];
  termsLink: string | undefined;
}

export const eventAtom = atom<Event>({
  name: "",
  description: "<p></p>",
  // Tomorrow, midnight
  startDate: formatISO9075(new Date(new Date().setHours(24, 0, 0, 0)), {
    representation: "complete",
  }),
  endDate: formatISO9075(new Date(new Date().setHours(24, 0, 0, 0)), {
    representation: "complete",
  }),
  startTime: "12:00",
  endTime: "12:00",
  location: "",
  organizer: "",
  photoUrl: "",
  primaryColor: "#3672fd",
  participantsNumber: 1,
  socialMediaLinks: [],
  slug: "",
  contactEmail: "",
  coorganizers: [],
  attributes: [],
  termsLink: "",
});
