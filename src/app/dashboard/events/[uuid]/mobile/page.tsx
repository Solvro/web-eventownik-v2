import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

import {
  getBerealRounds,
  getBingoTasks,
  getChatMessages,
  getMobileConfig,
  getMobileNotifications,
  listMobileItems,
} from "./actions";
import { MobileAdminTabs } from "./mobile-tabs";

export async function generateMetadata() {
  const t = await getTranslations("Sidebar");

  return {
    title: t("mobileApp"),
  };
}

export default async function DashboardEventMobilePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const t = await getTranslations("MobileAdmin");
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { uuid } = await params;

  const [
    eventResponse,
    config,
    sosContacts,
    faq,
    schedule,
    notifications,
    bingoTasks,
    berealRounds,
    chatMessages,
  ] = await Promise.all([
    fetch(`${API_URL}/events/${encodeURIComponent(uuid)}`, {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    }),
    getMobileConfig(uuid),
    listMobileItems(uuid, "sos-contacts"),
    listMobileItems(uuid, "faq"),
    listMobileItems(uuid, "schedule"),
    getMobileNotifications(uuid),
    getBingoTasks(uuid),
    getBerealRounds(uuid),
    getChatMessages(uuid),
  ]);

  if (!eventResponse.ok) {
    notFound();
  }

  const event = (await eventResponse.json()) as Event;

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") === true ? "http" : "https");
  const origin = host === null ? "" : `${protocol}://${host}`;

  return (
    <div className="flex grow flex-col gap-6 pb-20 sm:pb-0">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <MobileAdminTabs
        eventUuid={uuid}
        participantUrl={`${origin}/${event.slug}/app`}
        config={config}
        sosContacts={sosContacts}
        faq={faq}
        schedule={schedule}
        notifications={notifications}
        bingoTasks={bingoTasks}
        berealRounds={berealRounds}
        chatMessages={chatMessages}
      />
    </div>
  );
}
