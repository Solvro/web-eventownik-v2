"use client";

import { PackageOpenIcon } from "lucide-react";
import Link from "next/link";

import { SortableTileGrid } from "@/components/sortable-tile-grid";
import { Button } from "@/components/ui/button";
import type { Attribute } from "@/types/attributes";

import { reorderBlockAttributes } from "./actions";

function SortableBlockAttributeGrid({
  blocks,
  eventId,
}: {
  blocks: Attribute[];
  eventId: string;
}) {
  return (
    <SortableTileGrid
      items={blocks}
      onReorder={async (orderedIds) =>
        reorderBlockAttributes(eventId, orderedIds)
      }
      renderItem={(block) => (
        <div className="bg-background flex h-64 flex-col justify-between rounded-md border border-slate-500 p-4 sm:w-64">
          <div className="flex grow flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-bold">{block.name}</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`blocks/${block.id.toString()}`}>
                <PackageOpenIcon />
                Otwórz
              </Link>
            </Button>
          </div>
        </div>
      )}
    />
  );
}

export { SortableBlockAttributeGrid };
