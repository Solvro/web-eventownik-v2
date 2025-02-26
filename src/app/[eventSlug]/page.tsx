import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";

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
  const response = await fetch(`${API_URL}/events/${eventSlug}`);
  if (!response.ok) {
    return <div>Nie znaleziono wydarzenia 😪</div>;
  }
  const event = (await response.json()) as Event;
  return (
    <div className="flex flex-col md:flex-row">
      <div className={`w-full md:w-1/2 bg-[${event.primaryColor}]`}>
        <h2>Strona wydarzenia: {event.name}</h2>
        {/* <p>{JSON.stringify(event)}</p> */}
        <div className="flex gap-x-2">
          <EventInfoDiv>
            <Calendar1 /> {format(event.startDate, "dd.MM.yyyy")}
          </EventInfoDiv>
          <EventInfoDiv>{format(event.startDate, "HH:mm")}</EventInfoDiv>
        </div>
        <div className="flex gap-x-2">
          <EventInfoDiv>
            <CalendarX /> {format(event.endDate, "dd.MM.yyyy")}
          </EventInfoDiv>
          <EventInfoDiv>{format(event.endDate, "HH:mm")}</EventInfoDiv>
        </div>
        <div className="flex gap-x-2">
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${event.lat.toString()}%2C${event.long.toString()}`}
            target="_blank"
          >
            <EventInfoDiv>
              <MapPin />
              {event.lat} {event.long}
            </EventInfoDiv>
          </Link>
          <EventInfoDiv>
            <Building2 /> {event.organizer}
          </EventInfoDiv>
        </div>
        <p>{event.description}</p>
      </div>
      <div>
        <h2>Rejestracja na wydarzenie</h2>
        <span>Wypełnij formularz, aby się zarejestrować</span>
        <RegisterParitcipantForm />
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
        "flex w-fit rounded-md bg-slate-400/40 px-2 text-white",
      )}
    >
      {children}
    </div>
  );
}
