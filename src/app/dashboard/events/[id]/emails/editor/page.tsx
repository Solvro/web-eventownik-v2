// import type { Metadata } from "next";
// import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/index";
import { ATTRIBUTE_CATEGORY, FORM_CATEGORY } from "@/lib/extensions/tags";
import type { MessageTag } from "@/lib/extensions/tags";
import { getAttributeLabel } from "@/lib/utils";

import {
  getEventAttributes,
  getEventForms,
  // getSingleEventEmail,
} from "../data-access";

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ id: string; emailId: string }>;
// }): Promise<Metadata> {
//   const { id, emailId } = await params;

//   const emailToEdit = await getSingleEventEmail(id, emailId);

//   return {
//     title: `Edytowanie ${emailToEdit?.name ?? "maila"}`,
//   };
// }

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}) {
  // const { id, emailId } = await params;
  const { id } = await params;

  // const emailToEdit = await getSingleEventEmail(id, emailId);
  const attributes = await getEventAttributes(id);
  const forms = await getEventForms(id);

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

  // if (emailToEdit == null) {
  //   notFound();
  // } else {
  //   return <Editor tags={[...attributeTags, ...formTags]} />;
  // }

  return <Editor tags={[...attributeTags, ...formTags]} forms={forms} />;
}
