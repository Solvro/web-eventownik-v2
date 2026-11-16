import { CalendarCheck, Tickets } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { API_URL, fetchAllPages } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { Event } from "@/types/event";

import { getTickets } from "./actions";
import { CreateTicketForm } from "./create-ticket-form";
import { getAttributeBlocks } from "./data-access";
import { DeleteTicketPopup } from "./delete-ticket-popup";
import { TicketEntry } from "./ticket-entry";

export async function generateMetadata() {
  const t = await getTranslations("Sidebar");

  return {
    title: t("tickets"),
  };
}

export default async function DashboardEventTicketsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const t = await getTranslations("Dashboard");
  const tTickets = await getTranslations("Tickets");
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { uuid } = await params;

  const [eventResponse, attributes, tickets] = await Promise.all([
    fetch(`${API_URL}/events/${encodeURIComponent(uuid)}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }),
    fetchAllPages<Attribute>(
      `${API_URL}/events/${encodeURIComponent(uuid)}/attributes?sort=order:asc`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    ),
    getTickets(uuid),
  ]);

  if (!eventResponse.ok || attributes === null || tickets === null) {
    notFound();
  }

  const event = (await eventResponse.json()) as Event;

  const blockAttributes = attributes.filter(
    (attribute) => attribute.type === "block",
  );
  const eventTicket = tickets.find((ticket) => ticket.mode === "EVENT");
  // Sorted like the block attributes, so tickets follow the order used elsewhere in the dashboard
  const blockTickets = blockAttributes.flatMap((attribute) => {
    const ticket = tickets.find(
      (ticket_) => ticket_.attributeUuid === attribute.uuid,
    );
    return ticket === undefined ? [] : [{ ticket, attribute }];
  });
  const availableBlockAttributes = blockAttributes.filter(
    (attribute) =>
      !blockTickets.some((blockTicket) => blockTicket.attribute === attribute),
  );

  const blocksByTicketUuid = Object.fromEntries(
    await Promise.all(
      blockTickets.map(
        async ({ ticket, attribute }): Promise<[string, Block[]]> => [
          ticket.uuid,
          await getAttributeBlocks(uuid, attribute.uuid, bearerToken),
        ],
      ),
    ),
  );

  const createBlockTicketDisabledReason =
    blockAttributes.length === 0
      ? tTickets("noBlockAttributes")
      : availableBlockAttributes.length === 0
        ? tTickets("allBlocksHaveTickets")
        : undefined;

  return (
    <div className="flex grow flex-col gap-8">
      <h1 className="text-3xl font-bold">{t("tickets")}</h1>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <CalendarCheck />
            <div>
              <h2 className="text-lg font-semibold">
                {tTickets("eventTicket")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {tTickets("eventTicketDescription")}
              </p>
            </div>
          </div>
          {eventTicket === undefined ? (
            <CreateTicketForm
              eventUuid={uuid}
              mode="EVENT"
              attributes={attributes}
              targetAttributes={[]}
            />
          ) : (
            <DeleteTicketPopup
              eventUuid={uuid}
              ticketUuid={eventTicket.uuid}
              ticketName={event.name}
              asDeactivateButton
            />
          )}
        </div>
        {eventTicket === undefined ? null : (
          <TicketEntry
            ticket={eventTicket}
            title={event.name}
            eventUuid={uuid}
            attributes={attributes}
            blocks={[]}
          />
        )}
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <Tickets />
            <div>
              <h2 className="text-lg font-semibold">
                {tTickets("blockTickets")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {tTickets("blockTicketsDescription")}
              </p>
            </div>
          </div>
          <CreateTicketForm
            eventUuid={uuid}
            mode="BLOCK"
            attributes={attributes}
            targetAttributes={availableBlockAttributes}
            disabledReason={createBlockTicketDisabledReason}
          />
        </div>
        {blockTickets.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
            {blockTickets.map(({ ticket, attribute }) => (
              <TicketEntry
                key={ticket.uuid}
                ticket={ticket}
                title={attribute.name}
                eventUuid={uuid}
                attributes={attributes}
                blocks={blocksByTicketUuid[ticket.uuid] ?? []}
              />
            ))}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <Tickets className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">
              {blockAttributes.length === 0
                ? tTickets("noBlockAttributes")
                : tTickets("noBlockTicketsYet")}
            </h3>
          </div>
        )}
      </section>
    </div>
  );
}
