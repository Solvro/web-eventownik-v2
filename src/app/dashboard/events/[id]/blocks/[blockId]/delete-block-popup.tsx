"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteBlock } from "../actions";

function DeleteBlockPopup({
  eventId,
  blockId,
  blockName,
  attributeId,
}: {
  eventId: string;
  blockId: string;
  blockName: string;
  attributeId: string;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={blockName}
      resourceType={t("block")}
      onDelete={async () => deleteBlock(eventId, blockId, attributeId)}
      onSuccess={() => {
        router.refresh();
      }}
      triggerClassName="text-destructive"
    />
  );
}

export { DeleteBlockPopup };
