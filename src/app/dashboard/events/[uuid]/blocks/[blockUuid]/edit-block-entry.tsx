"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateBlock } from "@/app/dashboard/events/[uuid]/blocks/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import { translateOrFallback } from "@/i18n/translate-or-fallback";
import type { Block } from "@/types/blocks";

import { BlockForm, BlockSchema } from "./block-form";
import type { BlockFormValues } from "./block-form";

function EditBlockEntry({
  blockToEdit,
  eventUuid,
  attributeUuid,
}: {
  blockToEdit: Block;
  eventUuid: string;
  attributeUuid: string;
  parentUuid: string;
}) {
  const t = useTranslations("EventDetails");
  const form = useForm<BlockFormValues>({
    resolver: zodResolver(BlockSchema),
    defaultValues: {
      name: blockToEdit.name,
      capacity: blockToEdit.capacity ?? "",
    },
  });

  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const router = useRouter();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  const onSubmit = async (data: BlockFormValues) => {
    const result = await updateBlock(
      eventUuid,
      attributeUuid,
      blockToEdit.uuid,
      data.name,
      null,
      data.capacity === "" || data.capacity === undefined
        ? null
        : data.capacity,
    );
    if (result.success) {
      toast({
        title: t("blockChangesSaved"),
      });
      form.reset();
      setDialogOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: t("failedToSaveBlockChanges"),
        description: translateOrFallback(
          t,
          result.error?.error.key,
          result.error?.error.values,
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open: boolean) => {
        if (open) {
          setDialogOpen(open);
        } else {
          if (form.formState.isDirty || isGuardActive) {
            setAlertActive(form.formState.isDirty || isGuardActive);
          } else {
            setDialogOpen(open);
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="eventGhost" size="icon" className="relative">
          <Edit />
          <span className="sr-only">{t("editBlock")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>{t("editBlock")}</DialogTitle>
        </DialogHeader>
        <UnsavedChangesAlert
          active={alertActive}
          setActive={setAlertActive}
          setDialogOpen={setDialogOpen}
          onCancel={onCancel}
          onConfirm={() => {
            form.reset();
            onConfirm();
          }}
        />
        <BlockForm
          form={form}
          onSubmit={onSubmit}
          loadingText={t("saving")}
          submitText={t("save")}
          idleIcon={Save}
        />
      </DialogContent>
    </Dialog>
  );
}

export { EditBlockEntry };
