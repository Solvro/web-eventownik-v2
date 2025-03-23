import { notFound, redirect } from "next/navigation";

import { EventSettingsTabs } from "@/app/dashboard/events/[id]/settings/settings-tabs";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

export default async function DashboardEventSettingsPage({
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

  const eventResponse = await fetch(`${API_URL}/events/${id}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  if (!eventResponse.ok) {
    notFound();
  }
  const event = (await eventResponse.json()) as Event;

  const coOrganizersResponse = await fetch(
    `${API_URL}/events/${id}/organizers`,
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

  return (
    <>
      <h1 className="pb-8 text-3xl font-bold">Edytuj wydarzenie</h1>
      <div className="">
        <EventSettingsTabs
          unmodifiedEvent={event}
          unmodifiedCoOrganizers={coOrganizers}
        />
      </div>
    </>
  );
}
