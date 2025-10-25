"use client";

import type { SuggestionProps } from "@tiptap/suggestion";
import { useEffect, useImperativeHandle, useState } from "react";

import type { MessageTag } from "@/lib/extensions/tags";
import { cn } from "@/lib/utils";

import { ScrollArea } from "./ui/scroll-area";

interface TagsListProps extends SuggestionProps<MessageTag> {
  ref: React.RefObject<unknown>;
}

export function TagsList({ items, command, ref }: TagsListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index];
    command({ id: item.value, label: item.title });
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  let globalIndex = -1;

  return (
    <ScrollArea
      onWheel={(event) => {
        event.stopPropagation();
      }}
      className="bg-popover border-muted relative z-[9999] flex max-h-96 flex-col overflow-auto rounded-md border p-2 pr-4 shadow-md"
    >
      {items.length > 0 ? (
        Object.entries(
          items.reduce<Record<string, MessageTag[]>>((accumulator, item) => {
            const categoryTitle = item.category?.title ?? "Inne";
            accumulator[categoryTitle] ??= [];
            accumulator[categoryTitle].push(item);
            return accumulator;
          }, {}),
        ).map(([categoryTitle, tags]) => {
          const categoryObject = tags[0].category;
          return (
            <div key={categoryTitle} className="my-2 flex flex-col gap-2">
              <div className="bg-primary/5 flex items-center gap-2 rounded-md p-1 px-2">
                {categoryObject?.icon}
                <p className="text-foreground-muted text-sm">{categoryTitle}</p>
              </div>
              {tags.map((tag) => {
                globalIndex++;
                const flatIndex = globalIndex; // capture current value
                const isSelected = flatIndex === selectedIndex;
                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-1 rounded-md bg-transparent px-2 py-[2px] text-left",
                      "hover:bg-primary/50",
                      isSelected &&
                        "bg-primary/90 hover:bg-primary/50 text-popover",
                    )}
                    key={tag.value}
                    onClick={() => {
                      selectItem(flatIndex);
                    }}
                    title={tag.description}
                  >
                    <span className="max-w-3xs truncate">{tag.title}</span>
                  </button>
                );
              })}
            </div>
          );
        })
      ) : (
        <div>Brak wyników</div>
      )}
    </ScrollArea>
  );
}
