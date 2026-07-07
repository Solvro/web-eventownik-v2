"use client";

import { CircleX, Loader, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Dashboard");
  const form = useForm();
  const { toast } = useToast();
  const [shouldDisableButtons, setShouldDisableButtons] = useState(false);

  async function onSubmit() {
    const result = await onDelete();
    if (result.success) {
      setShouldDisableButtons(true);
      toast({
        title: t("resourceDeleted", {
          resourceType,
        }),
        description: t("resourceDeletedWithName", {
          resourceType,
          resourceName,
        }),
      });
      if (onSuccess !== undefined) {
        onSuccess();
      }
    } else {
      toast({
        title: t("resourceDeleteFailed", {
          resourceType: resourceType.toLowerCase(),
        }),
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
          title={triggerTitle ?? `${t("delete")} ${resourceType.toLowerCase()}`}
          className={triggerClassName}
        >
          <Trash2 />
          <span className="sr-only">
            {t("delete")} {resourceType.toLowerCase()}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-96 max-w-96">
        <div className="sr-only">
          <DialogTitle>
            {t("delete")} {resourceType.toLowerCase()}
          </DialogTitle>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <CircleX className="text-destructive h-14 w-14" />
          <p className="text-lg font-bold">{t("areYouSure")}</p>
          <p className="text-sm">
            {t.rich("confirmDeleteResource", {
              type: resourceType.toLowerCase(),
              strong: (chunk) => <strong>{chunk}</strong>,
              name: resourceName,
            })}
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
                  t("delete")
                )}
              </Button>
            </form>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={form.formState.isSubmitting || shouldDisableButtons}
              >
                {t("cancel")}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteResourcePopup };
