import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";

import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { AppLogo } from "@/components/app-logo";
import { EventInfoDiv } from "@/components/event-info-div";
import { EventPrimaryColorSetter } from "@/components/event-primary-color";
import { LanguageSwitch } from "@/components/language-switch";
import { SanitizedContent } from "@/components/sanitized-content";
import { SocialMediaLink } from "@/components/social-media-link";
import { ThemeSwitch } from "@/components/theme-switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PHOTO_URL } from "@/lib/api";
import type { Event } from "@/types/event";

import EventPhotoPlaceholder from "../../../public/event-photo-placeholder.png";

interface EventPageLayoutProps {
  event: Event;
  description: string;
  children: React.ReactNode;
}

export function EventPageLayout({
  event,
  description,
  children,
}: EventPageLayoutProps) {
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
        <nav className="flex w-full flex-wrap items-center justify-between sm:pl-8">
          <AppLogo forceTheme="dark" />
          <div className="flex items-center gap-2">
            <LanguageSwitch
              variant="ghost"
              className="hover:bg-background/10 bg-background/5 backdrop-blur-xs hover:text-[#f0f0ff] hover:backdrop-blur-sm"
            />
            <ThemeSwitch
              variant="ghost"
              className="hover:bg-background/10 bg-background/5 backdrop-blur-xs hover:text-[#f0f0ff] hover:backdrop-blur-sm"
            />
          </div>
        </nav>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-8 sm:px-8">
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
              <SanitizedContent contentToSanitize={description} />
            </ScrollArea>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col items-center gap-y-2 p-4 md:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
