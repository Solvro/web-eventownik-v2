import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getEventAttributes,
  getEventForms,
  getSingleEventEmail,
} from "../data-access";
import { EventEmailEditForm } from "./edit-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string; emailUuid: string }>;
}): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  const { uuid, emailUuid } = await params;
  const emailToEdit = await getSingleEventEmail(uuid, emailUuid);

  return {
    title: t("editing", { name: emailToEdit?.name ?? t("unnamedEmail") }),
  };
}

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ uuid: string; emailUuid: string }>;
}) {
  const { uuid, emailUuid } = await params;

  const emailToEdit = await getSingleEventEmail(uuid, emailUuid);
  const attributes = await getEventAttributes(uuid);
  const forms = await getEventForms(uuid);

  if (fetchedEmail == null) {
    notFound();
  } else {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href={`/dashboard/events/${uuid}/emails`}
          className="flex items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> Wróć do szablonów
        </Link>
        <h1 className="text-2xl font-bold">Edytuj szablon maila</h1>
        <EventEmailEditForm
          eventId={uuid}
          emailToEdit={emailToEdit}
          eventAttributes={attributes}
          eventForms={forms}
        />
      </div>
    );
  }
}
