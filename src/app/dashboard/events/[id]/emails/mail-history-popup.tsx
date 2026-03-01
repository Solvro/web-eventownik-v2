"use client";

import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SingleEventEmail } from "@/types/emails";

import { EmailHistoryTable } from "./(table)/table";

function MailHistoryPopup({ email }: { email: SingleEventEmail }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="eventGhost" size="icon" title="Historia wiadomości">
          <History />
          <span className="sr-only">Historia wiadomości</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-full overflow-y-scroll sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:overflow-y-auto">
        <DialogTitle className="text-2xl font-bold">
          Historia wiadomości
        </DialogTitle>
        <EmailHistoryTable email={email} />
      </DialogContent>
    </Dialog>
  );
}

export { MailHistoryPopup };
