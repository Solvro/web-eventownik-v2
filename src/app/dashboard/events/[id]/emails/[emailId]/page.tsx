import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import sanitize from "sanitize-html";

import { Editor } from "@/components/editor/index";
import { EMAIL_ALLOWED_ATTRIBUTES, EMAIL_ALLOWED_TAGS } from "@/lib/editor";
import { ATTRIBUTE_CATEGORY, FORM_CATEGORY } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getAttributeLabel } from "@/lib/utils";
import type { PuckData } from "@/types/editor";

import {
  getEmailEventInfo,
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

  const emailToEdit = {
    ...fetchedEmail,
    content: sanitize(fetchedEmail.content, {
      allowedTags: EMAIL_ALLOWED_TAGS,
      allowedAttributes: EMAIL_ALLOWED_ATTRIBUTES,
    }),
  };

  const isBlockBased = emailToEdit.schema !== null;

  const [attributes, forms] = await Promise.all([
    getEventAttributes(id),
    getEventForms(id),
  ]);

  if (isBlockBased) {
    const event = await getEmailEventInfo(id);

    const attributeTags = attributes.map(
      (attribute): MessageTag => ({
        title: getAttributeLabel(attribute.name, "pl"),
        description: `Zamienia się w wartość atrybutu '${attribute.name}' uczestnika`,
        value: `/participant_${attribute.slug ?? ""}`,
        color: "brown",
        category: ATTRIBUTE_CATEGORY,
      }),
    ) satisfies MessageTag[];

    const formTags = forms.map(
      (eventForm): MessageTag => ({
        title: eventForm.name,
        description: `Zamienia się w spersonalizowany link do formularza '${eventForm.name}'`,
        value: `/form_${eventForm.slug}`,
        color: "green",
        category: FORM_CATEGORY,
      }),
    ) satisfies MessageTag[];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const initialData = JSON.parse(emailToEdit.schema!) as PuckData;

    return (
      <Editor
        tags={[...attributeTags, ...formTags]}
        forms={forms}
        attributes={attributes}
        initialData={initialData}
        mutationData={{
          emailId: emailToEdit.id.toString(),
          eventId: id,
          mode: "update",
        }}
        eventData={{
          name: event?.name ?? "Wydarzenie",
          photoUrl: event?.photoUrl ?? "",
        }}
      />
    );
  }

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
