"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import type { PaginatedResponse } from "@/lib/api";

import { Button } from "./ui/button";

export function ClientPageNavigation({
  meta,
  busy = false,
  onPageChange,
}: {
  meta: PaginatedResponse<unknown>["meta"];
  busy?: boolean;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Pagination");
  if (meta.pageCount <= 1) {
    return null;
  }
  return (
    <nav
      aria-label={t("label")}
      className="flex flex-wrap items-center justify-between gap-2 pt-3"
    >
      <Button
        size="sm"
        variant="outline"
        disabled={busy || !meta.hasPreviousPage}
        onClick={() => {
          onPageChange(meta.page - 1);
        }}
      >
        <ChevronLeft />
        {t("previous")}
      </Button>
      <span className="text-sm">
        {t("info", {
          page: meta.page,
          pages: Math.max(meta.pageCount, 1),
          total: meta.itemCount,
        })}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={busy || !meta.hasNextPage}
        onClick={() => {
          onPageChange(meta.page + 1);
        }}
      >
        {t("next")}
        <ChevronRight />
      </Button>
    </nav>
  );
}
