import { Users } from "lucide-react";

import type { Block } from "@/types/blocks";

const valueOrZero = (value: number | null | undefined) => {
  return value === null || value === undefined ? "0" : value.toString();
};

function BlockEntry({ block }: { block: Block }) {
  return (
    <div
      key={block.id}
      className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4"
    >
      <div className="flex grow flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-bold">{block.name}</p>
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          {block.capacity === null
            ? valueOrZero(block.meta.participantsInBlockCount)
            : `${valueOrZero(block.meta.participantsInBlockCount)}/${block.capacity.toString()}`}
        </div>
      </div>
    </div>
  );
}

export { BlockEntry };
