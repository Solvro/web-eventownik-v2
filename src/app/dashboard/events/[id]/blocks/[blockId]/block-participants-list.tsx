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
  return (
    <ScrollArea className="h-50 w-full rounded-md border p-4">
      {participants.length === 0 && (
        <div className="flex h-41 w-full items-center justify-center">
          {t("noParticipants")}
        </div>
      )}
      <ul>
        {participants.map((participant) => (
          <li key={participant.id} className="py-1 text-left text-sm">
            {participant.name}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
