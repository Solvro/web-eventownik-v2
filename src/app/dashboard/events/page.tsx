import { format } from "date-fns";
import {
  AlertCircle,
  AlertCircleIcon,
  Calendar1,
  CalendarDays,
  CircleHelpIcon,
  Shield,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { CreateEventForm } from "@/app/dashboard/(create-event)/create-event-form";
import { EventInfoBlock } from "@/components/event-info-block";
import { ShareButton } from "@/components/share-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

export const metadata: Metadata = {
  title: "Moje wydarzenia",
};

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

  const events = ((await response.json()) as Event[]).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const isSuperAdmin = await checkIfSuperAdmin(bearerToken);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">Moje wydarzenia</h1>
          <div className="flex items-center gap-2">
            <CreateEventForm />
            {isSuperAdmin ? (
              <Button
                asChild
                variant="ghost"
                className="border border-amber-400 bg-amber-200/50 hover:bg-amber-200/70 dark:border-amber-400/70 dark:bg-amber-200/20 dark:hover:bg-amber-200/30"
              >
                <Link href="/dashboard/admin">
                  <Shield />
                  Panel superadmina
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle className="line-clamp-0">
            Oficjalna premiera Eventownika już wkrótce!
          </AlertTitle>
          <AlertDescription className="text-foreground inline">
            Jeśli chcesz stworzyć i udostępnić wydarzenie już teraz - odezwij
            się do nas:{" "}
            <a href="mailto:eventownik@pwr.edu.pl" className="hover:underline">
              eventownik@pwr.edu.pl
            </a>
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="border-muted bg-background flex h-full flex-col overflow-hidden rounded-xl border"
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
                  <div className="flex w-full">
                    <Button asChild variant="ghost">
                      <Link href={`/dashboard/events/${event.id.toString()}`}>
                        <CircleHelpIcon className="mr-2 size-4" />
                        Wyświetl szczegóły
                      </Link>
                    </Button>
                    <ShareButton
                      url={`https://eventownik.solvro.pl/${event.slug}`}
                      variant="icon"
                      buttonVariant="ghost"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="text-muted-foreground mb-4 size-12" />
              <h3 className="text-muted-foreground text-lg">
                Nie masz jeszcze żadnego wydarzenia
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
