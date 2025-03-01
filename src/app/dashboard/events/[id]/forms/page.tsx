import { getEventAttributes, getEventForms } from "./data-access";
import { EventFormForm } from "./event-form-form";
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
      <h1 className="text-3xl font-bold">Formularze</h1>
      <div className="mt-8 flex flex-wrap gap-8">
        <EventFormForm eventId={id} attributes={attributes} />
        {forms.length > 0
          ? forms.map((form) => (
              <FormEntry form={form} eventId={id} key={form.id} />
            ))
          : null}
      </div>
    </div>
  );
}
