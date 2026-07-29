"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createBlock } from "@/app/dashboard/events/[id]/blocks/actions";
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

import { BlockForm, BlockSchema } from "./block-form";
import type { BlockFormValues } from "./block-form";

function CreateBlockForm({
  eventId,
  attributeId,
  parentId,
}: {
  eventId: string;
  attributeId: string;
  parentId: string;
}) {
  const t = useTranslations("EventDetails");
  const form = useForm<BlockFormValues>({
    resolver: zodResolver(BlockSchema),
    defaultValues: {
      name: "",
      capacity: "",
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
    const result = await createBlock(
      eventId,
      attributeId,
      parentId,
      data.name,
      null,
      data.capacity === "" || data.capacity === undefined
        ? null
        : data.capacity,
    );
    if (result.success) {
      toast({
        title: t("newBlockCreated"),
      });
      form.reset();
      setDialogOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: t("failedToCreateBlock"),
        description: translateOrFallback(
          t,
          result.error?.key,
          result.error?.values,
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
        <Button variant="outline" className="w-full lg:w-fit">
          <SquarePlus className="h-6 w-6" /> {t("createBlock")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>{t("createBlock")}</DialogTitle>
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
          loadingText={t("creatingBlock")}
          submitText={t("createBlock")}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateBlockForm };
