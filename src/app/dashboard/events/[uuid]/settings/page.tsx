import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { EventSettingsTabs } from "@/app/dashboard/events/[uuid]/settings/settings-tabs";
import { API_URL, fetchAllPages } from "@/lib/api";
import { getUser } from "@/lib/dal";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { CoOrganizer, EventOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Sidebar");

  return {
    title: t("settings"),
  };
}

export default async function DashboardEventSettingsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const t = await getTranslations("Dashboard");
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { uuid } = await params;

  const eventResponse = await fetch(
    `${API_URL}/events/${encodeURIComponent(uuid)}`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (!eventResponse.ok) {
    notFound();
  }
  const event = (await eventResponse.json()) as Event;

  const organizers = await fetchAllPages<EventOrganizer>(
    `${API_URL}/events/${encodeURIComponent(uuid)}/organizers`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (organizers === null) {
    notFound();
  }
  // The list includes the current user, who shouldn't be able to remove themselves
  const user = await getUser();
  const coOrganizers: CoOrganizer[] = organizers
    .filter((organizer) => organizer.uuid !== user?.uuid)
    .map((organizer) => ({
      id: organizer.uuid,
      email: organizer.email,
      permissions: organizer.permissions.map(({ permission }) => ({
        id: permission,
      })),
    }));

  const attributes = await fetchAllPages<Attribute>(
    `${API_URL}/events/${encodeURIComponent(uuid)}/attributes?sort=order:asc`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (attributes === null) {
    notFound();
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">{t("editEvent")}</h1>
      <div className="flex flex-1 flex-col">
        <EventSettingsTabs
          unmodifiedEvent={event}
          unmodifiedCoOrganizers={coOrganizers}
          unmodifiedAttributes={attributes}
        />
      </div>
    </>
  );
}
