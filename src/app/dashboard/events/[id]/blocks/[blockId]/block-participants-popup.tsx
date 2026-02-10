"use client";

import { TableProperties } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import type { Participant } from "@/types/participant";

import { BlockParticipantsTable } from "./(table)/table";

function BlockParticipantsPopup({
  participants,
}: {
  participants: Participant[];
}) {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="eventGhost" size="icon" title="Uczestnicy bloku">
          <TableProperties />
          <span className="sr-only">Uczestnicy bloku</span>
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-h-96 md:max-w-lg">
        <div className="space-y-4 p-6 md:p-0">
          <CredenzaTitle>Uczestnicy bloku</CredenzaTitle>
          <BlockParticipantsTable participants={participants} />
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export { BlockParticipantsPopup };
