"use client";

import { SquarePlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function AddBlockEntry() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="border-muted text-muted-foreground flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted p-4">
          <SquarePlus className="h-6 w-6" /> Stwórz blok
        </button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Stwórz blok</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4"></div>
      </DialogContent>
    </Dialog>
  );
}

export { AddBlockEntry };
