import { SquarePen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventEmail } from "@/types/emails";

import { getSingleEventEmail } from "./data-access";
import { DeleteEmailPopup } from "./delete-email-popup";
import { MailHistoryPopup } from "./mail-history-popup";

function EmailTriggerLabel({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);

  if (target === undefined) {
    return null;
  }

  return <p className="text-muted-foreground">{target.name}</p>;
}

async function EmailTemplateEntry({
  eventId,
  emailTemplate,
}: {
  emailTemplate: EventEmail;
  eventId: string;
}) {
  const targetMail = await getSingleEventEmail(
    eventId,
    emailTemplate.id.toString(),
  );

  return (
    <div className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4">
      <div className="flex items-center justify-end">
        <Button variant="eventGhost" size="icon" title="Edytuj szablon" asChild>
          <Link href={`emails/${emailTemplate.id.toString()}`}>
            <SquarePen />
            <span className="sr-only">Edytuj szablon</span>
          </Link>
        </Button>
        {targetMail !== null && <MailHistoryPopup email={targetMail} />}
        <DeleteEmailPopup
          eventId={eventId}
          mailId={emailTemplate.id.toString()}
          mailName={emailTemplate.name}
        />
      </div>
      <div className="flex grow flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-bold">{emailTemplate.name}</p>
        <EmailTriggerLabel trigger={emailTemplate.trigger} />
      </div>
    </div>
  );
}

export { EmailTemplateEntry };
