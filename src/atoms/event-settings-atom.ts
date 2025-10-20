"use client";

import { atom } from "jotai";

import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

export const eventAtom = atom<Event | null>(null);

export const coOrganizersAtom = atom<CoOrganizer[]>([]);

export interface CoOrganizersChanges {
  added: CoOrganizer[];
  updated: CoOrganizer[];
  deleted: CoOrganizer[];
}

export const coOrganizersChangesAtom = atom<CoOrganizersChanges>({
  added: [],
  updated: [],
  deleted: [],
});

export const attributesAtom = atom<EventAttribute[]>([]);

export interface AttributesChanges {
  added: EventAttribute[];
  updated: EventAttribute[];
  deleted: EventAttribute[];
}

export const attributesChangesAtom = atom<AttributesChanges>({
  added: [],
  updated: [],
  deleted: [],
});

export const isDirtyAtom = atom<boolean>(false);

export const resetCoOrganizersChangesAtom = atom(null, (_get, set) => {
  set(coOrganizersChangesAtom, {
    added: [],
    updated: [],
    deleted: [],
  });
});

export const resetAttributesChangesAtom = atom(null, (_get, set) => {
  set(attributesChangesAtom, {
    added: [],
    updated: [],
    deleted: [],
  });
});

export const resetAllChangesAtom = atom(null, (_get, set) => {
  set(resetCoOrganizersChangesAtom);
  set(resetAttributesChangesAtom);
  set(isDirtyAtom, false);
});
