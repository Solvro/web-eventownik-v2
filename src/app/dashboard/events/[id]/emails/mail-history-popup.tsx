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
      <DialogContent
        aria-describedby={undefined}
        className={
          "flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:max-w-4xl sm:gap-4 sm:p-6 " +
          "max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none"
        }
      >
        <div className="flex shrink-0 flex-col gap-1 border-b px-4 pt-4 pb-3 sm:border-0 sm:p-0">
          <DialogTitle className="text-left text-xl font-bold sm:text-2xl">
            Historia wiadomości
          </DialogTitle>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 sm:px-0 sm:pb-0">
          {isLoading ? (
            <div className="flex flex-1 items-start justify-center pt-12">
              <p className="text-muted-foreground animate-pulse text-sm">
                Ładowanie historii…
              </p>
            </div>
          ) : data !== null && data !== undefined ? (
            <EmailHistoryTable email={data} />
          ) : (
            <div className="flex flex-1 items-start justify-center pt-12">
              <p className="text-center text-sm text-red-500">
                Nie udało się załadować danych.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MailHistoryPopup };
