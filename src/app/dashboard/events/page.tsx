import { format } from "date-fns";
import {
  AlertCircle,
  Calendar1,
  CircleHelpIcon,
  Share2Icon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { CreateEventForm } from "@/app/dashboard/(create-event)/create-event-form";
import { EventInfoBlock } from "@/components/event-info-block";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

export default async function EventListPage() {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    notFound();
  }
  const { bearerToken } = session;
  const response = await fetch(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  if (!response.ok) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <Alert variant="destructive">
          <AlertCircle className="size-6" />
          <AlertTitle>Wystąpił błąd podczas pobierania danych.</AlertTitle>
          <AlertDescription>
            Sprawdź swoje połączenie z internetem i spróbuj ponownie.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const events = (await response.json()) as Event[];
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Moje wydarzenia</h1>
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
                  className="border-muted-foreground aspect-square w-full rounded-t-xl border-x border-t object-cover"
                  alt={`Zdjęcie wydarzenia ${event.name}`}
                />
                <div className="absolute inset-0 z-10 flex h-full flex-col justify-between p-4">
                  <div className="flex flex-row justify-between">
                    <EventInfoBlock>
                      <Calendar1 size={16} />
                      <p className="text-sm">
                        {format(event.startDate, "dd.MM.yyyy HH:mm")}
                      </p>
                    </EventInfoBlock>
                    <EventInfoBlock>
                      <p className="text-sm">{event.participantsCount}</p>
                      <Users size={16} />
                    </EventInfoBlock>
                  </div>
                </div>
              </div>
              <div className="border-muted-foreground flex flex-col gap-4 rounded-b-xl border-x border-b p-4">
                <p className="line-clamp-3 text-2xl font-bold">{event.name}</p>
                <p className="line-clamp-3 text-xs">{event.description}</p>
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
