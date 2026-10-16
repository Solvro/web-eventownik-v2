import { format } from "date-fns";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";
import sanitizeHtml from "sanitize-html";

import { getPublicEvent } from "@/app/[eventSlug]/data-access";
import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { Button } from "@/components/ui/button";
import { photoUrl } from "@/lib/api";
import { isFormOpen } from "@/lib/event-form-utils";

import { EventNotFound } from "./event-not-found";

interface EventPageProps {
  params: Promise<{ eventSlug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
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

export default async function EventPage({ params }: EventPageProps) {
  const { eventSlug, locale } = await params;

  const response = await getPublicEvent(eventSlug);
  if (response.data === undefined) {
    return <EventNotFound whatNotFound="event" status={response.status} />;
  }
  const event = response.data;
  const t = await getTranslations({ locale, namespace: "Event" });

  return (
    <EventPageLayout event={event} description={event.description ?? ""}>
      {event.registerForm === null ||
      (event.registerForm.openCondition === "MANUAL" &&
        !event.registerForm.isOpen) ? (
        <div className="flex w-full justify-center pt-4">
          <p className="bg-background/24 rounded-lg px-4 py-2 text-center backdrop-blur-sm sm:text-2xl sm:font-semibold">
            {t("registrationDisabled")}
          </p>
        </div>
      ) : (
        <div className="flex w-full justify-center pt-4">
          <Link href={`/${event.slug}/register#form`}>
            <Button
              variant="eventDefault"
              className="text-xl tracking-tight backdrop-blur-sm md:p-6 md:text-2xl pointer-fine:bg-(--event-primary-color)/70"
              style={{
                viewTransitionName: isFormOpen(event.registerForm)
                  ? "register-button"
                  : "form-close-info",
              }}
            >
              {t("registerForThisEvent")}
            </Button>
          </Link>
        </div>
      )}
    </EventPageLayout>
  );
}
