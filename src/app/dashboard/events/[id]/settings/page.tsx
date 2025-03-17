import { notFound, redirect } from "next/navigation";

import { EventSettingsTabs } from "@/app/dashboard/events/[id]/settings/settings-tabs";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
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
    <>
      <h1 className="pb-8 text-3xl font-bold">Edytuj wydarzenie</h1>
      <div className="">
        <EventSettingsTabs unmodifiedEvent={event} />
      </div>
      <button className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 text-white">
        Zapisz
      </button>
    </>
  );
}
