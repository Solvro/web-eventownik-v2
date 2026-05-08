import { format } from "date-fns";
import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { API_URL, PHOTO_URL } from "@/lib/api";
import type { PublicBlock } from "@/types/blocks";
import type { Event } from "@/types/event";

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

  const response = await fetch(`${API_URL}/events/${eventSlug}/public`, {
    method: "GET",
  });
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

  const response = await fetch(`${API_URL}/events/${eventSlug}/public`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    return <EventNotFound whatNotFound="event" />;
  }

  const event = (await response.json()) as Event;

  const form = event.firstForm;

  if (form === null) {
    return <EventNotFound whatNotFound="form" />;
  }

  const blockAttributesInForm = form.attributes.filter(
    (attribute) => attribute.type === "block",
  );

  const eventBlocks = await Promise.all(
    blockAttributesInForm.map(async (attribute) =>
      getEventBlockAttributeBlocks(event.slug, attribute.id.toString()),
    ),
  );

  if (eventBlocks.includes(null)) {
    return <EventNotFound whatNotFound="blocks" />;
  }

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
        attributes={form.attributes}
        originalEventBlocks={eventBlocks as unknown as PublicBlock[]}
        formId={form.id.toString()}
        eventSlug={eventSlug}
        editMode={false}
      />

      <p className="text-foreground/50 my-4 text-center text-sm">
        <Info className="inline-block size-4 align-[-0.195em]" /> Kontynuując
        zgadzasz się na warunki zawarte w<br />
        <Link
          href={`/${event.slug}/privacy`}
          className="text-(--event-primary-color)/90"
          target="_blank"
        >
          polityce prywatności
        </Link>
        {event.termsLink === null ? (
          <span> wydarzenia</span>
        ) : (
          <>
            {" "}
            oraz{" "}
            <Link
              href={event.termsLink}
              className="text-(--event-primary-color)/90"
              target="_blank"
            >
              regulaminie
            </Link>{" "}
            wydarzenia
          </>
        )}
      </p>
    </EventPageLayout>
  );
}
