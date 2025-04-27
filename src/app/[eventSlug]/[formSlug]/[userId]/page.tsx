import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { Event } from "@/types/event";
import type { Form } from "@/types/form";
import type { PublicParticipant } from "@/types/participant";

import { FormGenerator } from "./form-generator";

interface FormPageProps {
  params: Promise<{ eventSlug: string; formSlug: string; userId: string }>;
}

async function getEvent(eventSlug: string) {
  const eventResponse = await fetch(`${API_URL}/events/${eventSlug}`, {
    method: "GET",
  });
  if (!eventResponse.ok) {
    const error = (await eventResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  const event = (await eventResponse.json()) as Event;
  return event;
}

async function getForm(eventSlug: string, formSlug: string) {
  const formResponse = await fetch(
    `${API_URL}/events/${eventSlug}/forms/${formSlug}`,
    {
      method: "GET",
    },
  );
  if (!formResponse.ok) {
    const error = (await formResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  const form = (await formResponse.json()) as Form;
  return form;
}

async function getUserData(
  formAttributes: FormAttribute[],
  eventSlug: string,
  userId: string,
) {
  const attributesUrl = new URL(
    `${API_URL}/events/${eventSlug}/participants/${userId}`,
  );

  for (const attribute of formAttributes) {
    attributesUrl.searchParams.append("attributes[]", attribute.id.toString());
  }

  const userDataResponse = await fetch(attributesUrl, {
    method: "GET",
  });

  if (!userDataResponse.ok) {
    const error = (await userDataResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  return (await userDataResponse.json()) as PublicParticipant;
}

async function getEventBlockAttributeBlocks(
  eventSlug: string,
  attributeId: string,
) {
  const blocksResponse = await fetch(
    `${API_URL}/events/${eventSlug}/attributes/${attributeId}/blocks`,
    {
      method: "GET",
    },
  );
  if (!blocksResponse.ok) {
    const error = (await blocksResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  return (await blocksResponse.json()) as PublicBlock[];
}

export default async function FormPage({ params }: FormPageProps) {
  const { eventSlug, formSlug, userId } = await params;

  const event = await getEvent(eventSlug);
  if (event === null) {
    return <div>Nie znaleziono wydarzenia 😪</div>;
  }

  const form = await getForm(eventSlug, formSlug);
  if (form === null) {
    return <div>Nie znaleziono formularza 😪</div>;
  }

  const userData = await getUserData(form.attributes, event.slug, userId);
  if (userData === null) {
    return <div>Nie udało się pobrać twoich danych 😪</div>;
  }

  const blockAttributesInForm = form.attributes.filter(
    (attribute) => attribute.type === "block",
  );

  const eventBlocks = await Promise.all(
    blockAttributesInForm.map(async (attribute) =>
      getEventBlockAttributeBlocks(event.slug, attribute.id.toString()),
    ),
  );

  if (eventBlocks.includes(null)) {
    return (
      <div>
        Nie udało się pobrać informacji dla przynajmniej jednego z bloków w tym
        formularzu 😪
      </div>
    );
  }

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
              <div className="flex flex-wrap gap-2">
                {event.socialMediaLinks != null &&
                event.socialMediaLinks.length > 0
                  ? event.socialMediaLinks.map((link) => (
                      <Tooltip key={link} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link href={link} target="_blank">
                            <EventInfoDiv className="px-1">
                              {link.includes("facebook.com") ? (
                                <FaFacebookF className="size-6" />
                              ) : link.includes("instagram.com") ? (
                                <FaInstagram className="size-6" />
                              ) : link.includes("tiktok.com") ? (
                                <FaTiktok className="size-6" />
                              ) : link.includes("discord.com") ? (
                                <FaDiscord className="size-6" />
                              ) : link.includes("youtube.com") ? (
                                <FaYoutube className="size-6" />
                              ) : link.includes("google.com/maps") ? (
                                <FaLocationDot className="size-6" />
                              ) : (
                                <FaGlobe className="size-6" />
                              )}
                            </EventInfoDiv>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>{link}</TooltipContent>
                      </Tooltip>
                    ))
                  : null}
              </div>
            </div>
            <p className="max-h-72 overflow-y-auto leading-relaxed whitespace-pre-line">
              {form.description}
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col items-center gap-y-2 p-4 md:overflow-y-auto">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {form.name}
        </h2>
        <FormGenerator
          attributes={form.attributes}
          userData={userData}
          originalEventBlocks={eventBlocks as unknown as PublicBlock[]}
          formId={form.id.toString()}
          eventSlug={eventSlug}
          userId={userId}
        />
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
        "bg-accent/10 flex w-fit items-center gap-x-2 rounded-lg px-2 py-1 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
