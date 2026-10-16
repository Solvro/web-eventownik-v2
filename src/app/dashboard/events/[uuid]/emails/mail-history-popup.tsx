"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ClientPageNavigation } from "@/components/client-page-navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { V3EmailDelivery } from "@/types/v3";

import { EmailHistoryTable } from "./(table)/table";
import { getEmailHistoryAction } from "./actions";

interface MailHistoryPopupProps {
  eventUuid: string;
  emailUuid: string;
}

function MailHistoryPopup({ eventUuid, emailUuid }: MailHistoryPopupProps) {
  const t = useTranslations("EmailHistoryTable");
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const statuses = columnFilters.find((filter) => filter.id === "status")
    ?.value as V3EmailDelivery["status"][] | undefined;
  const sort = sorting.at(0);
  const sortField =
    sort?.id === "date" || sort?.id === "time" ? "sendAt" : sort?.id;
  const historyQuery = {
    email: search,
    status: statuses,
    sort:
      sortField === undefined
        ? undefined
        : `${sortField}:${sort === undefined ? "asc" : sort.desc ? "desc" : "asc"}`,
  };

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["email-history", eventUuid, emailUuid, page, historyQuery],
    queryFn: async () =>
      getEmailHistoryAction(eventUuid, emailUuid, page, 10, historyQuery),
    enabled: isOpen,
    placeholderData: keepPreviousData,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setPage(1);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="eventGhost" size="icon" title={t("emailHistory")}>
          <History />
          <span className="sr-only">{t("emailHistory")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className={
          "flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:max-w-4xl sm:gap-4 sm:p-6 " +
          "max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none"
        }
      >
        <div className="flex shrink-0 flex-col gap-1 border-b px-4 pt-4 pb-3 sm:border-0 sm:p-0">
          <DialogTitle className="text-left text-xl font-bold sm:text-2xl">
            {t("emailHistory")}
          </DialogTitle>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-0 sm:pb-0">
          {isLoading ? (
            <div className="flex min-h-[60dvh] items-center justify-center">
              <p className="text-muted-foreground animate-pulse text-sm">
                {t("loadingHistory")}
              </p>
            </div>
          ) : !isError && data !== undefined ? (
            <>
              <EmailHistoryTable
                data={data.data}
                total={data.meta.itemCount}
                state={{
                  globalFilter: search,
                  sorting,
                  columnFilters,
                  onGlobalFilterChange: (update) => {
                    setSearch((current) =>
                      typeof update === "function" ? update(current) : update,
                    );
                    setPage(1);
                  },
                  onSortingChange: (update) => {
                    setSorting(update);
                    setPage(1);
                  },
                  onColumnFiltersChange: (update) => {
                    setColumnFilters(update);
                    setPage(1);
                  },
                }}
              />
              <ClientPageNavigation
                meta={data.meta}
                busy={isFetching}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="flex flex-1 items-start justify-center pt-12">
              <p role="alert" className="text-center text-sm text-red-500">
                {t("failedToLoadData")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MailHistoryPopup };
