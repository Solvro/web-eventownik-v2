"use client";

import { atom } from "jotai";

export interface NewEventEmailTemplate {
  name: string;
  content: string;
  trigger: string;
  triggerValue: string | null;
  triggerValue2?: string | null;
}

export const newEventEmailTemplateAtom = atom<NewEventEmailTemplate>({
  name: "",
  content: "",
  trigger: "manual",
  triggerValue: null,
  triggerValue2: null,
});
