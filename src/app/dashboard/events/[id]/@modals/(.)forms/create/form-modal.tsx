"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EventFormForm } from "@/app/dashboard/events/[id]/forms/create/event-form-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CreateEventFormModal({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      router.back();
    }
  }, [open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Stwórz formularz</DialogTitle>
        </DialogHeader>
        <EventFormForm eventId={eventId} />
      </DialogContent>
    </Dialog>
  );
}

export { CreateEventFormModal };
