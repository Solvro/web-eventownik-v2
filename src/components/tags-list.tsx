"use client";

import type { SuggestionProps } from "@tiptap/suggestion";
import { useEffect, useImperativeHandle, useState } from "react";

import type { MessageTag } from "@/lib/extensions/tags";
import { cn } from "@/lib/utils";

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

  return (
    <div
      className="bg-popover border-muted relative z-[9999] flex flex-col gap-1 overflow-auto rounded-md border p-2 shadow-md"
      role="menu"
    >
      {items.length > 0 ? (
        items.map((item, index) => (
          <button
            className={cn(
              "flex w-full items-center gap-1 rounded-md bg-transparent px-2 py-[2px] text-left",
              "hover:bg-primary/50",
              index === selectedIndex &&
                "bg-primary/90 hover:bg-primary/50 text-popover",
            )}
            key={item.value}
            onClick={() => {
              selectItem(index);
            }}
            title={item.description}
          >
            <span className="max-w-3xs truncate">{item.title}</span>
          </button>
        ))
      ) : (
        <div>Brak wyników</div>
      )}
    </div>
  );
}
