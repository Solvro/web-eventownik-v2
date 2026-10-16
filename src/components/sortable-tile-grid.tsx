"use client";

import type { DragEndEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SortableTileProps {
  id: string;
  index: number;
  children: React.ReactNode;
  disabled: boolean;
}

function SortableTile({ id, index, children, disabled }: SortableTileProps) {
  const { ref, isDragSource } = useSortable({ id, index, disabled });

  return (
    <div
      ref={ref}
      className={cn(
        "group relative min-w-0 cursor-grab transition-opacity active:cursor-grabbing max-sm:w-full",
        isDragSource && "z-50 opacity-50",
      )}
    >
      {children}
    </div>
  );
}

interface SortableTileGridProps<T extends { uuid: string } | { id: string }> {
  items: T[];
  onReorder: (orderedIds: string[]) => Promise<{ success: boolean }>;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

function SortableTileGrid<T extends { uuid: string } | { id: string }>({
  items: initialItems,
  onReorder,
  renderItem,
  className = "flex flex-wrap justify-center gap-8 sm:justify-start",
}: SortableTileGridProps<T>) {
  const [items, setItems] = useState(initialItems);
  const t = useTranslations("Dashboard");
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const previousItemsRef = useRef(initialItems);

  if (previousItemsRef.current !== initialItems) {
    previousItemsRef.current = initialItems;
    setItems(initialItems);
  }

  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled || savingRef.current) {
      return;
    }

    const { source } = event.operation;

    if (source != null && isSortable(source)) {
      const initialIndex = source.sortable.initialIndex;
      const index = source.index;

      if (initialIndex !== index) {
        const previous = items;
        const newOrder = [...items];
        const removed = newOrder[initialIndex] as T | undefined;
        if (removed === undefined) {
          return;
        }
        newOrder.splice(initialIndex, 1);
        newOrder.splice(index, 0, removed);
        setItems(newOrder);
        savingRef.current = true;
        setSaving(true);
        void (async () => {
          try {
            const result = await onReorder(
              newOrder.map((item) => ("uuid" in item ? item.uuid : item.id)),
            );
            if (!result.success) {
              setItems(previous);
              toast({ variant: "destructive", title: t("reorderError") });
            }
          } catch {
            setItems(previous);
            toast({ variant: "destructive", title: t("reorderError") });
          } finally {
            savingRef.current = false;
            setSaving(false);
          }
        })();
      }
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className={className} aria-busy={saving}>
        {items.map((item, index) => (
          <SortableTile
            key={"uuid" in item ? item.uuid : item.id}
            id={"uuid" in item ? item.uuid : item.id}
            index={index}
            disabled={saving}
          >
            {renderItem(item)}
          </SortableTile>
        ))}
      </div>
    </DragDropProvider>
  );
}

export { SortableTileGrid };
