import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const formStateAtom = atomFamily((_id: number) =>
  atom({
    ref: null,
    valid: true,
    submitting: false,
  }),
);
