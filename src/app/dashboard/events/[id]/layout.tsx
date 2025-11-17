import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { EventPrimaryColorSetter } from "@/components/event-primary-color";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Event } from "@/types/event";

async function fetchEventAndAttributes(eventId: string) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const attributesResponse = await fetch(
    `${API_URL}/events/${eventId}/attributes`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  const eventResponse = await fetch(`${API_URL}/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!eventResponse.ok || !attributesResponse.ok) {
    notFound();
  }

  const event = (await eventResponse.json()) as Event;
  const attributes = (await attributesResponse.json()) as Attribute[];
  return { event, attributes };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { event } = await fetchEventAndAttributes(id);

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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { event, attributes } = await fetchEventAndAttributes(id);

  return (
    <div className="flex grow flex-col gap-4 sm:flex-row sm:gap-14">
      <EventPrimaryColorSetter primaryColor={event.primaryColor} />
      <DashboardSidebar event={event} attributes={attributes} />
      <div className="max-w-full grow overflow-x-auto">{children}</div>
    </div>
  );
}
