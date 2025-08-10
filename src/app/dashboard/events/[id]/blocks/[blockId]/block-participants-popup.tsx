"use client";

import { TableProperties } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Participant } from "@/types/participant";

import { BlockParticipantsTable } from "./(table)/table";

function BlockParticipantsPopup({
  participants,
}: {
  participants: Participant[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="eventGhost" size="icon" title="Uczestnicy bloku">
          <TableProperties />
          <span className="sr-only">Uczestnicy bloku</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-96 max-w-128">
        <DialogTitle>Uczestnicy bloku</DialogTitle>
        <BlockParticipantsTable participants={participants} />
      </DialogContent>
    </Dialog>
  );
}

export { BlockParticipantsPopup };
