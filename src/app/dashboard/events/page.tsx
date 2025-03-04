import { format } from "date-fns";
import { Calendar1, CircleHelpIcon, Share2Icon, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { unauthorized } from "next/navigation";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { CreateEventForm } from "@/app/dashboard/(create-event)/create-event-form";
import { EventInfoDiv } from "@/components/event-info-div";
import { Button } from "@/components/ui/button";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

export default async function EventListPage() {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    unauthorized();
  }
  const { bearerToken } = session;
  const data = await fetch(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  const events = (await data.json()) as Event[];
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Moje wydarzenia</h1>
            <h3 className="text-muted-foreground">{events.length} wydarzeń</h3>
          </div>
          <CreateEventForm />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {events.map((event) => (
            <div key={event.id}>
              <div className="relative">
                <Image
                  src={
                    event.photoUrl == null
                      ? EventPhotoPlaceholder
                      : `${PHOTO_URL}/${event.photoUrl}`
                  }
                  width="500"
                  height="500"
                  className="aspect-square w-full rounded-t-xl object-cover"
                  alt={event.name}
                />
                <div className="absolute inset-0 z-10 flex h-full flex-col justify-between p-4">
                  <div className="flex flex-row justify-between">
                    <EventInfoDiv className="bg-accent-foreground/60 text-background">
                      <Calendar1 size={16} />
                      <p className="text-sm">
                        {format(event.startDate, "dd.MM.yyyy")}
                      </p>
                    </EventInfoDiv>
                    <EventInfoDiv className="bg-accent-foreground/60 text-background">
                      <p className="text-sm">{event.participantsCount}</p>
                      <Users size={16} />
                    </EventInfoDiv>
                  </div>
                  {/* Mockup suggested that there also should be location,
                   * but for now the backend does not return it - mejsiejdev
                   */}
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-b-xl border-x border-b border-muted-foreground p-4">
                <p className="text-2xl font-bold">{event.name}</p>
                <p className="line-clamp-3 text-xs font-normal">
                  {event.description}
                </p>
                <div className="flex w-full justify-between">
                  <Button asChild variant="ghost">
                    <Link href={`/dashboard/events/${event.id.toString()}`}>
                      <CircleHelpIcon />
                      Wyświetl szczegóły
                    </Link>
                  </Button>
                  <Button variant="ghost">
                    <Share2Icon />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
