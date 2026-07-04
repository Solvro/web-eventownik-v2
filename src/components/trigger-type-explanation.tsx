import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

import { EMAIL_TRIGGERS } from "@/lib/emails";

export function TriggerTypeExplanation({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);
  const t = useTranslations();

  if (target === undefined) {
    return null;
  }

  return (
    <div className="flex w-full grow flex-col gap-2 rounded-md border border-(--event-primary-color)/25 p-4 sm:max-w-sm md:max-w-lg">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4" /> {t("EventDetails.explanation")}
      </div>
      <p className="text-sm">{t(`EmailTriggers.${target.description}`)}</p>
    </div>
  );
}
