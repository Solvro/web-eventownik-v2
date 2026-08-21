import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CreateEventFormForm } from "./create-event-form-form";
import { getEventAttributes, getEventForms } from "./data-access";
import { SortableFormGrid } from "./sortable-form-grid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Sidebar");

  return {
    title: t("forms"),
  };
}

export default async function DashboardEventFormsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const forms = await getEventForms(uuid);
  const attributes = await getEventAttributes(uuid);
  const t = await getTranslations("EventDetails");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Formularze</h1>
        <CreateEventFormForm eventId={uuid} attributes={attributes} />
      </div>
      {forms.length > 0 ? (
        <SortableFormGrid forms={forms} eventUuid={uuid} />
      ) : (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">{t("noFormsYet")}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
