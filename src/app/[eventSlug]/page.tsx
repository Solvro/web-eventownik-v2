import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";

import { AppLogo } from "@/components/app-logo";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

import { RegisterParitcipantForm } from "./register-participant-form";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
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

  //TODO primaryColor set based on color from API
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div
        id="leftColumn"
        className="flex flex-1 flex-col justify-between py-4 text-[#f0f0ff]"
        style={{
          backgroundImage: `linear-gradient(to bottom, #1F1F1F40, #000000), url(${PHOTO_URL}/${event.photoUrl})`,
        }}
      >
        <nav className="flex items-center px-8">
          <AppLogo forceTheme="dark" />
        </nav>
        <div className="flex flex-col gap-2">
          <div className="relative p-8">
            <h1 className="mb-4 text-3xl font-bold md:text-5xl">
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
              {event.lat && event.long ? (
                <div className="flex gap-x-2">
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${event.lat.toString()}%2C${event.long.toString()}`}
                    target="_blank"
                  >
                    <EventInfoDiv>
                      <MapPin size={20} />
                      Sprawdź lokalizację
                    </EventInfoDiv>
                  </Link>
                  <EventInfoDiv>
                    <Building2 size={20} /> {event.organizer}
                  </EventInfoDiv>
                </div>
              ) : null}
            </div>
            <p className="max-h-48 overflow-y-auto whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>
      </div>
      <div
        id="rightColumn"
        className="flex flex-1 flex-col items-center gap-y-2 py-8"
      >
        <h2 className="text-3xl font-bold md:text-4xl">
          Rejestracja na wydarzenie
        </h2>
        <span>Wypełnij formularz, aby się zarejestrować</span>
        <RegisterParitcipantForm eventId={event.id.toString()} />
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
        "flex w-fit gap-x-2 rounded-lg bg-accent/10 px-2 py-1 backdrop-blur-sm",
      )}
    >
      {children}
    </div>
  );
}
