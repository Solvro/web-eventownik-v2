"use client";

import type { DragEndEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import React, { useRef, useState, useTransition } from "react";

import { cn } from "@/lib/utils";

interface SortableTileProps {
  id: number;
  index: number;
  children: React.ReactNode;
}

function SortableTile({ id, index, children }: SortableTileProps) {
  const { ref, isDragSource } = useSortable({ id, index });

  return (
    <div
      ref={ref}
      className={cn(
        "group relative cursor-grab touch-none transition-opacity active:cursor-grabbing",
        isDragSource && "z-50 opacity-50",
      )}
    >
      {children}
    </div>
  );
}

interface SortableTileGridProps<T extends { id: number }> {
  items: T[];
  onReorder: (orderedIds: number[]) => Promise<{ success: boolean }>;
  renderItem: (item: T) => React.ReactNode;
}

function SortableTileGrid<T extends { id: number }>({
  items: initialItems,
  onReorder,
  renderItem,
}: SortableTileGridProps<T>) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();
  const previousItemsRef = useRef(initialItems);

  if (previousItemsRef.current !== initialItems) {
    previousItemsRef.current = initialItems;
    setItems(initialItems);
  }

  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled) {
      return;
    }

    const { source } = event.operation;

    if (source != null && isSortable(source)) {
      const initialIndex = source.sortable.initialIndex;
      const index = source.index;

      if (initialIndex !== index) {
        setItems((previous) => {
          const newOrder = [...previous];
          const [removed] = newOrder.splice(initialIndex, 1);
          newOrder.splice(index, 0, removed);
          return newOrder;
        });

        startTransition(() => {
          const newOrder = [...items];
          const [removed] = newOrder.splice(initialIndex, 1);
          newOrder.splice(index, 0, removed);
          void onReorder(newOrder.map((item) => item.id));
        });
      }
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
        {items.map((item, index) => (
          <SortableTile key={item.id} id={item.id} index={index}>
            {renderItem(item)}
          </SortableTile>
        ))}
      </div>
    </DragDropProvider>
  );
}

export { SortableTileGrid };
