import { SquarePlus } from "lucide-react";
import Link from "next/link";

import { getEventForms } from "./data-access";
import { FormEntry } from "./form-entry";

export default async function DashboardEventFormsPage({
  params,
}: {
  params: { id: string };
}) {
  const forms = await getEventForms(params.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Formularze</h1>
      <div className="mt-8 flex flex-wrap gap-8">
        <Link
          href="forms/create"
          className="flex h-64 w-64 items-center justify-center gap-2 rounded-md border border-dotted border-muted p-4 text-muted-foreground"
        >
          <SquarePlus className="h-6 w-6" /> Stwórz formularz
        </Link>
        {forms.length > 0
          ? forms.map((form) => <FormEntry form={form} key={form.id} />)
          : null}
      </div>
    </div>
  );
}
