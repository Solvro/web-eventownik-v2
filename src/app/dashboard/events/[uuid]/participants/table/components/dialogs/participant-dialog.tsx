"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { cn } from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type { FormDefinition } from "@/types/forms";
import type { Participant, PublicParticipant } from "@/types/participant";

import {
  createParticipant,
  editParticipant,
  getAttributes,
  getParticipant,
} from "../../../actions";
import { getChangedValues } from "../../core/utils";

function getInitialValues(
  participant: Participant,
  formDefinitions: FormDefinition[],
) {
  const values: Record<string, unknown> = { email: participant.email };

  for (const definition of formDefinitions) {
    const attribute = definition.attribute;
    const pa = participant.attributes.find(
      (participantAttribute) => participantAttribute.uuid === attribute.uuid,
    );
    const value = pa?.value;

    const isMultiple = (attribute.config.maxSelections ?? 1) > 1;

    if (attribute.type === "block" && isMultiple) {
      values[attribute.uuid] =
        value == null ? [] : Array.isArray(value) ? value : [value];
    } else if (value != null) {
      values[attribute.uuid] = Array.isArray(value) ? value.join(",") : value;
    }
  }

  return values;
}

function toUserData(
  participant: Participant,
  formDefinitions: FormDefinition[],
  eventUuid: string,
): PublicParticipant {
  return {
    uuid: participant.uuid,
    email: participant.email,
    eventUuid,
    createdAt: participant.createdAt,
    attributes: formDefinitions.flatMap((definition) => {
      const pa = participant.attributes.find(
        (attribute) => attribute.uuid === definition.attribute.uuid,
      );
      if (pa === undefined) {
        return [];
      }
      return [
        {
          uuid: pa.uuid,
          participantUuid: participant.uuid,
          attributeUuid: definition.attribute.uuid,
          value: pa.value == null ? "" : (pa.value as string | number),
          createdAt: pa.createdAt,
          updatedAt: pa.updatedAt,
          attribute: definition.attribute,
        },
      ];
    }),
  };
}

function RegistrationDateTime({ createdAt }: { createdAt: string }) {
  const t = useTranslations("Table");
  const date = new Date(createdAt);
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

interface ParticipantFormContentProps {
  eventUuid: string;
  blocks: (Block | null)[] | null;
  /**
   * Participant to edit - when not provided, the form creates a new participant
   */
  participantUuid?: string;
  onSuccess?: () => void;
  className?: string;
}

export function ParticipantFormContent({
  eventUuid,
  blocks,
  participantUuid,
  onSuccess,
  className,
}: ParticipantFormContentProps) {
  const t = useTranslations("Table");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isEditMode = participantUuid != null;

  // All event attributes, not only the registration form ones - organizers can set anything
  const {
    data: attributes,
    isLoading: isFormLoading,
    isError: isFormError,
  } = useQuery({
    queryKey: ["attributes", eventUuid],
    queryFn: async () => getAttributes(eventUuid),
  });

  const {
    data: participantDetails,
    isLoading: isParticipantLoading,
    isError: isParticipantError,
  } = useQuery({
    queryKey: ["participant", eventUuid, participantUuid],
    queryFn: async () => {
      const result = await getParticipant(eventUuid, participantUuid ?? "");
      if (result == null) {
        throw new Error("Failed to fetch participant");
      }
      return result;
    },
    enabled: isEditMode,
  });

  // File and drawing uploads are not supported by the dashboard endpoints
  const formDefinitions = useMemo<FormDefinition[]>(
    () =>
      (attributes ?? [])
        .filter(
          (attribute) =>
            attribute.type !== "file" && attribute.type !== "drawing",
        )
        .map((attribute) => ({
          formUuid: "",
          isRequired: false,
          order: attribute.order,
          attribute,
        })),
    [attributes],
  );
  const hasSkippedAttributes =
    attributes != null && formDefinitions.length !== attributes.length;

  const eventBlocks = useMemo(
    () => (blocks ?? []).filter((block): block is Block => block != null),
    [blocks],
  );

  const isLoading = isFormLoading || (isEditMode && isParticipantLoading);
  const isError = isFormError || (isEditMode && isParticipantError);

  async function handleSuccess() {
    onSuccess?.();
    toast({
      title: isEditMode
        ? t("editParticipantSuccess")
        : t("addParticipantSuccess"),
      description: isEditMode
        ? t("editParticipantSuccessDescription")
        : t("addParticipantSuccessDescription"),
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["participants", eventUuid] }),
      queryClient.invalidateQueries({ queryKey: ["participant", eventUuid] }),
      queryClient.invalidateQueries({ queryKey: ["blocks", eventUuid] }),
    ]);
  }

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
  if (isEditMode && participantDetails == null) {
    return null;
  }

  const initialValues =
    participantDetails == null
      ? undefined
      : getInitialValues(participantDetails, formDefinitions);

  return (
    <div className="flex flex-col gap-4">
      {hasSkippedAttributes ? (
        <p className="text-muted-foreground w-full text-sm">
          {t("addParticipantSkippedAttributes")}
        </p>
      ) : null}
      <ParticipantForm
        key={participantUuid ?? "new"}
        formDefinitions={formDefinitions}
        eventBlocks={eventBlocks}
        includeEmail
        withCaptcha={false}
        className={cn(
          "grid max-w-none gap-4 space-y-0 sm:grid-cols-2",
          className,
        )}
        submitLabel={t("save")}
        editMode={isEditMode}
        userData={
          participantDetails == null
            ? undefined
            : toUserData(participantDetails, formDefinitions, eventUuid)
        }
        initialValues={initialValues}
        header={
          participantDetails == null ? null : (
            <RegistrationDateTime createdAt={participantDetails.createdAt} />
          )
        }
        onSubmit={async (values) =>
          isEditMode
            ? editParticipant(
                eventUuid,
                participantUuid,
                getChangedValues(values, initialValues ?? {}),
              )
            : createParticipant(eventUuid, values)
        }
        onSuccess={() => {
          void handleSuccess();
        }}
      />
    </div>
  );
}

export function AddParticipantDialog({
  eventUuid,
  blocks,
}: {
  eventUuid: string;
  blocks: (Block | null)[] | null;
}) {
  const t = useTranslations("Table");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10"
          aria-label={t("addParticipantTrigger")}
        >
          <UserPlus />
          <span className="max-md:sr-only">{t("addParticipantTrigger")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-h-[90vh] sm:max-w-3xl"
        onOpenAutoFocus={(event) => {
          // Default autofocus lands on the required-field tooltip trigger and opens it
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("addParticipantTitle")}</DialogTitle>
          <DialogDescription>
            {t("addParticipantDescription")}
          </DialogDescription>
        </DialogHeader>
        <ParticipantFormContent
          eventUuid={eventUuid}
          blocks={blocks}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
