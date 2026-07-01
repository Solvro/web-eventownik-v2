import { getTranslations } from "next-intl/server";

import { Editor } from "@/components/editor/index";
import { rootDefaults } from "@/lib/editor";
import { ATTRIBUTE_CATEGORY, FORM_CATEGORY } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getAttributeLabel } from "@/lib/utils";

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
  const t = await getTranslations();
  const { id } = await params;

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
      initialData={{
        root: {
          props: { ...rootDefaults, name: t("Editor.newMessage") },
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
        name: event?.name ?? t("Editor.event"),
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
