"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import { translateOrFallback } from "@/i18n/utils";
import type { Attribute } from "@/types/attributes";
import type { TicketMode } from "@/types/tickets";

import { createTicket } from "./actions";
import { TicketForm, TicketSchema } from "./ticket-form";
import type { TicketFormValues } from "./ticket-form";

function CreateTicketForm({
  eventUuid,
  mode,
  attributes,
  targetAttributes,
  disabledReason,
}: {
  eventUuid: string;
  mode: TicketMode;
  attributes: Attribute[];
  /** Block attributes without a ticket yet */
  targetAttributes: Attribute[];
  /** Disables the trigger and explains why in a tooltip */
  disabledReason?: string;
}) {
  const t = useTranslations("Tickets");
  const tEventDetails = useTranslations("EventDetails");
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      mode,
      attributeUuid: "",
      shownAttributeUuids: [],
    },
  });
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const router = useRouter();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  const triggerText =
    mode === "EVENT" ? t("activateTicket") : t("createTicket");
  const title =
    mode === "EVENT" ? t("activateEventTicket") : t("createBlockTicket");

  const onSubmit = async (data: TicketFormValues) => {
    const result = await createTicket(
      eventUuid,
      data.mode === "EVENT"
        ? { mode: "EVENT", shownAttributeUuids: data.shownAttributeUuids }
        : {
            mode: "BLOCK",
            attributeUuid: data.attributeUuid,
            shownAttributeUuids: data.shownAttributeUuids,
          },
    );
    if (result.success) {
      toast({
        title:
          mode === "EVENT" ? t("eventTicketActivated") : t("ticketCreated"),
      });
      form.reset();
      setDialogOpen(false);
      setTimeout(() => {
        router.refresh();
      }, 100);
    } else {
      toast({
        title: t("failedToCreateTicket"),
        description: translateOrFallback(
          tEventDetails,
          result.error?.key,
          result.error?.values,
        ),
        variant: "destructive",
      });
    }
  };

  const triggerButton = (
    <Button
      variant="outline"
      // Disabled buttons don't fire pointer events, which the tooltip needs
      className="w-full disabled:pointer-events-auto disabled:cursor-not-allowed lg:w-fit"
      disabled={disabledReason !== undefined}
    >
      <SquarePlus className="h-6 w-6" /> {triggerText}
    </Button>
  );

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
      {disabledReason === undefined ? (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      )}
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
          targetAttributes={targetAttributes}
          loadingText={mode === "EVENT" ? t("activating") : t("creatingTicket")}
          submitText={mode === "EVENT" ? t("activate") : t("createTicket")}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateTicketForm };
