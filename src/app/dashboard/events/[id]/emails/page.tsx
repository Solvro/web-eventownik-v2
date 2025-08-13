import { SquarePlus } from "lucide-react";
import Link from "next/link";

// import { CreateEmailTemplateForm } from "./create-email-template-form";
import {
  // getEventAttributes,
  getEventEmails,
  // getEventForms,
} from "./data-access";
import { EmailTemplateEntry } from "./template-entry";

export default async function DashboardEventEmailTemplatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const templates = await getEventEmails(id);
  // const attributes = await getEventAttributes(id);
  // const forms = await getEventForms(id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Szablony maili</h1>
      <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
        {/* New create email template form */}
        <Link
          href="emails/new"
          className="border-muted text-muted-foreground flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted p-4"
        >
          <SquarePlus className="h-6 w-6" /> Stwórz szablon
        </Link>
        {/* Old create email template form */}
        {/* <CreateEmailTemplateForm
          eventId={id}
          eventAttributes={attributes}
          eventForms={forms}
        /> */}
        {templates === null ? (
          <p className="text-red-600">Nie udało się pobrać szablonów</p>
        ) : (
          templates.map((template) => (
            <EmailTemplateEntry
              emailTemplate={template}
              eventId={id}
              key={template.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
