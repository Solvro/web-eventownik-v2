import { getTranslations } from "next-intl/server";

import { Editor } from "@/components/editor/index";
import { rootDefaults } from "@/lib/editor";
import { getFormTags } from "@/lib/message-tags/tag-builders";
import { getAttributeTags } from "@/lib/message-tags/tag-builders";

import {
  getEmailEventInfo,
  getEventAttributes,
  getEventForms,
} from "../data-access";

export async function generateMetadata() {
  const t = await getTranslations("Editor");

  return {
    title: t("newTemplate"),
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("Editor");
  const tMessageTags = await getTranslations("MessageTags");

  const { id } = await params;

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
      initialData={{
        root: {
          props: { ...rootDefaults, name: t("newMessage") },
        },
        content: [],
        zones: {},
      }}
      mutationData={{
        emailId: null,
        eventId: id,
        mode: "create",
      }}
      eventData={{
        name: event?.name ?? t("event"),
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
