import { format } from "date-fns";
import {
  AlertCircle,
  AlertCircleIcon,
  Calendar1,
  Globe,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { EventInfoBlock } from "@/components/event-info-block";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

import { ActivateEvent } from "./activate-event";

export const metadata: Metadata = {
  title: "Panel admina",
};

async function getAllEvents(bearerToken: string) {
  const response = await fetch(`${API_URL}/events/admins/superadminIndex`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  if (!response.ok) {
    return [];
  }
  return ((await response.json()) as Event[]).toSorted((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function checkIfSuperAdmin(bearerToken: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  if (!response.ok) {
    return false;
  }
  const data = (await response.json()) as { type: "organizer" | "superadmin" };
  return data.type === "superadmin";
}

export default async function AdminPage() {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    notFound();
  }
  const { bearerToken } = session;

  const isSuperAdmin = await checkIfSuperAdmin(bearerToken);

  if (!isSuperAdmin) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <Alert variant="destructive">
          <AlertCircle className="size-6" />
          <AlertTitle>Wystąpił błąd podczas pobierania danych.</AlertTitle>
          <AlertDescription>
            Konto na które jesteś zalogowany/a nie jest superadminem.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const events = await getAllEvents(bearerToken);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">Panel superadmina</h1>
        </div>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle className="line-clamp-0">
            Znajdujesz się w panelu superadmina.
          </AlertTitle>
          <AlertDescription className="text-foreground inline">
            Poniżej znajduje się lista <strong>wszystkich wydarzeń</strong> w
            bazie - nie tylko tych, które zostały utworzone przez ciebie. Jest
            ich tu pewnie sporo więc szukaj przez <strong>CTRL+F</strong> jakieś
            wyszukiwanie zrobi się #kiedyś
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "bg-background flex h-full flex-col overflow-hidden rounded-xl border-2",
                  event.isActive ? "border-green-400" : "border-red-400",
                )}
              >
                <div className="relative">
                  <Image
                    src={
                      event.photoUrl == null
                        ? EventPhotoPlaceholder
                        : `${PHOTO_URL}/${event.photoUrl}`
                    }
                    width="500"
                    height="500"
                    className="aspect-square w-full object-cover"
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
                <div className="flex flex-1 flex-col justify-between p-4">
                  <h3 className="mb-4 line-clamp-2 text-2xl font-bold">
                    {event.name}
                  </h3>
                  <div className="flex w-full flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/dashboard/events/${event.id.toString()}`}>
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        href={`https://eventownik.solvro.pl/${event.slug}`}
                        target="_blank"
                      >
                        <Globe className="mr-2 size-4" />
                        Strona
                      </Link>
                    </Button>
                    <ActivateEvent
                      bearerToken={bearerToken}
                      eventId={event.id}
                      isActive={event.isActive}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-red-500">
                Wystąpił błąd podczas pobierania danych. Backend zweryfikował
                tożsamość superadmina, jednak nie zwrócił żadnych wydarzeń. Pisz
                na #backend
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
