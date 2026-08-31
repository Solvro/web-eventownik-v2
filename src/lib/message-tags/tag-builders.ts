import type { useTranslations } from "next-intl";

import { EventAttribute } from "@/types/attributes";
import { EventForm } from "@/types/forms";

import { MessageTag } from ".";
import { legacyTranslate } from "../utils";
import { getCategories } from "./categories";

export function getAttributeTags(
  eventAttributes: EventAttribute[],
  t: ReturnType<typeof useTranslations<"MessageTags">>,
): MessageTag[] {
  const categories = getCategories(t);

  return eventAttributes.map((attribute) => ({
    title: legacyTranslate(attribute.name, "pl"),
    description: t("attributeItemDesc", {
      name: legacyTranslate(attribute.name, "pl"),
    }),
    // NOTE: Why 'attribute.slug' can be null?
    value: `/participant_${attribute.slug ?? ""}`,
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
      value: `/form_${eventForm.slug}`,
      color: "green",
      category: categories.form,
    }),
  );
}
