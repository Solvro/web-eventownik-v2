import { AlertCircleIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { EventCardForSuperadmin } from "@/components/event-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

import { FetchErrorAlert } from "../fetch-error-alert";
import { checkIfSuperAdmin } from "./actions";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");

  return {
    title: t("superadminPanel"),
  };
}

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

export default async function AdminPage() {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    notFound();
  }
  const t = await getTranslations("Dashboard");
  const { bearerToken } = session;

  const isSuperAdmin = await checkIfSuperAdmin(bearerToken);

  if (!isSuperAdmin) {
    return <FetchErrorAlert message="notSuperAdmin" />;
  }

  const events = await getAllEvents(bearerToken);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">{t("superadminPanel")}</h1>
        </div>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle className="line-clamp-0">
            {t("superadminPanelInfo")}
          </AlertTitle>
          <AlertDescription className="text-foreground inline">
            {t.rich("superadminEventsDescr", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.uuid}
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
                      <Link href={`/dashboard/events/${event.uuid}`}>
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
                      eventUuid={event.uuid}
                      isActive={event.isActive}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-red-500">{t("superadminEventsFetchError")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
