import { format, getHours, getMinutes } from "date-fns";
import {
  Calendar1,
  CalendarX,
  Share2Icon,
  SquarePenIcon,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, unauthorized } from "next/navigation";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { Button } from "@/components/ui/button";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

export default async function DashboardEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    unauthorized();
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
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:justify-between">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          {event.organizer ? (
            <div className="flex flex-row items-center space-x-2">
              <User size={24} />
              <p>{event.organizer}</p>
            </div>
          ) : null}
          <div className="flex flex-row items-center space-x-2">
            <Calendar1 size={24} />
            <p>{format(event.startDate, "dd.MM.yyyy HH:mm")}</p>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <CalendarX size={24} />
            <p>{format(event.endDate, "dd.MM.yyyy HH:mm")}</p>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <Users size={24} />
            <p>{event.participantsCount}</p>
          </div>
          {/* Mockup suggested that there also should be location,
           * but for now the backend does not return it - mejsiejdev
           */}
        </div>
        {event.description ? <p>{event.description}</p> : null}
        <div className="space-x-4">
          <Button asChild>
            <Link href={`/dashboard/events/${id}/settings`}>
              <SquarePenIcon /> Edytuj wydarzenie
            </Link>
          </Button>
          <Button variant="outline">
            <Share2Icon /> Udostępnij
          </Button>
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
        className="aspect-square rounded-xl object-cover"
        alt={event.name}
      />
    </div>
  );
}
