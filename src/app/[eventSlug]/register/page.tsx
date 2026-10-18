import { format } from "date-fns";
import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

import { getPublicEvent, getPublicForm } from "@/app/[eventSlug]/data-access";
import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { FormClosedView } from "@/components/form-closed-view";
import { photoUrl } from "@/lib/api";
import { isFormOpen } from "@/lib/event-form-utils";
import { formControls } from "@/lib/form-controls";
import { parseLinks } from "@/lib/links";

import { FormGenerator } from "../form-generator";
import { getEventBlockAttributeBlocks } from "../utils";

interface RegisterPageProps {
  params: Promise<{ eventSlug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: RegisterPageProps): Promise<Metadata> {
  const { eventSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Event" });

  const response = await getPublicEvent(eventSlug);
  if (response.data === undefined) {
    return {
      title: "Eventownik",
      description: t(
        response.status >= 500 ? "serviceUnavailable" : "notFound",
      ),
    };
  }
  const event = response.data;

  return {
    title: event.name,
    description: `${event.description == null ? event.name : sanitizeHtml(event.description, { allowedTags: [], allowedAttributes: {} })} | ${format(event.startDate, "dd.MM.yyyy HH:mm")} - ${format(event.endDate, "dd.MM.yyyy HH:mm")}`,
    openGraph: {
      images: [photoUrl(event.photoUrl ?? "")],
    },
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { eventSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Event" });

  const response = await getPublicEvent(eventSlug);

  if (response.data === undefined) {
    return <EventNotFound whatNotFound="event" status={response.status} />;
  }

  const event = response.data;
  const { policyLink } = parseLinks(event.links);

  const summary = event.registerForm;

  if (summary === null) {
    return <EventNotFound whatNotFound="form" />;
  }

  const formResponse = await getPublicForm(eventSlug, summary.uuid);
  if (formResponse.data === undefined) {
    return <EventNotFound whatNotFound="form" status={formResponse.status} />;
  }
  const form = formResponse.data;

  if (!isFormOpen(form)) {
    return <FormClosedView event={event} form={form} />;
  }

  const attributes = formControls(form);

  const blockAttributesInForm = attributes.filter(
    (attribute) => attribute.type === "block",
  );

  const eventBlocks = await Promise.all(
    blockAttributesInForm.map(async (attribute) =>
      getEventBlockAttributeBlocks(event.slug, attribute.uuid),
    ),
  );

  if (eventBlocks.includes(null)) {
    return <EventNotFound whatNotFound="blocks" />;
  }

  return (
    <EventPageLayout
      event={event}
      description={event.description ?? ""}
      variant="form"
    >
      <h2 className="text-center text-3xl font-bold md:text-4xl" id="form">
        {t("registration")}
      </h2>
      <p className="mb-8">{t("fillForm")}</p>

      <FormGenerator
        form={form}
        originalEventBlocks={eventBlocks.filter((block) => block !== null)}
        formUuid={form.uuid}
        eventSlug={eventSlug}
        editMode={false}
      />

      <p className="text-foreground/50 my-4 text-center text-sm">
        <Info className="inline-block size-4 align-[-0.195em]" />{" "}
        {t("consentIntro")}
        <br />
        <Link
          href={`/${event.slug}/privacy`}
          className="text-(--event-primary-color)/90"
          target="_blank"
        >
          {t("privacyPolicy")}
        </Link>
        {policyLink == null ? (
          <span> {t("ofEvent")}</span>
        ) : (
          <>
            {" "}
            {t("and")}{" "}
            <Link
              href={policyLink.url}
              className="text-(--event-primary-color)/90"
              target="_blank"
            >
              {t("terms")}
            </Link>{" "}
            {t("ofEvent")}
          </>
        )}
      </p>
    </EventPageLayout>
  );
}
