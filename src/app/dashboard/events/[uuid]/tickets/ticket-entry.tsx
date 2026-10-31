import { ScanBarcode } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { Ticket } from "@/types/tickets";

import { AttendancePopup } from "./attendance-popup";
import { DeleteTicketPopup } from "./delete-ticket-popup";
import { EditTicketEntry } from "./edit-ticket-entry";

function TicketEntry({
  ticket,
  title,
  eventUuid,
  attributes,
  blocks,
}: {
  ticket: Ticket;
  /** The event name for EVENT tickets, the target attribute's name for BLOCK tickets */
  title: string;
  eventUuid: string;
  attributes: Attribute[];
  /** Blocks of the ticket's attribute. Empty for EVENT tickets */
  blocks: Block[];
}) {
  const t = useTranslations("Tickets");

  return (
    <div className="bg-background flex h-64 flex-col justify-between rounded-md border border-slate-500 p-4 sm:w-64">
      <div className="flex items-center justify-end">
        <EditTicketEntry
          ticketToEdit={ticket}
          eventUuid={eventUuid}
          attributes={attributes}
        />
        <AttendancePopup
          eventUuid={eventUuid}
          ticket={ticket}
          attributes={attributes}
          blocks={blocks}
        />
        {/* The event ticket is removed with the "Deactivate ticket" button instead */}
        {ticket.mode === "BLOCK" && (
          <DeleteTicketPopup
            eventUuid={eventUuid}
            ticketUuid={ticket.uuid}
            ticketName={title}
          />
        )}
      </div>
      <div className="flex grow flex-col items-center justify-center gap-2 text-center">
        <p className="line-clamp-2 w-full overflow-hidden text-lg font-bold text-wrap">
          {title}
        </p>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/events/${eventUuid}/tickets/${ticket.uuid}`}>
            <ScanBarcode /> {t("scan")}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export { TicketEntry };
