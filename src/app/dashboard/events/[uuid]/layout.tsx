import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { EventPrimaryColorSetter } from "@/components/event-primary-color";
import { API_URL } from "@/lib/api";
import { getBackend, getReferenceCollection } from "@/lib/backend";
import { verifySession } from "@/lib/session";
import type { V3Attribute, V3Event } from "@/types/v3";

const fetchEventAndAttributes = cache(async (eventUuid: string) => {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  try {
    const options = { headers: { Authorization: `Bearer ${bearerToken}` } };
    const [event, attributes] = await Promise.all([
      getBackend<V3Event>(
        `${API_URL}/events/${encodeURIComponent(eventUuid)}`,
        options,
      ),
      getReferenceCollection<V3Attribute>(
        `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes`,
        options,
      ),
    ]);
    return { event, attributes };
  } catch {
    notFound();
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const { event } = await fetchEventAndAttributes(uuid);

  return {
    title: {
      template: `%s — ${event.name} | Eventownik`,
      default: `Dashboard — ${event.name}`,
    },
  };
}

export default async function DashboardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  const { event, attributes } = await fetchEventAndAttributes(uuid);

  return (
    <div className="mb-12 flex grow flex-col gap-4 sm:mb-0 sm:flex-row sm:gap-14">
      <EventPrimaryColorSetter primaryColor={event.primaryColor ?? "#3672fd"} />
      <DashboardSidebar event={event} attributes={attributes} />
      <div className="flex max-w-full grow flex-col overflow-x-auto px-0.5">
        {children}
      </div>
    </div>
  );
}
