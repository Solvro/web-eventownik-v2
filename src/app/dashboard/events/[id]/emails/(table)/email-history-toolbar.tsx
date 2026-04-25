"use client";

import { ArrowUpDown, FilterX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmailHistoryToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onResetFilters: () => void;
  onResetSorting: () => void;
}

function EmailHistoryToolbar({
  globalFilter,
  onGlobalFilterChange,
  onResetFilters,
  onResetSorting,
}: EmailHistoryToolbarProps) {
  const t = useTranslations("EmailHistoryTable");
  return (
    <div className="flex w-full flex-row flex-nowrap items-center justify-between gap-2 max-sm:mt-4">
      <Input
        className="h-9 min-w-0 flex-1 text-sm sm:w-64 sm:flex-none"
        placeholder={t("searchPlaceholder")}
        value={globalFilter}
        onChange={(event) => {
          onGlobalFilterChange(event.target.value);
        }}
      />
      <div className="flex shrink-0 flex-nowrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onResetFilters}
              size="icon"
              variant="outline"
              aria-label={t("clearFilters")}
            >
              <FilterX />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("clearFilters")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onResetSorting}
              size="icon"
              variant="outline"
              aria-label={t("clearSorting")}
            >
              <ArrowUpDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("clearSorting")}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export { EmailHistoryToolbar };
