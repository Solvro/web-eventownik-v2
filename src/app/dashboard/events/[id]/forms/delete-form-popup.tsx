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

import { deleteEventForm } from "./actions";

function DeleteFormPopup({
  eventId,
  formId,
  formName,
}: {
  eventId: string;
  formId: string;
  formName: string;
}) {
  const form = useForm();

  const { toast } = useToast();
  const router = useRouter();

  const [shouldDisableButtons, setShouldDisableButtons] = useState(false);

  async function onSubmit() {
    const result = await deleteEventForm(eventId, formId);
    if (result.success) {
      setShouldDisableButtons(true);
      toast({
        title: "Formularz został usunięty",
        description: `Usunięto formularz ${formName}`,
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
        <Button variant="eventGhost" size="icon" className="text-red-700">
          <Trash2 />
          <span className="sr-only">Usuń formularz</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-96 max-w-96">
        <div className="sr-only">
          <DialogTitle>Usuń formularz</DialogTitle>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <CircleX className="text-destructive h-14 w-14" />
          <p className="text-lg font-bold">Jesteś pewien?</p>
          <p className="text-sm">
            Czy na pewno chcesz usunąć formularz <strong>{formName}</strong>?
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

export { DeleteFormPopup };
