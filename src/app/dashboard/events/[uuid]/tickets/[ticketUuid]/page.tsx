import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";

import { getTicket } from "../actions";
import { getAttribute, getAttributeBlocks } from "../data-access";
import { TicketScanner } from "./ticket-scanner";

export async function generateMetadata() {
  const t = await getTranslations("Tickets");

  return {
    title: t("scanner"),
  };
}

export default async function TicketScannerPage({
  params,
}: {
  params: Promise<{ uuid: string; ticketUuid: string }>;
}) {
  const t = await getTranslations("Tickets");
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { uuid, ticketUuid } = await params;

  const ticket = await getTicket(uuid, ticketUuid);
  if (ticket === null) {
    notFound();
  }

  // TODO: Load these from the ticket endpoint once the backend returns them, so staff with only SCAN_TICKET can use the scanner
  const [attribute, blocks]: [Attribute | null, Block[] | null] =
    ticket.mode === "BLOCK" && ticket.attributeUuid !== null
      ? await Promise.all([
          getAttribute(uuid, ticket.attributeUuid, bearerToken),
          getAttributeBlocks(uuid, ticket.attributeUuid, bearerToken),
        ])
      : [null, null];

  return (
    // No page scroll: the height leaves room for the navbar, the layout padding and, on mobile, the bottom navigation
    <div className="flex h-[calc(100dvh-192px)] min-h-96 flex-col gap-4 sm:h-[calc(100dvh-144px)]">
      <Link
        href={`/dashboard/events/${uuid}/tickets`}
        className="flex items-center gap-2 underline"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToTickets")}
      </Link>
      <div>
        <h1 className="text-lg font-semibold">
          {ticket.mode === "EVENT"
            ? t("scannerEventTicket")
            : t("scannerBlockTicket")}
        </h1>
        {attribute !== null && (
          <h2 className="text-muted-foreground text-sm font-medium">
            {attribute.name}
          </h2>
        )}
      </div>
      <TicketScanner
        eventUuid={uuid}
        ticketUuid={ticket.uuid}
        blocks={blocks}
        attributeName={attribute?.name ?? null}
      />
    </div>
  );
}
