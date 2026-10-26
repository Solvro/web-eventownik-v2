import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { Editor } from "@/components/editor/index";
import { rootDefaults } from "@/lib/editor";
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
  params: Promise<{ uuid: string; emailId: string }>;
}): Promise<Metadata> {
  const t = await getTranslations("Dashboard");

  const { uuid, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(uuid, emailId);

  return {
    title: t("editing", { name: emailToEdit?.name ?? t("unnamedEmail") }),
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ uuid: string; emailId: string }>;
}) {
  const t = await getTranslations("Editor");
  const tMessageTags = await getTranslations("MessageTags");

  const { uuid, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(uuid, emailId);

  if (emailToEdit == null) {
    notFound();
  }

  if (emailToEdit.schema == null) {
    redirect(`/dashboard/events/${uuid}/emails/${emailId}`);
  }

  const attributes = await getEventAttributes(uuid);
  const forms = await getEventForms(uuid);
  const event = await getEmailEventInfo(uuid);

  const { schema } = emailToEdit;
  const initialData: PuckData = {
    ...schema,
    root: {
      ...schema.root,
      props: {
        ...rootDefaults,
        ...schema.root.props,
        // Templates migrated from v2 may still have lowercase triggers
        trigger: emailToEdit.trigger,
        triggerValue: emailToEdit.triggerConfig?.formUuid ?? null,
      },
    },
  };

  return (
    <Editor
      tags={[
        ...getAttributeTags(attributes, tMessageTags),
        ...getFormTags(forms, tMessageTags),
      ]}
      forms={forms}
      attributes={attributes}
      initialData={initialData}
      mutationData={{
        emailUuid: emailToEdit.id,
        eventUuid: uuid,
        mode: "update",
      }}
      eventData={{
        name: event?.name ?? t("event"),
        photoUrl: event?.photoUrl ?? "",
      }}
    />
  );
}
