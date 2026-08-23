import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";

export interface SortableOptionProps {
  option: string;
  index: number;
  onRemove: (option: string) => void;
}

export function SortableOption({
  option,
  index,
  onRemove,
}: SortableOptionProps) {
  const { ref, handleRef } = useSortable({
    id: option,
    index,
  });

  return (
    <div
      ref={ref}
      className="flex items-center gap-1 rounded border-2 px-2 py-1 text-sm"
    >
      <span className="cursor-move" ref={handleRef}>
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
