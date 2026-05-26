import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EventSettingsTabs } from "@/app/dashboard/events/[uuid]/settings/settings-tabs";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

export const metadata: Metadata = {
  title: "Ustawienia",
};

export default async function DashboardEventSettingsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
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

  const coOrganizersResponse = await fetch(
    `${API_URL}/events/${encodeURIComponent(uuid)}/organizers`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (!coOrganizersResponse.ok) {
    notFound();
  }
  const coOrganizers = (await coOrganizersResponse.json()) as CoOrganizer[];

  const attributesResponse = await fetch(
    `${API_URL}/events/${encodeURIComponent(uuid)}/attributes`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (!attributesResponse.ok) {
    notFound();
  }
  const attributes = (await attributesResponse.json()) as EventAttribute[];
  attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Edytuj wydarzenie</h1>
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
