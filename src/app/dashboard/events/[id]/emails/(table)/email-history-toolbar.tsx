"use client";

import { ArrowUpDown, FilterX } from "lucide-react";

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
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Input
        className="h-10 w-full sm:w-64"
        placeholder="Szukaj w historii"
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
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="sent">Wysłane</SelectItem>
              <SelectItem value="pending">Oczekujące</SelectItem>
              <SelectItem value="failed">Nieudane</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onResetFilters}
              size="icon"
              variant="outline"
              aria-label="Wyczyść filtry"
            >
              <FilterX />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wyczyść filtry</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onResetSorting}
              size="icon"
              variant="outline"
              aria-label="Wyczyść sortowanie"
            >
              <ArrowUpDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wyczyść sortowanie</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export { EmailHistoryToolbar };
