import type { useTranslations } from "next-intl";

import type { Attribute } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import type { MessageTag } from ".";
import { getAttributeLabel } from "../utils";
import { getCategories } from "./categories";

export function getAttributeTags(
  eventAttributes: Attribute[],
  t: ReturnType<typeof useTranslations<"MessageTags">>,
): MessageTag[] {
  const categories = getCategories(t);

  return eventAttributes.map((attribute) => ({
    title: getAttributeLabel(attribute.name, "pl"),
    description: t("attributeItemDesc", {
      name: getAttributeLabel(attribute.name, "pl"),
    }),
    value: `/participant_${attribute.uuid}`,
    color: "brown",
    category: categories.attribute,
  }));
}

export function getFormTags(
  eventForms: EventForm[],
  t: ReturnType<typeof useTranslations<"MessageTags">>,
): MessageTag[] {
  const categories = getCategories(t);

  return eventForms.map(
    (eventForm): MessageTag => ({
      title: eventForm.name,
      description: t("formItemDesc", {
        name: eventForm.name,
      }),
      value: `/form_${eventForm.uuid}`,
      color: "green",
      category: categories.form,
    }),
  );
}
