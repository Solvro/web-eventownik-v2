import { Users } from "lucide-react";

import type { Block } from "@/types/blocks";
import type { Participant } from "@/types/participant";

import { DeleteBlockPopup } from "./delete-block-popup";
import { EditBlockEntry } from "./edit-block-entry";

const valueOrZero = (value: number | null | undefined) => {
  return value === null || value === undefined ? "0" : value.toString();
};

function BlockEntry({
  block,
  eventId,
  attributeId,
  participantsInBlock,
}: {
  block: Block;
  eventId: string;
  attributeId: string;
  participantsInBlock: Participant[];
}) {
  return (
    <div
      key={block.id}
      className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4"
    >
      <div className="flex justify-end gap-2">
        <DeleteBlockPopup
          eventId={eventId}
          blockId={block.id.toString()}
          blockName={block.name}
          attributeId={attributeId}
        />
        <EditBlockEntry
          blockToEdit={block}
          eventId={eventId}
          attributeId={attributeId}
          parentId={block.id.toString()}
        />
      </div>
      <div className="flex grow flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-bold">{block.name}</p>
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          {block.capacity === null
            ? valueOrZero(block.meta.participantsInBlockCount)
            : `${valueOrZero(block.meta.participantsInBlockCount)}/${block.capacity.toString()}`}
        </div>
        <p>
          {participantsInBlock
            .map((participant) => participant.email)
            .join(", ")}
        </p>
      </div>
    </div>
  );
}

export { BlockEntry };
