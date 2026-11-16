"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Block } from "@/types/blocks";

export const ATTENDANCE_FILTERS = {
  all: "filterAll",
  confirmed: "filterCheckedIn",
  unconfirmed: "filterNotCheckedIn",
} as const;

export type AttendanceFilter = keyof typeof ATTENDANCE_FILTERS;

interface AttendanceToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: AttendanceFilter;
  onFilterChange: (value: AttendanceFilter) => void;
  /** Only passed for BLOCK tickets */
  blocks?: Block[];
  blockUuid?: string;
  onBlockChange: (value: string) => void;
}

function AttendanceToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  blocks,
  blockUuid,
  onBlockChange,
}: AttendanceToolbarProps) {
  const t = useTranslations("Tickets");

  return (
    <div className="flex w-full flex-col gap-2 max-sm:mt-4 sm:flex-row sm:items-center">
      <Input
        className="h-9 min-w-0 text-sm sm:w-64"
        placeholder={t("searchByEmail")}
        aria-label={t("searchByEmail")}
        value={search}
        onChange={(event) => {
          onSearchChange(event.target.value);
        }}
      />
      <Select
        value={filter}
        onValueChange={(value) => {
          onFilterChange(value as AttendanceFilter);
        }}
      >
        <SelectTrigger
          className="h-9 sm:w-48"
          aria-label={t("attendanceFilter")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ATTENDANCE_FILTERS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {t(label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {blocks === undefined ? null : (
        <Select value={blockUuid} onValueChange={onBlockChange}>
          <SelectTrigger className="h-9 sm:w-48" aria-label={t("selectBlock")}>
            <SelectValue placeholder={t("selectBlock")} />
          </SelectTrigger>
          <SelectContent>
            {blocks.map((block) => (
              <SelectItem key={block.uuid} value={block.uuid}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export { AttendanceToolbar };
