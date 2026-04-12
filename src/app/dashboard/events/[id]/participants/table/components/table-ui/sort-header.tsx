import type { HeaderContext } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

interface SortHeaderProps<T> {
  info: HeaderContext<FlattenedParticipant, T>;
  name: string;
  truncate?: boolean;
}

export function SortHeader<T>({ info, name, truncate }: SortHeaderProps<T>) {
  const sorted = info.column.getIsSorted();
  const ariaSort =
    sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";

  return (
    <div className="w-full min-w-0" aria-sort={ariaSort}>
      <Button
        variant={"eventGhost"}
        className="w-full min-w-0 justify-between gap-2"
        onClick={(event) => {
          event.preventDefault();
          const toggleSorting = info.column.getToggleSortingHandler();
          if (toggleSorting !== undefined) {
            toggleSorting(event);
          }
        }}
      >
        <span
          className={`min-w-0 flex-1 text-left ${(truncate ?? false) ? "truncate" : ""}`}
        >
          {name}
        </span>
        {sorted === "asc" && <ArrowUp className="shrink-0" />}
        {sorted === "desc" && <ArrowDown className="shrink-0" />}
      </Button>
    </div>
  );
}
