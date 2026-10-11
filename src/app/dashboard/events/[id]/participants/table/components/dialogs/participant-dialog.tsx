"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { CalendarIcon, Clock, Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { ParticipantForm } from "@/components/participant-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { FormAttribute } from "@/types/attributes";
import type { Block, PublicBlock } from "@/types/blocks";
import type {
  FlattenedParticipant,
  Participant,
  PublicParticipant,
} from "@/types/participant";

import {
  createParticipant,
  editParticipant,
  getParticipant,
  getRegistrationForm,
} from "../../../actions";

interface ParticipantDialogProps {
  eventId: string;
  blocks: (Block | null)[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Participant to edit - when not provided, the dialog creates a new participant
   */
  participant?: FlattenedParticipant | null;
  trigger?: React.ReactNode;
}

function getInitialValues(
  participant: Participant,
  attributes: FormAttribute[],
) {
  const values: Record<string, unknown> = { email: participant.email };

  for (const attribute of attributes) {
    const value = participant.attributes.find(
      (participantAttribute) => participantAttribute.id === attribute.id,
    )?.value as string | string[] | null | undefined;

    if (attribute.type === "block" && attribute.isMultiple) {
      values[attribute.id.toString()] =
        value == null ? [] : Array.isArray(value) ? value : [value];
    } else if (value != null) {
      values[attribute.id.toString()] = Array.isArray(value)
        ? value.join(",")
        : value;
    }
  }

  return values;
}

function toUserData(
  participant: Participant,
  attributes: FormAttribute[],
): PublicParticipant {
  return {
    ...participant,
    eventId: 0,
    attributes: attributes.flatMap((attribute) => {
      const value = participant.attributes.find(
        (participantAttribute) => participantAttribute.id === attribute.id,
      )?.value as string | string[] | null | undefined;
      const values =
        value == null ? [] : Array.isArray(value) ? value : [value];

      return values.map((pivotValue) => ({
        ...attribute,
        meta: {
          pivot_value: pivotValue,
          pivot_created_at: "",
          pivot_participant_id: participant.id,
          pivot_attribute_id: attribute.id,
          pivot_updated_at: "",
        },
      }));
    }),
  };
}

function RegistrationDateTime({ createdAt }: { createdAt: string }) {
  const t = useTranslations("Table");
  const date = parse(createdAt, "yyyy-MM-dd HH:mm:ss", new Date());
  const isValidDate = !Number.isNaN(date.getTime());

  return (
    <div className="space-y-2">
      <Label>{t("participantRegistrationDateTime")}</Label>
      <div className="flex gap-2" aria-readonly="true">
        <div className="border-input bg-muted/50 text-muted-foreground flex h-10 flex-1 items-center gap-2 rounded-md border px-3 text-sm">
          <CalendarIcon className="size-4" />
          {isValidDate ? format(date, "dd.MM.yyyy") : "-"}
        </div>
        <div className="border-input bg-muted/50 text-muted-foreground flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
          <Clock className="size-4" />
          {isValidDate ? format(date, "HH:mm") : "--:--"}
        </div>
      </div>
    </div>
  );
}

export function ParticipantDialog({
  eventId,
  blocks,
  open,
  onOpenChange,
  participant,
  trigger,
}: ParticipantDialogProps) {
  const t = useTranslations("Table");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isEditMode = participant != null;

  const {
    data: registrationForm,
    isLoading: isFormLoading,
    isError: isFormError,
  } = useQuery({
    queryKey: ["registrationForm", eventId],
    queryFn: async () => getRegistrationForm(eventId),
    enabled: open,
  });

  const {
    data: participantDetails,
    isLoading: isParticipantLoading,
    isError: isParticipantError,
  } = useQuery({
    queryKey: ["participant", eventId, participant?.id],
    queryFn: async () => {
      const result = await getParticipant(
        eventId,
        String(participant?.id ?? ""),
      );
      if (result == null) {
        throw new Error("Failed to fetch participant");
      }
      return result;
    },
    enabled: open && isEditMode,
  });

  // File and drawing uploads are not supported by the dashboard endpoints
  const attributes = useMemo(
    () =>
      registrationForm?.attributes.filter(
        (attribute) =>
          attribute.type !== "file" && attribute.type !== "drawing",
      ) ?? [],
    [registrationForm],
  );
  const hasSkippedAttributes =
    registrationForm != null &&
    attributes.length !== registrationForm.attributes.length;

  const eventBlocks = useMemo(
    () => (blocks ?? []).filter((block) => block != null) as PublicBlock[],
    [blocks],
  );

  const isLoading = isFormLoading || (isEditMode && isParticipantLoading);
  const isError = isFormError || (isEditMode && isParticipantError);

  async function handleSuccess() {
    onOpenChange(false);
    toast({
      title: isEditMode
        ? t("editParticipantSuccess")
        : t("addParticipantSuccess"),
      description: isEditMode
        ? t("editParticipantSuccessDescription")
        : t("addParticipantSuccessDescription"),
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] }),
      queryClient.invalidateQueries({ queryKey: ["participant", eventId] }),
      queryClient.invalidateQueries({ queryKey: ["blocks", eventId] }),
    ]);
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      );
    }
    if (isError) {
      return (
        <p className="text-center text-sm text-red-500">
          {isFormError
            ? t("addParticipantFormError")
            : t("editParticipantLoadError")}
        </p>
      );
    }
    if (registrationForm == null) {
      return (
        <p className="text-muted-foreground text-center text-sm">
          {t("addParticipantNoForm")}
        </p>
      );
    }
    if (isEditMode && participantDetails == null) {
      return null;
    }

    return (
      <div className="flex flex-col items-center gap-4">
        {hasSkippedAttributes ? (
          <p className="text-muted-foreground w-full text-sm">
            {t("addParticipantSkippedAttributes")}
          </p>
        ) : null}
        <ParticipantForm
          key={participant?.id ?? "new"}
          attributes={attributes}
          eventBlocks={eventBlocks}
          includeEmail
          withCaptcha={false}
          editMode={isEditMode}
          userData={
            participantDetails == null
              ? undefined
              : toUserData(participantDetails, attributes)
          }
          initialValues={
            participantDetails == null
              ? undefined
              : getInitialValues(participantDetails, attributes)
          }
          header={
            isEditMode ? (
              <RegistrationDateTime createdAt={participant.createdAt} />
            ) : null
          }
          onSubmit={async (values) =>
            isEditMode
              ? editParticipant(eventId, participant.id, values)
              : createParticipant(eventId, values)
          }
          onSuccess={() => {
            void handleSuccess();
          }}
        />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger == null ? null : (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("editParticipantTitle") : t("addParticipantTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("editParticipantDescription")
              : t("addParticipantDescription")}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

export function AddParticipantDialog({
  eventId,
  blocks,
}: {
  eventId: string;
  blocks: (Block | null)[] | null;
}) {
  const t = useTranslations("Table");
  const [open, setOpen] = useState(false);

  return (
    <ParticipantDialog
      eventId={eventId}
      blocks={blocks}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          className="h-10"
          aria-label={t("addParticipantTrigger")}
        >
          <UserPlus />
          <span className="max-md:sr-only">{t("addParticipantTrigger")}</span>
        </Button>
      }
    />
  );
}
