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
      <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden p-4 sm:max-h-[90vh] sm:max-w-4xl sm:p-6">
        <DialogTitle className="text-xl font-bold sm:text-2xl">
          Historia wiadomości
        </DialogTitle>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-24 text-center">
              <p className="text-muted-foreground animate-pulse text-sm">
                Ładowanie historii…
              </p>
            </div>
          ) : data !== null && data !== undefined ? (
            <EmailHistoryTable email={data} />
          ) : (
            <p className="py-24 text-center text-sm text-red-500">
              Nie udało się załadować danych.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MailHistoryPopup };
