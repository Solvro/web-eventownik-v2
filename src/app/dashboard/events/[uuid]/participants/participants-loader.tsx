"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ClientPageNavigation } from "@/components/client-page-navigation";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import type { Block } from "@/types/blocks";
import type { Participant, ParticipantIdentity } from "@/types/participant";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipantSelectionPage,
  getParticipants,
} from "./actions";
import { TableMenu } from "./table/components/buttons/table-menu";
import { HelpDialog } from "./table/components/dialogs/help-dialog";
import { flattenParticipants } from "./table/core/data";
import { ParticipantTable } from "./table/core/participants-table";

const EMPTY_PARTICIPANTS: Participant[] = [];
const EMPTY_BLOCKS: (Block | null)[] = [];
export function ParticipantsLoader({ eventUuid }: { eventUuid: string }) {
  const t = useTranslations("Table");
  const { toast } = useToast();
  const [selectedParticipants, setSelectedParticipants] = useState<
    ParticipantIdentity[] | null
  >(null);
  const [selecting, setSelecting] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);
  const [take, setTake] = useState(20);
  const paginationText = useTranslations("Pagination");
  const sort =
    sorting.length === 0
      ? "createdAt:asc"
      : sorting
          .map((item) => `${item.id}:${item.desc ? "desc" : "asc"}`)
          .join(",");
  const query = {
    page,
    take,
    search,
    sort,
    columnFilters: Object.fromEntries(
      columnFilters.map((item) => [
        item.id,
        Array.isArray(item.value) ? item.value : [],
      ]),
    ),
  };
  const { data: attributes, isError: isAttributesError } = useQuery({
    queryKey: ["attributes", eventUuid],
    queryFn: async () => getAttributes(eventUuid),
  });
  const {
    data: participants,
    isError: isParticipantsError,
    isFetching,
  } = useQuery({
    queryKey: ["participants", eventUuid, query],
    queryFn: async () => getParticipants(eventUuid, query),
    placeholderData: keepPreviousData,
  });
  const { data: emails } = useQuery({
    queryKey: ["emails", eventUuid],
    queryFn: async () => getEmails(eventUuid),
  });
  const { data: blocks } = useQuery({
    queryKey: ["blocks", eventUuid, attributes],
    queryFn: async () => getBlocks(eventUuid, attributes ?? []),
    enabled: attributes != null,
  });
  const {
    data,
    setData,
    deleteManyParticipants,
    isLoading: isDeleting,
  } = useParticipantsData(eventUuid, participants?.data ?? EMPTY_PARTICIPANTS);
  const isAnyRowEditing = data.some((row) => row.mode === "edit");
  const { isGuardActive, onConfirm, onCancel } =
    useUnsavedForm(isAnyRowEditing);
  const changeSearch: OnChangeFn<string> = (updater) => {
    changeView(() => {
      setSearch(typeof updater === "function" ? updater(search) : updater);
      setPage(1);
    });
  };
  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    changeView(() => {
      setSorting(typeof updater === "function" ? updater(sorting) : updater);
      setPage(1);
    });
  };
  const changeFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    changeView(() => {
      setColumnFilters(
        typeof updater === "function" ? updater(columnFilters) : updater,
      );
      setPage(1);
    });
  };
  const { table, globalFilter } = useParticipantsTable({
    data,
    attributes: attributes ?? [],
    blocks: blocks ?? EMPTY_BLOCKS,
    eventUuid,
    serverState: {
      globalFilter: search,
      sorting,
      columnFilters,
      onGlobalFilterChange: changeSearch,
      onSortingChange: changeSorting,
      onColumnFiltersChange: changeFilters,
      total: participants?.meta.itemCount ?? 0,
      page: participants?.meta.page ?? page,
      take: participants?.meta.take ?? take,
      busy: isFetching || isDeleting || isParticipantsError || selecting,
      selection: {
        participants: selectedParticipants,
        busy: selecting,
        onClear: () => {
          setSelectedParticipants(null);
        },
        onSelectAll: async () => {
          if (isAnyRowEditing || isFetching || selecting) {
            return;
          }
          setSelecting(true);
          try {
            const selected: ParticipantIdentity[] = [];
            let expectedTotal: number | undefined;
            for (let selectionPage = 1; ; selectionPage++) {
              const result = await getParticipantSelectionPage(eventUuid, {
                ...query,
                page: selectionPage,
                take: 100,
              });
              expectedTotal ??= result.meta.itemCount;
              if (result.meta.itemCount !== expectedTotal) {
                throw new Error("Selection changed");
              }
              selected.push(...result.data);
              if (!result.meta.hasNextPage) {
                break;
              }
            }
            if (
              selected.length !== expectedTotal ||
              new Set(selected.map((item) => item.uuid)).size !==
                selected.length
            ) {
              throw new Error("Selection changed");
            }
            setSelectedParticipants(selected);
            table.toggleAllPageRowsSelected(true);
          } catch {
            toast({ variant: "destructive", title: t("selectionError") });
          } finally {
            setSelecting(false);
          }
        },
      },
    },
    onUpdateData: (rowIndex, value) => {
      setData((previous) =>
        previous.map((row, index) => (index === rowIndex ? value : row)),
      );
    },
  });
  function changeView(change: () => void, preserveSelection = false) {
    if (selecting) {
      return;
    }
    if (isAnyRowEditing) {
      setPendingChange(() => change);
      return;
    }
    table.resetRowSelection();
    if (!preserveSelection) {
      setSelectedParticipants(null);
    }
    change();
  }
  useEffect(() => {
    if (selectedParticipants !== null) {
      const ids = new Set(selectedParticipants.map((item) => item.uuid));
      table.setRowSelection(
        Object.fromEntries(
          data
            .filter((row) => ids.has(row.uuid))
            .map((row) => [row.uuid, true]),
        ),
      );
    }
  }, [data, selectedParticipants, table]);
  useEffect(() => {
    if (
      !isFetching &&
      participants != null &&
      page > Math.max(participants.meta.pageCount, 1)
    ) {
      setPage(Math.max(participants.meta.pageCount, 1));
    }
  }, [page, participants, isFetching]);
  if (isAttributesError || attributes == null || participants == null) {
    return (
      <div role="alert" className="text-center">
        {t("participantsError")}
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{t("participantsTableTitle")}</h1>
          <HelpDialog />
        </div>
        <TableMenu
          table={table}
          eventUuid={eventUuid}
          globalFilter={globalFilter}
          isQuerying={isFetching || isDeleting || selecting}
          emails={emails ?? []}
          attributes={attributes}
          blocks={blocks ?? EMPTY_BLOCKS}
          deleteManyParticipants={async (ids) => {
            await deleteManyParticipants(ids);
            table.resetRowSelection();
            setSelectedParticipants(null);
          }}
        />
      </div>
      {isParticipantsError ? (
        <p role="alert">{t("participantsError")}</p>
      ) : null}
      <ParticipantTable table={table} />
      {participants.meta.itemCount > 10 ? (
        <label className="flex items-center justify-end gap-2 text-sm">
          {paginationText("pageSize")}
          <select
            className="rounded-md border px-2 py-1"
            value={take}
            disabled={isFetching || isDeleting || selecting}
            onChange={(event) => {
              changeView(() => {
                setTake(Number(event.target.value));
                setPage(1);
              }, true);
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <ClientPageNavigation
        meta={participants.meta}
        busy={isFetching || isDeleting || selecting}
        onPageChange={(next) => {
          changeView(() => {
            setPage(next);
          }, true);
        }}
      />
      <UnsavedChangesAlert
        active={isGuardActive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <UnsavedChangesAlert
        active={pendingChange !== null}
        onCancel={() => {
          setPendingChange(null);
        }}
        onConfirm={() => {
          setData(flattenParticipants(participants.data));
          table.resetRowSelection();
          setSelectedParticipants(null);
          pendingChange?.();
          setPendingChange(null);
        }}
      />
    </>
  );
}
