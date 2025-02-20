"use client";

import { useAtom } from "jotai";

import { eventAtom } from "../state";

export default function EventPersonalizationForm() {
  const event = useAtom(eventAtom);
  return (
    <div>
      <p>Personalize event (WIP)</p>
      <pre>{JSON.stringify(event, null, 2)}</pre>
    </div>
  );
}
