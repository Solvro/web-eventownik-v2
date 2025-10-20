import { format } from "date-fns";
import { Info } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";
import sanitizeHtml from "sanitize-html";

import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { API_URL, PHOTO_URL } from "@/lib/api";
import type { Event } from "@/types/event";

import { EventNotFound } from "./event-not-found";
import { RegisterParticipantForm } from "./register-participant-form";

interface EventPageProps {
  params: Promise<{ eventSlug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
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

export default async function EventPage({ params }: EventPageProps) {
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

  return (
    <EventPageLayout event={event} description={event.description ?? ""}>
      <h2 className="text-center text-3xl font-bold md:text-4xl">
        {t("registration")}
      </h2>
      <p className="mb-8">{t("fillForm")}</p>
      <RegisterParticipantForm event={event} />
      <p className="text-muted-foreground my-4 text-center text-sm">
        <Info className="inline-block size-4 align-[-0.195em]" /> Kontynuując
        zgadzasz się na warunki zawarte w<br />
        <Link
          href={`/${event.slug}/privacy`}
          className="text-[var(--event-primary-color)]/90"
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
              className="text-[var(--event-primary-color)]/90"
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
