import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { Editor } from "@/components/editor/index";
import { getAttributeTags, getFormTags } from "@/lib/message-tags/tag-builders";
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
  params: Promise<{ id: string; emailUuid: string }>;
}): Promise<Metadata> {
  const t = await getTranslations("Dashboard");

  const { id, emailUuid } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailUuid);

  return {
    title: t("editing", { name: emailToEdit?.name ?? t("unnamedEmail") }),
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string; emailUuid: string }>;
}) {
  const t = await getTranslations("Editor");
  const tMessageTags = await getTranslations("MessageTags");

  const { id, emailUuid } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailUuid);

  if (emailToEdit?.schema == null) {
    redirect(`/dashboard/events/${id}/emails/${emailUuid}`);
  }

  const attributes = await getEventAttributes(id);
  const forms = await getEventForms(id);
  const event = await getEmailEventInfo(id);

  return (
    <Editor
      tags={[
        ...getAttributeTags(attributes, tMessageTags),
        ...getFormTags(forms, tMessageTags),
      ]}
      forms={forms}
      attributes={attributes}
      initialData={JSON.parse(emailToEdit.schema) as PuckData}
      mutationData={{
        emailUuid: emailToEdit.uuid,
        eventUuid: id,
        mode: "update",
      }}
      eventData={{
        name: event?.name ?? t("event"),
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
