import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { AppLogo } from "@/components/app-logo";
import { RegisterParitcipantForm } from "@/components/register-participant-form";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

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
    return <div>Nie znaleziono wydarzenia 😪</div>;
  }
  const event = (await response.json()) as Event;

  //TODO primaryColor set based on color from API
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-8">
        <AppLogo />
      </nav>
      <div className="m-4 flex flex-col gap-x-8 gap-y-8 md:flex-row">
        {/* //TODO image as a background */}
        <div className={cn("w-full md:w-1/2")}>
          <h2 className="text-3xl">{event.name}</h2>
          <div className="flex flex-col gap-y-2">
            <div className="flex gap-x-2">
              <EventInfoDiv>
                <Calendar1 size={20} /> {format(event.startDate, "dd.MM.yyyy")}
              </EventInfoDiv>
              <EventInfoDiv>{format(event.startDate, "HH:mm")}</EventInfoDiv>
            </div>
            <div className="flex gap-x-2">
              <EventInfoDiv>
                <CalendarX size={20} /> {format(event.endDate, "dd.MM.yyyy")}
              </EventInfoDiv>
              <EventInfoDiv>{format(event.endDate, "HH:mm")}</EventInfoDiv>
            </div>
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
          </div>
          <p className="whitespace-pre-line">{event.description}</p>
          <span>PHOTO: {event.photoUrl}</span>
          {/* <Image
            src={`${API_URL}/${event.photoUrl}`}
            width={100}
            height={100}
            alt="Zdjęcie wydarzenia"
          ></Image> */}
        </div>
        <div className="flex flex-col items-center gap-y-2">
          <h2 className="text-2xl md:text-3xl">Rejestracja na wydarzenie</h2>
          <span>Wypełnij formularz, aby się zarejestrować</span>
          <RegisterParitcipantForm eventId={event.id.toString()} />
        </div>
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
        "flex w-fit gap-x-2 rounded-lg bg-slate-400/40 px-2 py-1 text-white",
      )}
    >
      {children}
    </div>
  );
}
