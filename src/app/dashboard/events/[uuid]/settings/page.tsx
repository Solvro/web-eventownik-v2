import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { EventSettingsTabs } from "@/app/dashboard/events/[uuid]/settings/settings-tabs";
import { API_URL } from "@/lib/api";
import { getBackend, getReferenceCollection } from "@/lib/backend";
import { verifySession } from "@/lib/session";
import type { V3Attribute, V3Event, V3Organizer } from "@/types/v3";

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

  const options = { headers: { Authorization: `Bearer ${bearerToken}` } };
  const result = await Promise.all([
    getBackend<V3Event>(
      `${API_URL}/events/${encodeURIComponent(uuid)}`,
      options,
    ),
    getReferenceCollection<V3Organizer>(
      `${API_URL}/events/${encodeURIComponent(uuid)}/organizers`,
      options,
    ),
    getReferenceCollection<V3Attribute>(
      `${API_URL}/events/${encodeURIComponent(uuid)}/attributes`,
      options,
    ),
  ]).catch(() => null);
  if (result === null) {
    notFound();
  }
  const [event, coOrganizers, attributes] = result;
  attributes.sort((a, b) => a.order - b.order);

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
