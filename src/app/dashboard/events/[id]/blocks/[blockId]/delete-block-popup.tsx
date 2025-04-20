"use client";

import { CircleX, Loader, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { deleteBlock } from "../actions";

function DeleteBlockPopup({
  eventId,
  blockId,
  blockName,
  attributeId,
}: {
  eventId: string;
  blockId: string;
  blockName: string;
  attributeId: string;
}) {
  const form = useForm();

  const { toast } = useToast();
  const router = useRouter();

  const [shouldDisableButtons, setShouldDisableButtons] = useState(false);

  async function onSubmit() {
    const result = await deleteBlock(eventId, blockId, attributeId);
    if (result.success) {
      setShouldDisableButtons(true);
      toast({
        title: "Blok został usunięty",
        description: `Usunięto blok ${blockName}`,
      });
      router.refresh();
    } else {
      toast({
        title: "Wystąpił błąd",
        variant: "destructive",
        description: result.error,
      });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-700">
          <Trash2 />
          <span className="sr-only">Usuń blok</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-96 max-w-96">
        <div className="sr-only">
          <DialogTitle>Usuń blok</DialogTitle>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <CircleX className="h-14 w-14 text-red-700" />
          <p className="text-lg font-bold">Jesteś pewien?</p>
          <p className="text-sm">
            Czy na pewno chcesz usunąć blok <strong>{blockName}</strong>?
          </p>
          <div className="flex gap-2">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Button
                type="submit"
                variant="destructive"
                disabled={form.formState.isSubmitting || shouldDisableButtons}
              >
                {form.formState.isSubmitting || shouldDisableButtons ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Usuń"
                )}
              </Button>
            </form>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={form.formState.isSubmitting || shouldDisableButtons}
              >
                Anuluj
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteBlockPopup };
