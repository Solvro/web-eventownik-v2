"use client";

import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import type { SingleEventEmail } from "@/types/emails";

import { EmailHistoryTable } from "./(table)/table";

function MailHistoryPopup({ email }: { email: SingleEventEmail }) {
  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant="eventGhost" size="icon" title="Historia wiadomości">
          <History />
          <span className="sr-only">Historia wiadomości</span>
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="max-h-96 max-w-3xl">
        <div className="space-y-4 p-6 md:p-0">
          <CredenzaTitle>Historia wiadomości</CredenzaTitle>
          <EmailHistoryTable email={email} />
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export { MailHistoryPopup };
