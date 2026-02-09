"use client";

import { atom } from "jotai";

import type { EventAttribute } from "@/types/attributes";
import type { EventCategory } from "@/types/categories";
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
  startDate: Date;
  startTime: string;
  endDate: Date;
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
  categories: EventCategory[];
}

export const eventAtom = atom<Event>({
  name: "",
  description: "<p></p>",
  // Tomorrow, midnight
  startDate: new Date(new Date().setHours(24, 0, 0, 0)),
  endDate: new Date(new Date().setHours(24, 0, 0, 0)),
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
  categories: [],
});
