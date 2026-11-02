"use client";

import { PowerOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";
import { Button } from "@/components/ui/button";

import { deleteTicket } from "./actions";

function DeleteTicketPopup({
  eventUuid,
  ticketUuid,
  ticketName,
  asDeactivateButton = false,
}: {
  eventUuid: string;
  ticketUuid: string;
  ticketName: string;
  /** Shows a "Deactivate ticket" button instead of the trash icon */
  asDeactivateButton?: boolean;
}) {
  const t = useTranslations("Tickets");
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={ticketName}
      resourceType={t("ticket")}
      description={t("checkInsWillBeDeleted")}
      onDelete={async () => deleteTicket(eventUuid, ticketUuid)}
      onSuccess={() => {
        router.refresh();
      }}
      triggerClassName="text-destructive"
      trigger={
        asDeactivateButton ? (
          <Button variant="destructive" className="w-full lg:w-fit">
            <PowerOff />
            {t("deactivateTicket")}
          </Button>
        ) : undefined
      }
    />
  );
}

export { DeleteTicketPopup };
