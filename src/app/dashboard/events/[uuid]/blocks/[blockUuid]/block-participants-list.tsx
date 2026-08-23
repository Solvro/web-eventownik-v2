import { useTranslations } from "next-intl";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { BlockParticipant } from "@/types/blocks";

interface BlockParticipantsListProps {
  participants: BlockParticipant[];
}

export function BlockParticipantsList({
  participants,
}: BlockParticipantsListProps) {
  const t = useTranslations("Form");

  const isAnonymousList =
    participants.length > 0 &&
    participants.every(
      (participant) =>
        participant.name?.trim() === "" || participant.name === undefined,
    );

  return (
    <ScrollArea className="h-50 w-full rounded-md border p-4">
      {participants.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("noParticipants")}</p>
      ) : isAnonymousList ? (
        <p className="text-muted-foreground text-sm">
          {t("anonymousParticipantsList")}
        </p>
      ) : (
        <ul>
          {participants.map((participant) => (
            <li key={participant.uuid} className="py-1 text-sm">
              {participant.name ?? t("anonymousParticipant")}
            </li>
          ))}
        </ul>
      )}
    </ScrollArea>
  );
}
