"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Block, PublicBlock } from "@/types/blocks";

import { createParticipant, getRegistrationForm } from "../../../actions";

interface AddParticipantDialogProps {
  eventId: string;
  blocks: (Block | null)[] | null;
}

export function AddParticipantDialog({
  eventId,
  blocks,
}: AddParticipantDialogProps) {
  const t = useTranslations("Table");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const {
    data: registrationForm,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["registrationForm", eventId],
    queryFn: async () => getRegistrationForm(eventId),
    enabled: open,
  });

  // File and drawing uploads are not supported by the dashboard endpoint
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

  async function handleSuccess() {
    setOpen(false);
    toast({
      title: t("addParticipantSuccess"),
      description: t("addParticipantSuccessDescription"),
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] }),
      queryClient.invalidateQueries({ queryKey: ["blocks", eventId] }),
    ]);
  }

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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addParticipantTitle")}</DialogTitle>
          <DialogDescription>
            {t("addParticipantDescription")}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-red-500">
            {t("addParticipantFormError")}
          </p>
        ) : registrationForm == null ? (
          <p className="text-muted-foreground text-center text-sm">
            {t("addParticipantNoForm")}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {hasSkippedAttributes ? (
              <p className="text-muted-foreground w-full text-sm">
                {t("addParticipantSkippedAttributes")}
              </p>
            ) : null}
            <ParticipantForm
              attributes={attributes}
              eventBlocks={eventBlocks}
              includeEmail
              withCaptcha={false}
              onSubmit={async (values) => createParticipant(eventId, values)}
              onSuccess={() => {
                void handleSuccess();
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
