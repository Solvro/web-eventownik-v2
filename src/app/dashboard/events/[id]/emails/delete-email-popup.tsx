"use client";

import { CircleX, Loader, Trash2 } from "lucide-react";
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

import { deleteEventMail } from "./actions";

// TODO: Unify those popups, as this is almost the same code as delete form popup

function DeleteEmailPopup({
  eventId,
  mailId,
  mailName,
}: {
  eventId: string;
  mailId: string;
  mailName: string;
}) {
  const form = useForm();

  const { toast } = useToast();

  const [shouldDisableButtons, setShouldDisableButtons] = useState(false);

  async function onSubmit() {
    const result = await deleteEventMail(eventId, mailId);
    if (result.success) {
      setShouldDisableButtons(true);
      toast({
        title: "Szablon został usunięty",
        description: `Usunięto szablon ${mailName}`,
      });
      location.reload();
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
        <Button
          variant="eventGhost"
          size="icon"
          title="Usuń szablon"
          className="text-red-700"
        >
          <Trash2 />
          <span className="sr-only">Usuń szablon</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-96 max-w-96">
        <div className="sr-only">
          <DialogTitle>Usuń szablon</DialogTitle>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <CircleX className="h-14 w-14 text-[#EB0000]" />
          <p className="text-lg font-bold">Jesteś pewien?</p>
          <p className="text-sm">
            Czy na pewno chcesz usunąć szablon maila <strong>{mailName}</strong>
            ?
          </p>
          <div className="flex gap-2">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Button
                type="submit"
                variant="destructive"
                className="bg-[#EB0000]"
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

export { DeleteEmailPopup };
