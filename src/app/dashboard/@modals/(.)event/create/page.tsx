"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CreateEvent from "@/app/dashboard/event/create/page";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function CreateEventModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        router.back();
        setOpen(true);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogTitle className="sr-only">Create Event</DialogTitle>
        <CreateEvent />
      </DialogContent>
    </Dialog>
  );
}
