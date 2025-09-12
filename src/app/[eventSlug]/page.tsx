import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, Info, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { AppLogo } from "@/components/app-logo";
import { EventInfoDiv } from "@/components/event-info-div";
import { EventPrimaryColorSetter } from "@/components/event-primary-color";
import { SanitizedContent } from "@/components/sanitized-content";
import { SocialMediaLink } from "@/components/social-media-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL, PHOTO_URL } from "@/lib/api";
import type { Event } from "@/types/event";

import EventPhotoPlaceholder from "../../../public/event-photo-placeholder.png";
import { RegisterParticipantForm } from "./register-participant-form";

interface EventPageProps {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  const response = await fetch(`${API_URL}/events/${eventSlug}/public`, {
    method: "GET",
  });
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    return {
      title: "Eventownik",
      description: "Nie znaleziono wydarzenia 😪",
    };
  }
  const event = (await response.json()) as Event;

  return {
    title: event.name,
    description: `${event.description ?? event.name} | ${format(event.startDate, "dd.MM.yyyy HH:mm")} - ${format(event.endDate, "dd.MM.yyyy HH:mm")}`,
    openGraph: {
      images: [`${PHOTO_URL}/${event.photoUrl ?? ""}`],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventSlug } = await params;
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
    <div className="flex min-h-screen flex-col md:max-h-screen md:flex-row">
      <EventPrimaryColorSetter primaryColor={event.primaryColor || "#3672fd"} />
      <div
        className="flex flex-1 flex-col justify-between p-4 text-[#f0f0ff]"
        style={{
          backgroundImage: `linear-gradient(to bottom, #1F1F1F40, #000000), url(${
            event.photoUrl == null
              ? EventPhotoPlaceholder.src
              : `${PHOTO_URL}/${event.photoUrl}`
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <nav className="flex items-center px-8">
          <AppLogo forceTheme="dark" />
        </nav>
        <div className="flex flex-col gap-2">
          <div className="p-8">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {event.name}
            </h1>
            <div className="mb-8 flex flex-col gap-y-2">
              <div className="flex gap-x-2">
                <EventInfoDiv>
                  <Calendar1 size={20} />{" "}
                  {format(event.startDate, "dd.MM.yyyy")}
                </EventInfoDiv>
                <EventInfoDiv>{format(event.startDate, "HH:mm")}</EventInfoDiv>
                <AddToCalendarButton event={event} />
              </div>
              <div className="flex gap-x-2">
                <EventInfoDiv>
                  <CalendarX size={20} /> {format(event.endDate, "dd.MM.yyyy")}
                </EventInfoDiv>
                <EventInfoDiv>{format(event.endDate, "HH:mm")}</EventInfoDiv>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.location != null && event.location.trim() !== "" ? (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                  >
                    <EventInfoDiv>
                      <MapPin size={20} /> {event.location}
                    </EventInfoDiv>
                  </Link>
                ) : null}
                {event.organizer != null && event.organizer.trim() !== "" ? (
                  <EventInfoDiv>
                    <Building2 size={20} /> {event.organizer}
                  </EventInfoDiv>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {event.socialMediaLinks != null &&
                event.socialMediaLinks.length > 0
                  ? event.socialMediaLinks.map((link) => (
                      <SocialMediaLink link={link} key={link} />
                    ))
                  : null}
              </div>
            </div>
            <ScrollArea className="h-72">
              <SanitizedContent contentToSanitize={event.description ?? ""} />
            </ScrollArea>
          </div>
        </div>
      </div>
      {/* No need for ScrollArea (it's viewport's side scrollbar) */}
      <div className="relative flex flex-1 flex-col items-center gap-y-2 p-4 pb-24 md:overflow-y-auto">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Rejestracja na wydarzenie
        </h2>
        <p className="mb-8">Wypełnij formularz, aby się zarejestrować</p>
        <RegisterParticipantForm event={event} />
        <div className="text-muted-foreground my-4 flex flex-col items-center justify-center gap-2 text-center text-sm">
          <Info className="size-6" />
          <p>
            Kontynuując zgadzasz się na warunki zawarte w<br />
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
        </div>
      </div>
    </div>
  );
}
