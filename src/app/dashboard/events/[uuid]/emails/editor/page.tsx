import { getTranslations } from "next-intl/server";

import { Editor } from "@/components/editor/index";
import { rootDefaults } from "@/lib/editor";
import { getAttributeTags, getFormTags } from "@/lib/message-tags/tag-builders";

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
  params: Promise<{ uuid: string }>;
}) {
  const t = await getTranslations("Editor");
  const tMessageTags = await getTranslations("MessageTags");

  const { uuid } = await params;

  const attributes = await getEventAttributes(uuid);
  const forms = await getEventForms(uuid);
  const event = await getEmailEventInfo(uuid);

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
        emailUuid: null,
        eventUuid: uuid,
        mode: "create",
      }}
      eventData={{
        name: event?.name ?? t("event"),
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
