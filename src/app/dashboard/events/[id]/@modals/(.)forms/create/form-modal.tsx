"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EventFormForm } from "@/app/dashboard/events/[id]/forms/create/event-form-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CreateEventFormModal({
  eventId,
  attributes,
}: {
  eventId: number;
  attributes: { id: number; name: string }[];
}) {
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
        {attributes.length > 0 ? (
          <EventFormForm eventId={eventId} attributes={attributes} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-red-500">
              <TriangleAlert className="h-6 w-6" /> Brak dostępnych atrybutów
            </h2>
            <p className="max-w-lg text-center text-sm text-gray-500">
              Nie udało się pobrać listy atrybutów. Aby stworzyć formularz,
              musisz mieć co najmniej jeden atrybut. Upewnij się, że do
              wydarzenia dodano odpowiednie atrybuty i spróbuj ponownie.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { CreateEventFormModal };
