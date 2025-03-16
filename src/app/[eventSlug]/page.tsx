import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { AppLogo } from "@/components/app-logo";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

import { RegisterParticipantForm } from "./register-participant-form";

interface EventPageProps {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  const response = await fetch(`${API_URL}/events/${eventSlug}`, {
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
    description: `${event.description} | ${format(event.startDate, "dd.MM.yyyy HH:mm")} - ${format(event.endDate, "dd.MM.yyyy HH:mm")}`,
    openGraph: {
      images: [`${PHOTO_URL}/${event.photoUrl ?? ""}`],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventSlug } = await params;
  const response = await fetch(`${API_URL}/events/${eventSlug}`, {
    method: "GET",
  });
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    return <div>Nie znaleziono wydarzenia 😪</div>;
  }
  const event = (await response.json()) as Event;

  // TODO: primaryColor set based on color from API
  return (
    <div className="flex min-h-screen flex-col md:max-h-screen md:flex-row">
      <div
        className="flex flex-1 flex-col justify-between p-4 text-[#f0f0ff]"
        style={{
          backgroundImage: `linear-gradient(to bottom, #1F1F1F40, #000000), url(${PHOTO_URL}/${event.photoUrl ?? ""})`,
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
              </div>
              <div className="flex gap-x-2">
                <EventInfoDiv>
                  <CalendarX size={20} /> {format(event.endDate, "dd.MM.yyyy")}
                </EventInfoDiv>
                <EventInfoDiv>{format(event.endDate, "HH:mm")}</EventInfoDiv>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.location ? (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                  >
                    <EventInfoDiv>
                      <MapPin size={20} /> {event.location}
                    </EventInfoDiv>
                  </Link>
                ) : null}
                {event.organizer ? (
                  <EventInfoDiv>
                    <Building2 size={20} /> {event.organizer}
                  </EventInfoDiv>
                ) : null}
              </div>
            </div>
            <p className="max-h-72 overflow-y-auto whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col items-center gap-y-2 p-4 md:overflow-y-auto">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Rejestracja na wydarzenie
        </h2>
        <p className="mb-8">Wypełnij formularz, aby się zarejestrować</p>
        <RegisterParticipantForm event={event} />
      </div>
    </div>
  );
}

function EventInfoDiv({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "flex w-fit items-center gap-x-2 rounded-lg bg-accent/10 px-2 py-1 backdrop-blur-sm",
      )}
    >
      {children}
    </div>
  );
}
