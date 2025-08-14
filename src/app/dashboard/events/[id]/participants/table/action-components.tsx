"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Loader, Pencil, Save, Trash2, XCircle } from "lucide-react";
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
  isQuerying,
  participantId,
  deleteParticipant,
}: {
  isQuerying: boolean;
  participantId: number;
  deleteParticipant: (_participantId: number) => Promise<void>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="h-12 w-fit px-3 text-red-500"
          disabled={isQuerying}
          size="icon"
        >
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
          <AlertDialogDescription className="text-foreground text-center text-pretty">
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

export function DeleteManyParticipantsDialog({
  isQuerying,
  participants,
  deleteManyParticipants,
}: {
  isQuerying: boolean;
  participants: string[];
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
}) {
  return participants.length === 0 ? (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button
            variant="outline"
            className="text-red-500 hover:cursor-not-allowed hover:text-red-500 disabled:pointer-events-auto"
            size="icon"
            disabled={true}
          >
            <Trash2 />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="text-foreground rounded bg-white px-3 py-2 text-sm dark:bg-gray-900"
            sideOffset={5}
          >
            Najpierw zaznacz uczestników do usunięcia
            <Tooltip.Arrow className="fill-white dark:fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  ) : (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          title="Grupowe usuwanie uczestników"
          className="text-red-500"
          disabled={isQuerying}
          size="icon"
        >
          {isQuerying ? <Loader className="animate-spin" /> : <Trash2 />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col items-center">
        <AlertDialogHeader className="flex flex-col items-center">
          <AlertDialogTitle className="flex flex-col items-center self-center">
            <XCircle strokeWidth={1} stroke={"red"} size={64} />
            Jesteś pewny?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground text-center text-pretty">
            Zamierzasz jednocześnie usunąć{" "}
            <strong>{participants.length}</strong>{" "}
            {participants.length === 1 ? "uczestnika" : "uczestników"}. Tej
            operacji nie będzie można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-x-4">
          <AlertDialogAction
            onClick={async () => {
              await deleteManyParticipants(participants);
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
      {disabled ? <Loader className="animate-spin" /> : <Save />} Zapisz
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
