import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { notFound } from "next/navigation";
import { QRCode } from "react-qr-code";

import LightLogo from "@/../public/logo-light.svg";
import { API_URL } from "@/lib/api";
import type { TicketPublic } from "@/types/tickets";

interface TicketPageProps {
  params: Promise<{ eventSlug: string; token: string }>;
}

/** Returns null if the token is unknown, belongs to another event, or the event has no tickets */
async function getPublicTicket(eventSlug: string, token: string) {
  const response = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/tickets/${encodeURIComponent(token)}`,
  );

  if (!response.ok) {
    if (response.status !== 404) {
      console.error(
        `[getPublicTicket] Failed to fetch a ticket for event ${eventSlug}:`,
        await response.text(),
      );
    }
    return null;
  }

  return (await response.json()) as TicketPublic;
}

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { eventSlug, token } = await params;
  const t = await getTranslations("Tickets");
  const ticket = await getPublicTicket(eventSlug, token);

  return {
    title: ticket?.event.name ?? t("ticket"),
    // Ticket links are personal
    robots: { index: false, follow: false },
  };
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { eventSlug, token } = await params;
  const t = await getTranslations("Tickets");
  const ticket = await getPublicTicket(eventSlug, token);

  if (ticket === null) {
    notFound();
  }

  return (
    <main className="flex h-dvh flex-col items-center gap-6 overflow-hidden bg-white px-10 py-6 text-black scheme-light">
      <Image
        src={LightLogo as StaticImageData}
        alt="Eventownik"
        className="h-8 w-auto shrink-0"
        priority
      />
      <h1 className="line-clamp-2 shrink-0 text-center text-2xl font-bold">
        {ticket.event.name}
      </h1>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="size-full max-h-125 max-w-125">
          <QRCode
            value={ticket.token}
            level="M"
            title={t("ticketQrCode")}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </main>
  );
}
