"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { translateOrFallback } from "@/i18n/utils";
import type { Attribute } from "@/types/attributes";
import type { Ticket } from "@/types/tickets";

import { updateTicketShownAttributes } from "./actions";
import { TicketForm, TicketSchema } from "./ticket-form";
import type { TicketFormValues } from "./ticket-form";

function EditTicketEntry({
  ticketToEdit,
  eventUuid,
  attributes,
}: {
  ticketToEdit: Ticket;
  eventUuid: string;
  attributes: Attribute[];
}) {
  const t = useTranslations("Tickets");
  const tEventDetails = useTranslations("EventDetails");
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      mode: ticketToEdit.mode,
      attributeUuid: ticketToEdit.attributeUuid ?? "",
      shownAttributeUuids: ticketToEdit.shownAttributeUuids,
    },
  });

  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const router = useRouter();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  const onSubmit = async (data: TicketFormValues) => {
    const result = await updateTicketShownAttributes(
      eventUuid,
      ticketToEdit.uuid,
      data.shownAttributeUuids,
    );
    if (result.success) {
      toast({
        title: t("ticketChangesSaved"),
      });
      form.reset(data);
      setDialogOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: t("failedToSaveTicketChanges"),
        description: translateOrFallback(
          tEventDetails,
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
        <Button
          variant="eventGhost"
          size="icon"
          className="relative"
          title={t("editTicket")}
        >
          <Edit />
          <span className="sr-only">{t("editTicket")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>{t("editTicket")}</DialogTitle>
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
        <TicketForm
          form={form}
          onSubmit={onSubmit}
          attributes={attributes}
          targetAttributes={attributes.filter(
            (attribute) => attribute.uuid === ticketToEdit.attributeUuid,
          )}
          isEditing
          loadingText={t("saving")}
          submitText={t("save")}
          idleIcon={Save}
        />
      </DialogContent>
    </Dialog>
  );
}

export { EditTicketEntry };
