import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { SortableOptionProps } from "./types";

export function SortableOption({ option, onRemove }: SortableOptionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: option,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 rounded border-2 px-2 py-1 text-sm"
    >
      <span className="cursor-move" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </span>
      {option}
      <button
        onClick={() => {
          onRemove(option);
        }}
        className="text-destructive"
      >
        ×
      </button>
    </div>
  );
}

SortableOption.displayName = "SortableOption";
