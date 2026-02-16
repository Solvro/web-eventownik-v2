"use client";

import { Loader, Trash2, XCircle } from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="text-red-500 hover:cursor-not-allowed hover:text-red-500 disabled:pointer-events-auto"
          size="icon"
          disabled={true}
        >
          <Trash2 />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Najpierw zaznacz uczestników do usunięcia</TooltipContent>
    </Tooltip>
  ) : (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          title="Grupowe usuwanie uczestników"
          className="text-red-500"
          disabled={isQuerying}
          size="icon"
          aria-label="Usuń zaznaczone wiersze"
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
