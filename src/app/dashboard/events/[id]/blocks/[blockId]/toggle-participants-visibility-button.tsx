"use client";

import { useAtom } from "jotai";
import { Users } from "lucide-react";

import { participantsVisibilityAtom } from "@/atoms/participants-visibility-atom";
import { Button } from "@/components/ui/button";

export function ToggleParticipantsVisibilityButton() {
  const [areParticipantsVisible, setAreParticipantsVisible] = useAtom(
    participantsVisibilityAtom,
  );
  return (
    <Button
      className="ml-auto flex w-full md:w-auto"
      variant="ghost"
      onClick={() => {
        setAreParticipantsVisible((previous) => !previous);
      }}
    >
      <Users />
      <p>{areParticipantsVisible ? "Ukryj" : "Pokaż"} uczestników bloków</p>
    </Button>
  );
}
