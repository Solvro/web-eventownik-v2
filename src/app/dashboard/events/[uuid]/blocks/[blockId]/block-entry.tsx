import { useAtomValue } from "jotai";
import { Users } from "lucide-react";

import { BlockParticipantsList } from "@/app/dashboard/events/[uuid]/blocks/[blockId]/block-participants-list";
import { participantsVisibilityAtom } from "@/atoms/participants-visibility-atom";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import type { Block } from "@/types/blocks";

import { DeleteBlockPopup } from "./delete-block-popup";
import { EditBlockEntry } from "./edit-block-entry";

const valueOrZero = (value: number | null | undefined) => {
  return value === null || value === undefined ? "0" : value.toString();
};

function BlockEntry({
  block,
  eventUuid,
  attributeId,
}: {
  block: Block;
  eventUuid: string;
  attributeId: string;
}) {
  const areParticipantsVisible = useAtomValue(participantsVisibilityAtom);
  const percentOccupancy =
    block.capacity == null
      ? 0
      : Math.round(
          (Number(valueOrZero(block.meta.participantsInBlockCount)) /
            block.capacity) *
            100,
        );

  return (
    <div
      key={block.id}
      className="flex flex-col justify-between rounded-md border border-slate-500 p-4 sm:w-64"
    >
      <div className="flex justify-end gap-2">
        <EditBlockEntry
          blockToEdit={block}
          eventUuid={eventUuid}
          attributeId={attributeId}
          parentId={block.id.toString()}
        />
        <DeleteBlockPopup
          eventUuid={eventUuid}
          blockId={block.id.toString()}
          blockName={block.name}
          attributeId={attributeId}
        />
      </div>
      <div className="flex grow flex-col items-center justify-center gap-4">
        <p className="text-center text-2xl font-bold">{block.name}</p>
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          {block.capacity === null
            ? valueOrZero(block.meta.participantsInBlockCount)
            : `${valueOrZero(block.meta.participantsInBlockCount)}/${block.capacity.toString()}`}
        </div>
        <Field className="w-full max-w-sm">
          <Progress
            value={percentOccupancy}
            id="progress-upload"
            className={block.capacity === null ? "bg-muted" : ""}
          />
          <FieldLabel htmlFor="progress-upload">
            <span className="ml-auto">
              {block.capacity === null
                ? "Bez limitu"
                : `${percentOccupancy.toString()}%`}
            </span>
          </FieldLabel>
        </Field>
        {areParticipantsVisible ? (
          <BlockParticipantsList participants={block.meta.participants} />
        ) : null}
      </div>
    </div>
  );
}

export { BlockEntry };
