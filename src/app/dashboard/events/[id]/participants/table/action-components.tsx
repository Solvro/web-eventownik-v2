"use client";

import { Pencil, Save, Trash2, XCircle } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

export function DeleteParticipantDialog({
  isQuering,
  participantId,
  deleteParticipant,
}: {
  isQuering: boolean;
  participantId: number;
  deleteParticipant: (_participantId: number) => Promise<void>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-500" disabled={isQuering}>
          <Trash2 />
          Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col items-center">
        <AlertDialogHeader className="flex flex-col items-center">
          <AlertDialogTitle className="flex flex-col items-center self-center">
            <XCircle strokeWidth={1} stroke={"red"} size={64} />
            Jesteś pewny?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-pretty text-center text-foreground">
            Na pewno chcesz usunąć tego uczestnika? Tej operacji nie będzie
            można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-x-4">
          <AlertDialogAction
            onClick={async () => {
              await deleteParticipant(participantId);
            }}
            className={buttonVariants({
              variant: "destructive",
            })}
          >
            Usuń
          </AlertDialogAction>
          <AlertDialogCancel
            className={buttonVariants({
              variant: "outline",
            })}
          >
            Anuluj
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
