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
    <div className="flex flex-wrap items-center gap-2 sm:justify-between">
      <Input
        className="h-9 w-full text-sm sm:w-64"
        placeholder={t("searchPlaceholder")}
        value={globalFilter}
        onChange={(event) => {
          onGlobalFilterChange(event.target.value);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
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
