import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventAttributes, getSingleEventForm } from "../data-access";
import { EventFormEditForm } from "./edit-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}): Promise<Metadata> {
  const { id, formId } = await params;

  const formToEdit = await getSingleEventForm(id, formId);

  return {
    title: `Edytowanie ${formToEdit?.name ?? "formularza"}`,
  };
}

export default async function EventFormEditPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}) {
  const { id, formId } = await params;

  const formToEdit = await getSingleEventForm(id, formId);
  const eventAttributes = await getEventAttributes(id);

  if (formToEdit == null) {
    notFound();
  } else {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href={`/dashboard/events/${id}/forms`}
          className="flex items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> Wróć do formularzy
        </Link>
        <h1 className="text-2xl font-bold">Edytuj formularz</h1>
        <EventFormEditForm
          eventId={id}
          formToEdit={formToEdit}
          eventAttributes={eventAttributes}
        />
      </div>
    );
  }
}
