import { CreateEventFormForm } from "./create-event-form-form";
import { getEventAttributes, getEventForms } from "./data-access";
import { FormEntry } from "./form-entry";

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
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Formularze</h1>
        <CreateEventFormForm eventId={id} attributes={attributes} />
      </div>
      <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
        {forms.length > 0
          ? forms.map((form) => (
              <FormEntry form={form} eventId={id} key={form.id} />
            ))
          : null}
      </div>
    </div>
  );
}
