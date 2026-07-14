"use client";

import { useAtom } from "jotai";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { participantsVisibilityAtom } from "@/atoms/participants-visibility-atom";
import { Button } from "@/components/ui/button";

export function ToggleParticipantsVisibilityButton() {
  const [areParticipantsVisible, setAreParticipantsVisible] = useAtom(
    participantsVisibilityAtom,
  );
  const t = useTranslations("Dashboard");

  return (
    <Button
      className="ml-auto flex w-full lg:w-auto"
      variant="ghost"
      onClick={() => {
        setAreParticipantsVisible((previous) => !previous);
      }}
    >
      <Users />
      <p>
        {areParticipantsVisible
          ? t("hideBlockParticipants")
          : t("showBlockParticipants")}
      </p>
    </Button>
  );
}
