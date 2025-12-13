import { format } from "date-fns";
import {
  Calendar1,
  CalendarX,
  MapPin,
  SquarePenIcon,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { SanitizedContent } from "@/components/sanitized-content";
import { ShareButton } from "@/components/share-button";
import { SocialMediaLink } from "@/components/social-media-link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

export default async function DashboardEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { id } = await params;

  const response = await fetch(`${API_URL}/events/${id}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const event = (await response.json()) as Event;
  return (
    <div className="flex h-full flex-col-reverse gap-4 xl:flex-row xl:justify-between">
      <div className="flex flex-1 flex-col space-y-6 align-top">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{event.name}</h1>
          {event.organizer != null && event.organizer.trim() !== "" ? (
            <div className="flex flex-row items-center gap-2">
              <User size={24} />
              <p>{event.organizer}</p>
            </div>
          ) : null}
          <div className="flex flex-row items-center gap-2">
            <Calendar1 size={24} />
            <p>{format(event.startDate, "dd.MM.yyyy HH:mm")}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <CalendarX size={24} />
            <p>{format(event.endDate, "dd.MM.yyyy HH:mm")}</p>
          </div>
          {event.participantsCount != null && (
            <div className="flex flex-row items-center gap-2">
              <Users size={24} />
              <p>{event.participantsCount}</p>
            </div>
          )}
          {event.location != null && event.location.trim() !== "" ? (
            <div className="flex flex-row items-center gap-2">
              <MapPin size={24} />
              <p>{event.location}</p>
            </div>
          ) : null}
        </div>
        {event.description != null && event.description.trim() !== "" ? (
          <ScrollArea className="flex-1 pr-3 text-justify">
            <div className="max-h-[25vh] min-h-44">
              <SanitizedContent contentToSanitize={event.description} />
            </div>
          </ScrollArea>
        ) : null}
        <div className="flex gap-1">
          {event.socialMediaLinks != null && event.socialMediaLinks.length > 0
            ? event.socialMediaLinks.map((link) => (
                <SocialMediaLink
                  link={link}
                  key={link}
                  className="bg-accent-foreground/60 text-background"
                />
              ))
            : null}
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Button variant="eventDefault" asChild>
            <Link href={`/dashboard/events/${id}/settings`}>
              <SquarePenIcon /> Edytuj wydarzenie
            </Link>
          </Button>
          <ShareButton path={event.slug} />
        </div>
      </div>
      <Image
        src={
          event.photoUrl == null
            ? EventPhotoPlaceholder
            : `${PHOTO_URL}/${event.photoUrl}`
        }
        width={400}
        height={400}
        className="aspect-square max-h-96 rounded-xl object-cover"
        alt={`Zdjęcie wydarzenia ${event.name}`}
      />
    </div>
  );
}
