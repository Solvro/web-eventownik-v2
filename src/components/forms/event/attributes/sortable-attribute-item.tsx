import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AttributeItem } from "./attribute-item";
import type { SortableAttributeItemProps } from "./types";

export function SortableAttributeItem({
  id,
  index,
  onRemove,
  ...props
}: SortableAttributeItemProps) {
  const { ref, handleRef } = useSortable({
    id,
    index,
  });

  return (
    <div ref={ref}>
      <div className="flex gap-2 rounded-lg">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div
            className="my-2 inline-flex h-9 w-9 cursor-move items-center justify-center rounded-md border border-dashed pointer-coarse:hidden"
            ref={handleRef}
          >
            <GripVertical className="text-muted-foreground h-4 w-4" />
          </div>
          <Button
            variant="eventGhost"
            size="icon"
            onClick={onRemove}
            className="text-destructive hover:text-foreground my-2 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <AttributeItem {...props} index={index} />
      </div>
    </div>
  );
}

SortableAttributeItem.displayName = "SortableAttributeItem";
