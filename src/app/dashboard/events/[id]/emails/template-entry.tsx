import { SquarePen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { EventEmail } from "@/types/emails";

function EmailTemplateEntry({
  emailTemplate,
}: {
  emailTemplate: EventEmail;
  eventId: string;
}) {
  return (
    <div className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4">
      <div className="flex items-center justify-end">
        {/* TODO: Implement form edit view */}
        <Button variant="ghost" size="icon" asChild>
          <Link href={`templates/${emailTemplate.id.toString()}`}>
            <SquarePen />
            <span className="sr-only">Edytuj szablon maila</span>
          </Link>
        </Button>
        {/* todo: deleting */}
      </div>
      <div className="flex grow flex-col items-center justify-center gap-2">
        <p className="text-lg font-bold">{emailTemplate.name}</p>
        <p className="text-muted-foreground">Lorem ipsum dolor sit amet.</p>
      </div>
    </div>
  );
}

export { EmailTemplateEntry };
