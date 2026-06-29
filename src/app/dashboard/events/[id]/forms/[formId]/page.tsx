import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEventAttributes, getSingleEventForm } from "../data-access";
import { EventFormEditForm } from "./edit-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}): Promise<Metadata> {
  const { id, formId } = await params;
  const t = await getTranslations("Dashboard");

  const formToEdit = await getSingleEventForm(id, formId);

  return {
    title: t("editing", { name: formToEdit?.name ?? t("unnamedForm") }),
  };
}

export default async function EventFormEditPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}) {
  const t = await getTranslations("Dashboard");
  const { id, formId } = await params;

  const formToEdit = await getSingleEventForm(id, formId);
  const eventAttributes = await getEventAttributes(id);

  if (formToEdit == null) {
    notFound();
  } else {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href={`/dashboard/events/${id}/forms`}
          className="flex items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("backToForms")}
        </Link>
        <h1 className="text-2xl font-bold">{t("editForm")}</h1>
        <EventFormEditForm
          eventId={id}
          formToEdit={formToEdit}
          eventAttributes={eventAttributes}
        />
      </div>
    );
  }
}
