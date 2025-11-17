import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getEventAttributes,
  getEventForms,
  getSingleEventEmail,
} from "../data-access";
import { EventEmailEditForm } from "./edit-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}): Promise<Metadata> {
  const { id, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailId);

  return {
    title: `Edytowanie ${emailToEdit?.name ?? "maila"}`,
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}) {
  const { id, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailId);
  const attributes = await getEventAttributes(id);
  const forms = await getEventForms(id);

  if (emailToEdit == null) {
    notFound();
  } else {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href={`/dashboard/events/${id}/emails`}
          className="flex items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> Wróć do szablonów
        </Link>
        <h1 className="text-2xl font-bold">Edytuj szablon maila</h1>
        <EventEmailEditForm
          eventId={id}
          emailToEdit={emailToEdit}
          eventAttributes={attributes}
          eventForms={forms}
        />
      </div>
    );
  }
}
