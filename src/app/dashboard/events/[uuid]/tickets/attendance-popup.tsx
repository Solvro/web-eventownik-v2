"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BookOpenCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { Ticket } from "@/types/tickets";

import { AttendanceTable } from "./(attendance)/attendance-table";
import { AttendanceToolbar } from "./(attendance)/attendance-toolbar";
import type { AttendanceFilter } from "./(attendance)/attendance-toolbar";
import { getTicketParticipants } from "./actions";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const CONFIRMED_QUERY: Record<AttendanceFilter, boolean | undefined> = {
  all: undefined,
  confirmed: true,
  unconfirmed: false,
};

function AttendancePopup({
  eventUuid,
  ticket,
  attributes,
  blocks,
}: {
  eventUuid: string;
  ticket: Ticket;
  attributes: Attribute[];
  /** Blocks of the ticket's attribute. Empty for EVENT tickets */
  blocks: Block[];
}) {
  const t = useTranslations("Tickets");
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<AttendanceFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [blockUuid, setBlockUuid] = useState<string | undefined>(
    blocks.at(0)?.uuid,
  );

  const isBlockTicket = ticket.mode === "BLOCK";
  // The backend rejects blockUuid for EVENT tickets
  const queryBlockUuid = isBlockTicket ? blockUuid : undefined;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  const shownAttributes = useMemo(
    () =>
      attributes.filter((attribute) =>
        ticket.shownAttributeUuids.includes(attribute.uuid),
      ),
    [attributes, ticket.shownAttributeUuids],
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      "ticket-attendance",
      eventUuid,
      ticket.uuid,
      queryBlockUuid,
      filter,
      debouncedSearch,
      page,
    ],
    queryFn: async () =>
      await getTicketParticipants(eventUuid, ticket.uuid, {
        page,
        take: PAGE_SIZE,
        blockUuid: queryBlockUuid,
        confirmed: CONFIRMED_QUERY[filter],
        search: debouncedSearch,
      }),
    // BLOCK tickets can only list participants of one block at a time
    enabled: isOpen && (!isBlockTicket || blockUuid !== undefined),
    placeholderData: keepPreviousData,
  });

  function renderContent() {
    if (isBlockTicket && blocks.length === 0) {
      return (
        <div className="flex flex-1 items-start justify-center pt-12">
          <p className="text-muted-foreground text-center text-sm">
            {t("noBlocksInAttribute")}
          </p>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="flex min-h-[60dvh] items-center justify-center">
          <p className="text-muted-foreground animate-pulse text-sm">
            {t("loadingAttendance")}
          </p>
        </div>
      );
    }
    if (data == null) {
      return (
        <div className="flex flex-1 items-start justify-center pt-12">
          <p className="text-center text-sm text-red-500">
            {t("failedToLoadData")}
          </p>
        </div>
      );
    }
    return (
      <AttendanceTable
        participants={data.data}
        meta={data.meta}
        shownAttributes={shownAttributes}
        onPageChange={setPage}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="eventGhost" size="icon" title={t("attendanceList")}>
          <BookOpenCheck />
          <span className="sr-only">{t("attendanceList")}</span>
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
            {t("attendanceList")}
          </DialogTitle>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-0 sm:pb-0">
          {isBlockTicket && blocks.length === 0 ? null : (
            <AttendanceToolbar
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              blocks={isBlockTicket ? blocks : undefined}
              blockUuid={blockUuid}
              onBlockChange={(value) => {
                setBlockUuid(value);
                setPage(1);
              }}
            />
          )}
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AttendancePopup };
