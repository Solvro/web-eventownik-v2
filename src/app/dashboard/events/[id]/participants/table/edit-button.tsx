"use client";

import { Pencil, Save } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

export function EditParticipantButton({
  participant,
  setData,
  disabled,
  handleSubmit,
}: {
  participant: FlattenedParticipant;
  setData: Dispatch<SetStateAction<FlattenedParticipant[]>>;
  disabled: boolean;
  handleSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
}) {
  return participant.mode === "edit" ? (
    <Button
      variant="outline"
      type="submit"
      disabled={disabled}
      onClick={async (event) => {
        event.preventDefault();
        await handleSubmit(event);
      }}
    >
      <Save />
      Zapisz
    </Button>
  ) : (
    <Button
      variant="outline"
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        setData((previousData) => {
          return previousData.map((_participant) =>
            _participant.id === participant.id
              ? { ..._participant, mode: "edit" }
              : _participant,
          );
        });
      }}
    >
      <Pencil />
      Edytuj
    </Button>
  );
}
