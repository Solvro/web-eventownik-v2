import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import Link from "next/link";
import React, { ViewTransition } from "react";

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
  children?: React.ReactNode;
  variant?: "landing" | "form";
}

export function EventPageLayout({
  event,
  description,
  children,
  variant = "landing",
}: EventPageLayoutProps) {
  const showForm = variant === "form";

  return (
    <ViewTransition>
      <div className="flex min-h-dvh flex-col md:max-h-dvh md:flex-row">
        <EventPrimaryColorSetter
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing,@typescript-eslint/strict-boolean-expressions
          primaryColor={event.primaryColor || "#3672fd"}
        />
        <div
          className="flex flex-1 text-[#f0f0ff]"
          style={{
            backgroundImage: `${showForm ? "linear-gradient(to bottom, #1F1F1F40, #000000)" : "linear-gradient(to bottom, #1F1F1F40, #00000096, #000000b5)"}, url(${
              event.photoUrl == null
                ? EventPhotoPlaceholder.src
                : `${PHOTO_URL}/${event.photoUrl}`
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            viewTransitionName: "event-background",
          }}
        >
          <div className="container mx-auto flex flex-1 flex-col justify-between overflow-hidden p-4 sm:h-dvh">
            <nav className="flex w-full flex-wrap items-center justify-between max-sm:gap-3 sm:pl-8">
              <div style={{ viewTransitionName: "app-logo" }}>
                <AppLogo forceTheme="dark" />
              </div>
              <div
                className="flex items-center gap-2"
                style={{ viewTransitionName: "event-nav-controls" }}
              >
                <LanguageSwitch
                  variant="ghost"
                  className="hover:bg-background/30 bg-background/20 backdrop-blur-xs hover:text-[#f0f0ff] hover:backdrop-blur-sm"
                />
                <ThemeSwitch
                  variant="ghost"
                  className="hover:bg-background/30 bg-background/20 backdrop-blur-xs hover:text-[#f0f0ff] hover:backdrop-blur-sm"
                />
              </div>
            </nav>
            <div className="flex min-h-0 flex-col gap-2">
              <div className="flex min-h-0 flex-col pt-8 sm:px-8">
                <h1
                  className="mb-4 text-4xl font-bold md:text-5xl"
                  style={{ viewTransitionName: "event-title" }}
                >
                  {event.name}
                </h1>
                <div
                  className="mb-2 flex flex-col gap-y-2 sm:mb-8"
                  style={{ viewTransitionName: "event-info" }}
                >
                  <div className="flex gap-x-2">
                    <EventInfoDiv>
                      <Calendar1 size={20} />{" "}
                      {format(event.startDate, "dd.MM.yyyy")}
                    </EventInfoDiv>
                    <EventInfoDiv>
                      {format(event.startDate, "HH:mm")}
                    </EventInfoDiv>
                    <AddToCalendarButton event={event} />
                  </div>
                  <div className="flex gap-x-2">
                    <EventInfoDiv>
                      <CalendarX size={20} />{" "}
                      {format(event.endDate, "dd.MM.yyyy")}
                    </EventInfoDiv>
                    <EventInfoDiv>
                      {format(event.endDate, "HH:mm")}
                    </EventInfoDiv>
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
                    {event.organizer != null &&
                    event.organizer.trim() !== "" ? (
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
                <ScrollArea
                  className="min-h-0 pr-3 sm:text-justify"
                  style={{ viewTransitionName: "event-description" }}
                >
                  <div className="max-h-72 sm:h-auto">
                    <SanitizedContent
                      contentToSanitize={description}
                      className="event-description"
                    />
                  </div>
                </ScrollArea>
                {!showForm && children}
              </div>
            </div>
          </div>
        </div>
        {showForm ? (
          <div className="view-transition-form-content relative flex flex-1 flex-col items-center gap-y-2 p-4 md:overflow-y-auto">
            {children}
          </div>
        ) : null}
      </div>
    </ViewTransition>
  );
}
