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
              <EventCardForSuperadmin
                key={event.id}
                event={event}
                bearerToken={bearerToken}
              />
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
