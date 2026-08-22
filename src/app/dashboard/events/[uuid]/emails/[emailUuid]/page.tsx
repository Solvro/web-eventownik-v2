import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import sanitize from "sanitize-html";

import { EMAIL_ALLOWED_ATTRIBUTES, EMAIL_ALLOWED_TAGS } from "@/lib/editor";

import {
  getEventAttributes,
  getEventForms,
  getSingleEventEmail,
} from "../data-access";
import { EventEmailEditForm } from "./edit-form";

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
  params: Promise<{ uuid: string; emailUuid: string }>;
}) {
  const t = await getTranslations("Dashboard");
  const locale = await getLocale();

  const { uuid, emailUuid } = await params;

  const fetchedEmail = await getSingleEventEmail(uuid, emailUuid);

  if (fetchedEmail == null) {
    notFound();
  }

  if (fetchedEmail.schema !== null) {
    redirect(`/dashboard/events/${uuid}/emails/editor/${emailUuid}`);
  }

  const emailToEdit = {
    ...fetchedEmail,
    content: sanitize(fetchedEmail.content, {
      allowedTags: EMAIL_ALLOWED_TAGS,
      allowedAttributes: EMAIL_ALLOWED_ATTRIBUTES,
    }),
  };

  const [attributes, forms] = await Promise.all([
    getEventAttributes(uuid),
    getEventForms(uuid),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={`/dashboard/events/${uuid}/emails`}
        className="flex items-center gap-2 underline"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToTemplates")}
      </Link>
      <h1 className="text-2xl font-bold">{t("editEmailTemplate")}</h1>
      <EventEmailEditForm
        key={locale} // Re-render on locale change to refresh email tag suggestion menu translations
        eventUuid={uuid}
        emailToEdit={emailToEdit}
        eventAttributes={attributes}
        eventForms={forms}
      />
    </div>
  );
}
