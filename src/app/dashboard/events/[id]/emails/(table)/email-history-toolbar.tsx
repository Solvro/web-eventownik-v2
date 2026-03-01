"use client";

import { ArrowUpDown, FilterX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmailHistoryToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onResetFilters: () => void;
  onResetSorting: () => void;
}

function EmailHistoryToolbar({
  globalFilter,
  onGlobalFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  onResetSorting,
}: EmailHistoryToolbarProps) {
  const t = useTranslations("EmailHistoryTable");
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Input
        className="h-10 w-full sm:w-64"
        placeholder={t("searchPlaceholder")}
        value={globalFilter}
        onChange={(event) => {
          onGlobalFilterChange(event.target.value);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            onStatusFilterChange(value);
          }}
        >
          <SelectTrigger className="h-10 w-40">
            <SelectValue placeholder={t("statusPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("statusLabel")}</SelectLabel>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="sent">{t("sent")}</SelectItem>
              <SelectItem value="pending">{t("pending")}</SelectItem>
              <SelectItem value="failed">{t("failed")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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
