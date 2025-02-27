"use client";

import { useAtomValue } from "jotai";
import { Frown, Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { saveEvent } from "../actions";
import { eventAtom } from "../state";

export function SaveEvent() {
  const event = useAtomValue(eventAtom);
  const router = useRouter();
  const [result, setResult] = useState<string | undefined>(undefined);
  // check if event has the required field
  if (event.name === "") {
    router.push("/dashboard/event/create?step=1");
  }
  useEffect(() => {
    let ignore = false;
    void saveEvent(event).then((_result) => {
      if (!ignore && _result?.errors !== undefined) {
        setResult(_result.errors[0].message);
      } else {
        // soon™
        router.push("/dashboard/event/share");
      }
    });
    return () => {
      ignore = true;
    };
  }, [event]);
  return (
    <div className="flex flex-col items-center gap-2">
      {result == null ? (
        <>
          <Loader2 className="size-8 animate-spin" />
          <p>Tworzenie wydarzenia...</p>
        </>
      ) : (
        <>
          <Frown className="size-8 text-red-500" />
          <p>
            Coś poszło nie tak podczas tworzenia wydarzenia.
            <br />
            Spróbuj utworzyć je ponownie.
          </p>
        </>
      )}
    </div>
  );
}
