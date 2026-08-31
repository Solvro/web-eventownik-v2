/* eslint-disable unicorn/prevent-abbreviations */
import { format } from "date-fns";
import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { parseLinks } from "@/lib/links";
import type { PublicBlock } from "@/types/blocks";
import type { Event } from "@/types/event";
import type { GetPublicFormResponse } from "@/types/forms";

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

  const eventRes = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}`,
    {
      method: "GET",
    },
  );

  if (!eventRes.ok) {
    const error = (await eventRes.json()) as unknown;
    console.error(error);
    return <EventNotFound whatNotFound="event" />;
  }

  const event = (await response.json()) as Event;
  const { policyLink } = parseLinks(event.links);

  const formRes = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/forms/${encodeURIComponent(event.registerFormUuid)}`,
    { method: "GET" },
  );

  if (!formRes.ok) {
    const error = (await formRes.json()) as unknown;
    console.error(error);
    return <EventNotFound whatNotFound="form" />;
  }

  const form = (await formRes.json()) as GetPublicFormResponse;

  const attributes = form.formDefinitions.map((def) => ({
    ...def.attribute,
    config: {
      ...def.attribute.config,
      isRequired: def.isRequired,
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

  if (!form.isOpen) {
    return (
      <EventPageLayout
        event={event}
        description={event.description ?? ""}
        variant="form"
      >
        <div className="border-border bg-card flex flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center">
          <Info className="text-muted-foreground size-10" aria-hidden="true" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">
              {t("registrationDisabled")}
            </h1>
          </div>
          <Link
            href={`/${event.slug}`}
            className="text-primary text-sm font-medium underline underline-offset-4"
          >
            {t("backToEventPage")}
          </Link>
        </div>
      </EventPageLayout>
    );
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
        formDefinitions={form.formDefinitions}
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
