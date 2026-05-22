import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventAttributes, getSingleEventForm } from "../data-access";
import { EventFormEditForm } from "./edit-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string; formUuid: string }>;
}): Promise<Metadata> {
  const { uuid, formUuid } = await params;

  const formToEdit = await getSingleEventForm(uuid, formUuid);

  return {
    title: `Edytowanie ${formToEdit?.name ?? "formularza"}`,
  };
}

export default async function EventFormEditPage({
  params,
}: {
  params: Promise<{ uuid: string; formUuid: string }>;
}) {
  const { uuid, formUuid } = await params;

  const formToEdit = await getSingleEventForm(uuid, formUuid);
  const eventAttributes = await getEventAttributes(uuid);

  if (formToEdit == null) {
    notFound();
  } else {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href={`/dashboard/events/${uuid}/forms`}
          className="flex items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> Wróć do formularzy
        </Link>
        <h1 className="text-2xl font-bold">Edytuj formularz</h1>
        <EventFormEditForm
          eventUuid={uuid}
          formToEdit={formToEdit}
          eventAttributes={eventAttributes}
        />
      </div>
    );
  }
}
