"use client";

import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SingleEventEmail } from "@/types/emails";

import { EmailHistoryTable } from "./(table)/table";
import { getSingleEventEmailAction } from "./actions";

interface MailHistoryPopupProps {
  eventId: string;
  emailId: string;
}

function MailHistoryPopup({ eventId, emailId }: MailHistoryPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery<SingleEventEmail | null>({
    queryKey: ["email-history", eventId, emailId],
    queryFn: async () => await getSingleEventEmailAction(eventId, emailId),
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground animate-pulse text-sm">
              Ładowanie historii…
            </p>
          </div>
        ) : data !== null && data !== undefined ? (
          <EmailHistoryTable email={data} />
        ) : (
          <p className="py-10 text-center text-sm text-red-500">
            Nie udało się załadować danych.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { MailHistoryPopup };
