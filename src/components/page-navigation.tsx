import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import type { PaginatedResponse } from "@/lib/api";

import { Button } from "./ui/button";

export function PageNavigation({
  meta,
  href,
}: {
  meta: PaginatedResponse<unknown>["meta"];
  href: (page: number) => string;
}) {
  const t = useTranslations("Pagination");
  if (meta.pageCount <= 1) {
    return null;
  }
  return (
    <nav
      aria-label={t("label")}
      className="flex flex-wrap items-center justify-center gap-4"
    >
      {meta.hasPreviousPage ? (
        <Button asChild variant="outline">
          <Link href={href(meta.page - 1)}>
            <ChevronLeft />
            {t("previous")}
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          <ChevronLeft />
          {t("previous")}
        </Button>
      )}
      <p aria-live="polite">
        {t("info", {
          page: meta.page,
          pages: Math.max(meta.pageCount, 1),
          total: meta.itemCount,
        })}
      </p>
      {meta.hasNextPage ? (
        <Button asChild variant="outline">
          <Link href={href(meta.page + 1)}>
            {t("next")}
            <ChevronRight />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          {t("next")}
          <ChevronRight />
        </Button>
      )}
    </nav>
  );
}
