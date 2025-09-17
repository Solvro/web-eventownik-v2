"use client";

import { useTranslations } from "next-intl";

import { registerParticipant } from "@/app/[eventSlug]/actions";
import { ParticipantForm } from "@/components/participant-form";
import type { Event } from "@/types/event";

export function RegisterParticipantForm({ event }: { event: Event }) {
  const t = useTranslations("Form");

  if (event.firstForm === null) {
    return (
      <div>
        <p className="text-sm text-red-500">{t("noForm")}</p>
      </div>
    );
  }

  return (
    <ParticipantForm
      attributes={event.firstForm.attributes}
      onSubmit={async (values, files) =>
        registerParticipant(
          values as { email: string } & Record<string, unknown>,
          event,
          files,
        )
      }
      successMessage={t("successMessage")}
      submitButtonText={t("signUp")}
      submittingText={t("registering")}
      includeEmail={true}
    />
  );
}
