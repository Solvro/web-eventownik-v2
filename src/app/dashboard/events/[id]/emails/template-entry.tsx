import { SquarePen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EMAIL_TRIGGERS } from "@/lib/emails";
import type { EventEmail, SingleEventEmail } from "@/types/emails";

import { getSingleEventEmail } from "./data-access";
import { DeleteEmailPopup } from "./delete-email-popup";
import { MailHistoryPopup } from "./mail-history-popup";
import { createMockEmailHistory } from "./mocks/email-history";

function EmailTriggerLabel({ trigger }: { trigger: string }) {
  const target = EMAIL_TRIGGERS.find((t) => t.value === trigger);

  if (target === undefined) {
    return null;
  }

  return <p className="text-muted-foreground">{target.name}</p>;
}

const useEmailHistoryMocks = false;

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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const emailForHistory: SingleEventEmail | null = useEmailHistoryMocks
    ? createMockEmailHistory(emailTemplate)
    : targetMail;

  return (
    <div className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4">
      <div className="flex items-center justify-end">
        <Button variant="eventGhost" size="icon" title="Edytuj szablon" asChild>
          <Link href={`emails/${emailTemplate.id.toString()}`}>
            <SquarePen />
            <span className="sr-only">Edytuj szablon</span>
          </Link>
        </Button>
        {emailForHistory !== null && (
          <MailHistoryPopup email={emailForHistory} />
        )}
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
