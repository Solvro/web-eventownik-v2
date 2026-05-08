import { FileText } from "lucide-react";
import type { Metadata } from "next";

import { CreateEventFormForm } from "./create-event-form-form";
import { getEventAttributes, getEventForms } from "./data-access";
import { SortableFormGrid } from "./sortable-form-grid";

export const metadata: Metadata = {
  title: "Formularze",
};

export default async function DashboardEventFormsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const forms = await getEventForms(id);
  const attributes = await getEventAttributes(id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Formularze</h1>
        <CreateEventFormForm eventId={id} attributes={attributes} />
      </div>
      {forms.length > 0 ? (
        <SortableFormGrid forms={forms} eventId={id} />
      ) : (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">
              Nie masz jeszcze żadnego formularza
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
