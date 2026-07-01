import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Editor } from "@/components/editor/index";
import { ATTRIBUTE_CATEGORY, FORM_CATEGORY } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getAttributeLabel } from "@/lib/utils";
import type { PuckData } from "@/types/editor";

import {
  getEmailEventInfo,
  getEventAttributes,
  getEventForms,
  getSingleEventEmail,
} from "../../data-access";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}): Promise<Metadata> {
  const t = await getTranslations("Dashboard");

  const { id, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailId);

  return {
    title: t("editing", { name: emailToEdit?.name ?? t("unnamedEmail") }),
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}) {
  const t = await getTranslations();

  const { id, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailId);

  if (emailToEdit?.schema == null) {
    redirect(`/dashboard/events/${id}/emails/${emailId}`);
  }

  const attributes = await getEventAttributes(id);
  const forms = await getEventForms(id);
  const event = await getEmailEventInfo(id);

  const attributeTags = attributes.map((attribute): MessageTag => {
    return {
      title: getAttributeLabel(attribute.name, "pl"),
      description: t("EventDetails.replacesWithParticipantAttributeValue", {
        name: attribute.name,
      }),
      // NOTE: Why 'attribute.slug' can be null?
      value: `/participant_${attribute.slug ?? ""}`,
      color: "brown",
      category: ATTRIBUTE_CATEGORY,
    };
  }) satisfies MessageTag[];

  const formTags = forms.map((eventForm): MessageTag => {
    return {
      title: eventForm.name,
      description: t("EventDetails.replacesWithPersonalizedFormLink", {
        name: eventForm.name,
      }),
      value: `/form_${eventForm.slug}`,
      color: "green",
      category: FORM_CATEGORY,
    };
  }) satisfies MessageTag[];

  return (
    <Editor
      tags={[...attributeTags, ...formTags]}
      forms={forms}
      attributes={attributes}
      initialData={JSON.parse(emailToEdit.schema) as PuckData}
      mutationData={{
        emailId: emailToEdit.id.toString(),
        eventId: id,
        mode: "update",
      }}
      eventData={{
        name: event?.name ?? t("Editor.event"),
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
