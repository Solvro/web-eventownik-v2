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

  return (
    <div className="w-full min-w-0">
      <Button
        variant={"eventGhost"}
        className="w-full justify-between gap-2"
        onClick={(event) => {
          event.preventDefault();
          const toggleSorting = info.column.getToggleSortingHandler();
          if (toggleSorting !== undefined) {
            toggleSorting(event);
          }
        }}
      >
        <span className={(truncate ?? false) ? "truncate" : ""}>{name}</span>
        {sorted === "asc" && <ArrowUp className="shrink-0" />}
        {sorted === "desc" && <ArrowDown className="shrink-0" />}
      </Button>
    </div>
  );
}
