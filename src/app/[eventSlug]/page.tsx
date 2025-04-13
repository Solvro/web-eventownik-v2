import * as Tooltip from "@radix-ui/react-tooltip";
import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import {
  FaDiscord,
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
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
    description: `${event.description ?? event.name} | ${format(event.startDate, "dd.MM.yyyy HH:mm")} - ${format(event.endDate, "dd.MM.yyyy HH:mm")}`,
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
            </div>
            <p className="max-h-72 overflow-y-auto leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
            <div className="mt-7 flex gap-1">
              {event.socialMediaLinks != null &&
              event.socialMediaLinks.length > 0
                ? event.socialMediaLinks.map((link) => (
                    <Tooltip.Provider key={link} delayDuration={0}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <Button
                            asChild
                            variant={"ghost"}
                            className="size-10 !text-white"
                          >
                            <Link href={link} target="_blank">
                              {link.includes("facebook.com") ? (
                                <FaFacebookF className="!size-6" />
                              ) : link.includes("instagram.com") ? (
                                <FaInstagram className="!size-6" />
                              ) : link.includes("tiktok.com") ? (
                                <FaTiktok className="!size-6" />
                              ) : link.includes("discord.com") ? (
                                <FaDiscord className="!size-6" />
                              ) : link.includes("youtube.com") ? (
                                <FaYoutube className="!size-6" />
                              ) : link.includes("google.com/maps") ? (
                                <FaLocationDot className="!size-6" />
                              ) : (
                                <FaGlobe className="!size-6" />
                              )}
                            </Link>
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content
                          className="rounded bg-gray-900 px-2 py-1 text-sm text-white"
                          sideOffset={5}
                        >
                          {link}
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  ))
                : null}
            </div>
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
        "bg-accent/10 flex w-fit items-center gap-x-2 rounded-lg px-2 py-1 backdrop-blur-xs",
      )}
    >
      {children}
    </div>
  );
}
