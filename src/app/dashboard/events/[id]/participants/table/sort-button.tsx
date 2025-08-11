import type { Column, SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { FlattenedParticipant } from "@/types/participant";

interface SortButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  column: Column<
    FlattenedParticipant,
    string | number | boolean | Date | null | undefined
  >;
  children: ReactNode;
}

/**
 * Default sorting state cycle - 'none' -> 'asc' -> 'desc' -> 'none'
 *
 * When user clicks on a header column while pressing `Shift` key, the multisort will be applied [Multisort](https://tanstack.com/table/v8/docs/guide/sorting#multi-sorting)
 */
export function SortButton({
  column,
  children,
  className,
  onClick,
  ...buttonProps
}: SortButtonProps) {
  return (
    <Button
      variant="eventGhost"
      className={className}
      onClick={(event) => {
        const toggleSorting = column.getToggleSortingHandler();
        if (toggleSorting !== undefined) {
          toggleSorting(event);
        }
      }}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}

export function SortIcon({
  sortingDirection,
}: {
  sortingDirection: false | SortDirection;
}) {
  if (sortingDirection === false) {
    return null;
  }
  if (sortingDirection === "desc") {
    return <ArrowDown />;
  }
  return <ArrowUp />;
}
