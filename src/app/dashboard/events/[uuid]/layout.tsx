import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { EventPrimaryColorSetter } from "@/components/event-primary-color";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Event } from "@/types/event";

async function fetchEventAndAttributes(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const attributesResponse = await fetch(
    `${API_URL}/events/${eventUuid}/attributes`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  const eventResponse = await fetch(`${API_URL}/events/${eventUuid}`, {
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
