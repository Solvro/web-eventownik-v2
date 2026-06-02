import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import sanitize from "sanitize-html";

import { EMAIL_ALLOWED_ATTRIBUTES, EMAIL_ALLOWED_TAGS } from "@/lib/editor";

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

  const fetchedEmail = await getSingleEventEmail(id, emailId);

  if (fetchedEmail == null) {
    notFound();
  }

  if (fetchedEmail.schema !== null) {
    redirect(`/dashboard/events/${id}/emails/editor/${emailId}`);
  }

  const emailToEdit = {
    ...fetchedEmail,
    content: sanitize(fetchedEmail.content, {
      allowedTags: EMAIL_ALLOWED_TAGS,
      allowedAttributes: EMAIL_ALLOWED_ATTRIBUTES,
    }),
  };

  const [attributes, forms] = await Promise.all([
    getEventAttributes(id),
    getEventForms(id),
  ]);

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
