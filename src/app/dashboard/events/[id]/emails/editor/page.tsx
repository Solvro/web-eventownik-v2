import { Editor } from "@/components/editor/index";
import { ATTRIBUTE_CATEGORY, FORM_CATEGORY } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getAttributeLabel } from "@/lib/utils";

import {
  getEmailEventInfo,
  getEventAttributes,
  getEventForms,
} from "../data-access";

export function generateMetadata() {
  return {
    title: `Nowy szablon`,
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}) {
  const { id } = await params;

  const attributes = await getEventAttributes(id);
  const forms = await getEventForms(id);
  const event = await getEmailEventInfo(id);

  const attributeTags = attributes.map((attribute): MessageTag => {
    return {
      title: getAttributeLabel(attribute.name, "pl"),
      description: `Zamienia się w wartość atrybutu '${attribute.name}' uczestnika`,
      // NOTE: Why 'attribute.slug' can be null?
      value: `/participant_${attribute.slug ?? ""}`,
      color: "brown",
      category: ATTRIBUTE_CATEGORY,
    };
  }) satisfies MessageTag[];

  const formTags = forms.map((eventForm): MessageTag => {
    return {
      title: eventForm.name,
      description: `Zamienia się w spersonalizowany link do formularza '${eventForm.name}'`,
      value: `/form_${eventForm.slug}`,
      color: "green",
      category: FORM_CATEGORY,
    };
  }) satisfies MessageTag[];

  return (
    <Editor
      tags={[...attributeTags, ...formTags]}
      forms={forms}
      initialData={{
        root: {
          props: {
            // NOTE: Update if the defaults change
            name: "Nowa wiadomość",
            trigger: "manual",
          },
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
        name: event?.name ?? "Wydarzenie",
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
