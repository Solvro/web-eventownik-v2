import { format } from "date-fns";
import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { FormClosedView } from "@/components/form-closed-view";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { isFormOpen } from "@/lib/event-form-utils";
import { parseLinks } from "@/lib/links";
import type { Event } from "@/types/event";
import type { EventForm, FormDefinition, PublicEventForm } from "@/types/forms";

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

  const response = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}`,
    {
      method: "GET",
    },
  );
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    return {
      title: "Eventownik",
      description: t("notFound"),
    };
  }
  const event = (await response.json()) as Event;

  return {
    title: event.name,
    description: `${event.description == null ? event.name : sanitizeHtml(event.description, { allowedTags: [], allowedAttributes: {} })} | ${format(event.startDate, "dd.MM.yyyy HH:mm")} - ${format(event.endDate, "dd.MM.yyyy HH:mm")}`,
    openGraph: {
      images: [`${PHOTO_URL}/${event.photoUrl ?? ""}`],
    },
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { eventSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Event" });

  const eventResponse = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}`,
    {
      method: "GET",
    },
  );

  if (!eventResponse.ok) {
    const error = (await eventResponse.json()) as unknown;
    console.error(error);
    return <EventNotFound whatNotFound="event" />;
  }

  const event = (await eventResponse.json()) as Event;
  const { policyLink } = parseLinks(event.links);

  const formResponse = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/forms/${encodeURIComponent(event.registerFormUuid)}`,
    {
      method: "GET",
    },
  );

  if (!formResponse.ok) {
    const error = (await formResponse.json()) as unknown;
    console.error(error);
    return <EventNotFound whatNotFound="form" />;
  }

  const publicForm = (await formResponse.json()) as PublicEventForm;

  const formDefinitions = publicForm.formDefinitions.filter(
    (definition): definition is FormDefinition => definition.attribute !== null,
  );
  const form: EventForm = { ...publicForm, formDefinitions };
  if (!isFormOpen(form)) {
    return <FormClosedView event={event} form={form} />;
  }

  const attributes = formDefinitions.map((definition) => ({
    ...definition.attribute,
    config: {
      ...definition.attribute.config,
      isRequired: definition.isRequired,
    },
  }));

  const blockAttributesInForm = attributes.filter(
    (attribute) => attribute.type === "block",
  );

  const eventBlocksResponse = await Promise.all(
    blockAttributesInForm.map(async (attribute) =>
      getEventBlockAttributeBlocks(event.slug, attribute.uuid),
    ),
  );

  if (eventBlocksResponse.includes(null)) {
    return <EventNotFound whatNotFound="blocks" />;
  }

  const eventBlocks = eventBlocksResponse.filter((block) => block !== null);

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
        formDefinitions={formDefinitions}
        originalEventBlocks={eventBlocks}
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
