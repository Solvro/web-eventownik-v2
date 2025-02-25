"use client";

import { atom } from "jotai";

interface Event {
  name: string;
  description: string | undefined;
  startDate: Date;
  endDate: Date;
  lat: number;
  long: number;
  organizer: string | undefined;
  image: string;
  color: string;
  participantsNumber: number;
  links: string[];
  slug: string;
  coorganizers: string[];
}

export const eventAtom = atom<Event>({
  name: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  lat: 0,
  long: 0,
  organizer: "",
  image: "",
  color: "#3672fd",
  participantsNumber: 1,
  links: [],
  slug: "",
  coorganizers: [],
});
