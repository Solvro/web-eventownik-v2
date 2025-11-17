import { Mail } from "lucide-react";
import type { Metadata } from "next";

import { CreateEmailTemplateForm } from "./create-email-template-form";
import {
  getEventAttributes,
  getEventEmails,
  getEventForms,
} from "./data-access";
import { EmailTemplateEntry } from "./template-entry";

export const metadata: Metadata = {
  title: "Szablony maili",
};

export default async function DashboardEventEmailTemplatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const templates = await getEventEmails(id);
  const attributes = await getEventAttributes(id);
  const forms = await getEventForms(id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h1 className="text-3xl font-bold">Szablony maili</h1>
        <CreateEmailTemplateForm
          eventId={id}
          eventAttributes={attributes}
          eventForms={forms}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
        {templates === null ? (
          <p className="text-red-600">Nie udało się pobrać szablonów</p>
        ) : templates.length > 0 ? (
          templates.map((template) => (
            <EmailTemplateEntry
              emailTemplate={template}
              eventId={id}
              key={template.id}
            />
          ))
        ) : (
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <Mail className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">
              Nie masz jeszcze żadnego szablonu maila
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
