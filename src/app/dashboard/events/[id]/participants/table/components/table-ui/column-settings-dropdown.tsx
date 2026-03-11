/* eslint-disable unicorn/prevent-abbreviations */
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import type { Column, Table } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import type { FlattenedParticipant } from "@/types/participant";

interface ColumnVisibilityDropdownProps {
  table: Table<FlattenedParticipant>;
}

interface SortableColumnItemProps {
  column: Column<FlattenedParticipant>;
}

function SortableColumnItem({ column }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between"
    >
      <DropdownMenuCheckboxItem
        checked={column.getIsVisible()}
        onCheckedChange={(value) => {
          column.toggleVisibility(value);
        }}
        onSelect={(e) => {
          e.preventDefault();
        }}
      >
        {column.columnDef.meta?.name ?? column.id}
      </DropdownMenuCheckboxItem>
      <GripVertical
        size={18}
        className="text-muted-foreground cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      />
    </div>
  );
}

export function ColumnSettingsDropdown({
  table,
}: ColumnVisibilityDropdownProps) {
  const t = useTranslations("Table");

  const sensors = useSensors(useSensor(PointerSensor));

  const columns = table.getAllColumns().filter((column) => column.getCanHide());

  const columnOrder = table.getState().columnOrder;

  const orderedColumns =
    columnOrder.length > 0
      ? columns.toSorted(
          (a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id),
        )
      : columns;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over == null || active.id === over.id) {
      return;
    }

    const allColumnIds = table.getAllLeafColumns().map((col) => col.id);
    const currentOrder = columnOrder.length > 0 ? columnOrder : allColumnIds;

    const oldIndex = currentOrder.indexOf(active.id as string);
    const newIndex = currentOrder.indexOf(over.id as string);

    table.setColumnOrder(arrayMove(currentOrder, oldIndex, newIndex));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="h-10">
        <Button variant={"outline"}>{t("columnSelectionDropdownTitle")}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedColumns.map((col) => col.id)}
            strategy={verticalListSortingStrategy}
          >
            {orderedColumns.map((column) => (
              <SortableColumnItem key={column.id} column={column} />
            ))}
          </SortableContext>
        </DndContext>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
