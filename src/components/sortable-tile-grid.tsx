"use client";

import { DragDropProvider } from "@dnd-kit/react";
import type { DragDropEvents } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";

import { useToast } from "@/hooks/use-toast";
import { createReorderQueue, orderByIds } from "@/lib/reorder-queue";
import type { ReorderSave } from "@/lib/reorder-queue";
import { cn } from "@/lib/utils";

/** Shared layout for dashboard tile grids (forms, email templates) so tiles have identical dimensions. */
export const TILE_GRID_CLASS_NAME =
  "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";

type Identified = { uuid: string } | { id: string };

const getId = (item: Identified) => ("uuid" in item ? item.uuid : item.id);

interface SortableTileProps {
  id: string;
  index: number;
  children: React.ReactNode;
}

function SortableTile({ id, index, children }: SortableTileProps) {
  // Never toggle `disabled` around a drop: doing so re-registers the sortable
  // while its drop animation is running and leaves a displaced ghost tile.
  const { ref, isDragSource } = useSortable({ id, index });

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

interface SortableTileGridProps<T extends Identified> {
  items: T[];
  /** Persists `orderedIds`; `previousIds` is the order the backend last accepted. */
  onReorder: ReorderSave;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

function SortableTileGrid<T extends Identified>({
  items: serverItems,
  onReorder,
  renderItem,
  className = "flex flex-wrap justify-center gap-8 sm:justify-start",
}: SortableTileGridProps<T>) {
  const t = useTranslations("Dashboard");
  const { toast } = useToast();
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [items, setItems] = useState(serverItems);
  const [syncedItems, setSyncedItems] = useState(serverItems);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onReorderRef = useRef(onReorder);
  useEffect(() => {
    onReorderRef.current = onReorder;
  });

  // One queue per mounted grid; lazy state keeps the instance stable.
  // eslint-disable-next-line react/hook-use-state
  const [queue] = useState(() =>
    createReorderQueue({
      save: async (orderedIds, previousIds) =>
        onReorderRef.current(orderedIds, previousIds),
      onFailure: (confirmedIds) => {
        setItems((current) => orderByIds(current, confirmedIds, getId));
        toast({ variant: "destructive", title: t("reorderError") });
      },
      onIdle: () => {
        setIsSaving(false);
        // Keep server props from being applied until the refreshed render lands,
        // otherwise an older in-flight render would snap tiles back.
        startRefresh(() => {
          router.refresh();
        });
      },
    }),
  );

  // Adopt new server data only while nothing local is in progress.
  if (
    syncedItems !== serverItems &&
    !isDragging &&
    !isSaving &&
    !isRefreshing
  ) {
    setSyncedItems(serverItems);
    setItems(serverItems);
  }

  useEffect(() => {
    queue.setConfirmed(syncedItems.map((item) => getId(item)));
  }, [queue, syncedItems]);

  const handleDragEnd: DragDropEvents["dragend"] = (event) => {
    setIsDragging(false);
    const { source } = event.operation;
    if (event.canceled || source == null || !isSortable(source)) {
      return;
    }
    const from = source.sortable.initialIndex;
    const to = source.index;
    const moved = items[from] as T | undefined;
    if (from === to || moved === undefined) {
      return;
    }
    const nextItems = items.toSpliced(from, 1).toSpliced(to, 0, moved);
    setItems(nextItems);
    setIsSaving(true);
    queue.enqueue(nextItems.map((item) => getId(item)));
  };

  return (
    <DragDropProvider
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className={className} aria-busy={isSaving}>
        {items.map((item, index) => (
          <SortableTile key={getId(item)} id={getId(item)} index={index}>
            {renderItem(item)}
          </SortableTile>
        ))}
      </div>
    </DragDropProvider>
  );
}

export { SortableTileGrid };
