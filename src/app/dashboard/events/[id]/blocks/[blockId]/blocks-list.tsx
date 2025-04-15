"use client";

import { AddBlockEntry } from "@/app/dashboard/events/[id]/blocks/[blockId]/add-block-entry";
import { addBlock } from "@/app/dashboard/events/[id]/blocks/actions";

function BlocksList({
  block,
}: {
  block: {
    id: string;
    title: string;
    capacity: number;
    participants: { slug: string; name: string }[];
    children: {
      id: string;
      title: string;
      capacity: number;
      participants: { slug: string; name: string }[];
      children: never[];
    }[];
  };
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-8">
      <AddBlockEntry addBlock={addBlock} />
      {block.children.map((b) => (
        <div
          key={b.id}
          className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4"
        >
          <div className="flex grow flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-bold">{b.title}</p>
            <p className="text-lg font-bold">
              {b.participants.length}/{b.capacity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { BlocksList };
