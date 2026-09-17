import { SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventEmail } from "@/types/emails";

import { DeleteEmailPopup } from "./delete-email-popup";
import { MailHistoryPopup } from "./mail-history-popup";

function EmailTriggerLabel({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);
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
  emailTemplate: EventEmail;
  eventUuid: string;
}) {
  const t = useTranslations("Dashboard");

  return (
    <div className="bg-background flex h-64 flex-col justify-between rounded-md border border-slate-500 p-4 sm:w-64">
      <div className="flex items-center justify-end">
        <Button
          variant="eventGhost"
          size="icon"
          title={t("editTemplate")}
          asChild
        >
          <Link href={`emails/${emailTemplate.uuid}`}>
            <SquarePen />
            <span className="sr-only">{t("editTemplate")}</span>
          </Link>
        </Button>
        <MailHistoryPopup
          eventUuid={eventUuid}
          emailUuid={emailTemplate.uuid}
        />
        <DeleteEmailPopup
          eventUuid={eventUuid}
          mailUuid={emailTemplate.uuid}
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
