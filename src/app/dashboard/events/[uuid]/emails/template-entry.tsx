import { SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { V3EmailSummary } from "@/types/v3";

import { DeleteEmailPopup } from "./delete-email-popup";
import { MailHistoryPopup } from "./mail-history-popup";

function EmailTriggerLabel({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value.toUpperCase() === trigger);
  const t = useTranslations("EmailTriggers");

  if (target === undefined) {
    return null;
  }

  return <p className="text-muted-foreground">{t(target.name)}</p>;
}

function EmailTemplateEntry({
  eventUuid,
  emailTemplate,
}: {
  emailTemplate: V3EmailSummary;
  eventUuid: string;
}) {
  const t = useTranslations("Dashboard");

  return (
    <div className="bg-background flex h-64 w-full min-w-0 flex-col justify-between rounded-md border border-slate-500 p-4 sm:w-64">
      <div className="flex items-center justify-end">
        <Button
          variant="eventGhost"
          size="icon"
          title={t("editTemplate")}
          asChild
        >
          <Link href={`emails/${emailTemplate.id}`}>
            <SquarePen />
            <span className="sr-only">{t("editTemplate")}</span>
          </Link>
        </Button>
        <MailHistoryPopup eventUuid={eventUuid} emailUuid={emailTemplate.id} />
        <DeleteEmailPopup
          eventUuid={eventUuid}
          mailUuid={emailTemplate.id}
          mailName={emailTemplate.name}
        />
      </div>
      <div className="flex grow flex-col items-center justify-center gap-2 text-center">
        <p className="line-clamp-2 w-full overflow-hidden text-lg font-bold text-wrap">
          {emailTemplate.name}
        </p>
        <EmailTriggerLabel trigger={emailTemplate.trigger} />
      </div>
    </div>
  );
}

export { EmailTemplateEntry };
