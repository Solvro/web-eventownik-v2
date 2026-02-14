"use client";

import { CircleX, Loader, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { useToast } from "@/hooks/use-toast";

interface DeleteResourcePopupProps {
  resourceName: string;
  resourceType: string;
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  triggerTitle?: string;
  triggerClassName?: string;
}

function DeleteResourcePopup({
  resourceName,
  resourceType,
  onDelete,
  onSuccess,
  triggerTitle,
  triggerClassName = "text-red-700",
}: DeleteResourcePopupProps) {
  const form = useForm();
  const { toast } = useToast();
  const [shouldDisableButtons, setShouldDisableButtons] = useState(false);

  async function onSubmit() {
    const result = await onDelete();
    if (result.success) {
      setShouldDisableButtons(true);
      toast({
        title: `${resourceType} został usunięty`,
        description: `Usunięto ${resourceType.toLowerCase()} ${resourceName}`,
      });
      if (onSuccess !== undefined) {
        onSuccess();
      }
    } else {
      toast({
        title: `Nie udało się usunąć ${resourceType.toLowerCase()}!`,
        variant: "destructive",
        description: result.error,
      });
    }
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button
          variant="eventGhost"
          size="icon"
          title={triggerTitle ?? `Usuń ${resourceType.toLowerCase()}`}
          className={triggerClassName}
        >
          <Trash2 />
          <span className="sr-only">Usuń {resourceType.toLowerCase()}</span>
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="md:max-h-96 md:max-w-96">
        <div className="sr-only">
          <CredenzaTitle>Usuń {resourceType.toLowerCase()}</CredenzaTitle>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 p-4 text-center md:p-0">
          <CircleX className="text-destructive h-14 w-14" />
          <p className="text-lg font-bold">Jesteś pewien?</p>
          <p className="text-sm">
            Czy na pewno chcesz usunąć {resourceType.toLowerCase()}{" "}
            <strong>{resourceName}</strong>?
          </p>
          <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
            <CredenzaClose asChild>
              <Button
                variant="outline"
                disabled={form.formState.isSubmitting || shouldDisableButtons}
              >
                Anuluj
              </Button>
            </CredenzaClose>
            <form
              className="order-first md:order-last"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Button
                type="submit"
                className="w-full"
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
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export { DeleteResourcePopup };
