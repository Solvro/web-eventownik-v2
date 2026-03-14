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
    <div className="flex items-center gap-2" aria-sort={ariaSort}>
      <Button
        variant={"eventGhost"}
        className={(truncate ?? false) ? "max-w-37.5 truncate" : ""}
        onClick={(event) => {
          event.preventDefault();
          const toggleSorting = info.column.getToggleSortingHandler();
          if (toggleSorting !== undefined) {
            toggleSorting(event);
          }
        }}
      >
        {name}
      </Button>
      {sorted === "asc" && <ArrowUp />}
      {sorted === "desc" && <ArrowDown />}
    </div>
  );
}
