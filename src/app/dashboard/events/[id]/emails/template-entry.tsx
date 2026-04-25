import { SquarePen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventEmail, SingleEventEmail } from "@/types/emails";

import { DeleteEmailPopup } from "./delete-email-popup";
import { MailHistoryPopup } from "./mail-history-popup";

function EmailTriggerLabel({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);

  if (target === undefined) {
    return null;
  }

  return <p className="text-muted-foreground">{target.name}</p>;
}

function EmailTemplateEntry({
  eventId,
  emailTemplate,
  singleEmail,
}: {
  emailTemplate: EventEmail;
  eventId: string;
  singleEmail: SingleEventEmail | null;
}) {
  return (
    <div className="bg-background flex h-64 flex-col justify-between rounded-md border border-slate-500 p-4 sm:w-64">
      <div className="flex items-center justify-end">
        <Button variant="eventGhost" size="icon" title="Edytuj szablon" asChild>
          <Link href={`emails/editor/${emailTemplate.id.toString()}`}>
            <SquarePen />
            <span className="sr-only">Edytuj szablon</span>
          </Link>
        </Button>
        {singleEmail !== null && <MailHistoryPopup email={singleEmail} />}
        <DeleteEmailPopup
          eventId={eventId}
          mailId={emailTemplate.id.toString()}
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
