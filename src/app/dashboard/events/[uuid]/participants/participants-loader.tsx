"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type {
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import type { Block } from "@/types/blocks";
import type { ParticipantIdentity } from "@/types/participant";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import {
  DEFAULT_PARTICIPANT_SORTING,
  PARTICIPANTS_PAGE_SIZE,
  defaultColumnVisibility,
  isConsistentSnapshot,
  mergeParticipantPages,
  nextParticipantsPage,
  participantsQueryKey,
  requiresCompleteList,
  visibleBonusAttributes,
} from "./query";
import { TableMenu } from "./table/components/buttons/table-menu";
import { HelpDialog } from "./table/components/dialogs/help-dialog";
import { flattenParticipants } from "./table/core/data";
import { ParticipantTable } from "./table/core/participants-table";

const EMPTY_BLOCKS: (Block | null)[] = [];

export function ParticipantsLoader({ eventUuid }: { eventUuid: string }) {
  const t = useTranslations("Table");
  const { toast } = useToast();
  const [selectedParticipants, setSelectedParticipants] = useState<
    ParticipantIdentity[] | null
  >(null);
  const [isSelectAllRequested, setIsSelectAllRequested] = useState(false);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>(
    DEFAULT_PARTICIPANT_SORTING,
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [visibilityOverrides, setVisibilityOverrides] =
    useState<VisibilityState>({});
  const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);

  const {
    data: attributes,
    isError: isAttributesError,
    refetch: refetchAttributes,
  } = useQuery({
    queryKey: ["attributes", eventUuid],
    queryFn: async () => getAttributes(eventUuid),
  });
  const columnVisibility = useMemo(
    () => ({
      ...defaultColumnVisibility(attributes ?? []),
      ...visibilityOverrides,
    }),
    [attributes, visibilityOverrides],
  );
  const bonusAttributes = visibleBonusAttributes(
    attributes ?? [],
    columnVisibility,
  );
  const participantsQuery = useInfiniteQuery({
    queryKey: participantsQueryKey(eventUuid, bonusAttributes),
    queryFn: async ({ pageParam }) =>
      getParticipants(eventUuid, {
        page: pageParam,
        take: PARTICIPANTS_PAGE_SIZE,
        bonusAttributes,
      }),
    initialPageParam: 1,
    getNextPageParam: nextParticipantsPage,
    // Revealing a hidden column refetches with its values; keep rows meanwhile.
    placeholderData: keepPreviousData,
    enabled: attributes != null,
  });
  const {
    data: pages,
    isError: isParticipantsError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = participantsQuery;
  const { data: emails } = useQuery({
    queryKey: ["emails", eventUuid],
    queryFn: async () => getEmails(eventUuid),
  });
  const { data: blocks } = useQuery({
    queryKey: ["blocks", eventUuid, attributes],
    queryFn: async () => getBlocks(eventUuid, attributes ?? []),
    enabled: attributes != null,
  });

  const participants = useMemo(
    () => mergeParticipantPages(pages?.pages ?? []),
    [pages],
  );
  const lastPage = pages?.pages.at(-1) ?? null;
  const serverTotal = lastPage?.meta.itemCount ?? participants.length;
  const areAllPagesLoaded = pages != null && !hasNextPage;
  // Concurrent inserts/deletes can shift offsets between page requests; such a
  // snapshot must not be presented (or bulk-selected) as the complete list.
  const isSnapshotStale =
    areAllPagesLoaded && !isConsistentSnapshot(pages.pages);
  const isComplete = areAllPagesLoaded && !isSnapshotStale;
  const isNarrowed =
    search.trim() !== "" ||
    columnFilters.some(
      (filter) => !Array.isArray(filter.value) || filter.value.length > 0,
    );
  const needsCompleteList =
    isSelectAllRequested ||
    requiresCompleteList({ search, sorting, columnFilters });
  const canLoadMore =
    hasNextPage && !isFetchingNextPage && !isFetchNextPageError;
  // Scroll and auto-load may both ask for the same page; never cancel and
  // restart an in-flight request (React Query's default), just join it.
  const loadNextPage = useCallback(
    async () => fetchNextPage({ cancelRefetch: false }),
    [fetchNextPage],
  );

  const {
    data,
    setData,
    deleteManyParticipants,
    isLoading: isDeleting,
  } = useParticipantsData(eventUuid, participants);
  const isAnyRowEditing = data.some((row) => row.mode === "edit");
  const { isGuardActive, onConfirm, onCancel } =
    useUnsavedForm(isAnyRowEditing);

  // The backend cannot search, sort or filter, so those views are only
  // correct over the whole list: keep loading pages until it is complete.
  useEffect(() => {
    if (needsCompleteList && canLoadMore) {
      void loadNextPage();
    }
  }, [needsCompleteList, canLoadMore, loadNextPage]);

  const changeSearch: OnChangeFn<string> = (updater) => {
    changeView(() => {
      setSearch(typeof updater === "function" ? updater(search) : updater);
    });
  };
  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    changeView(() => {
      setSorting(typeof updater === "function" ? updater(sorting) : updater);
    });
  };
  const changeFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    changeView(() => {
      setColumnFilters(
        typeof updater === "function" ? updater(columnFilters) : updater,
      );
    });
  };
  const changeVisibility: OnChangeFn<VisibilityState> = (updater) => {
    setVisibilityOverrides(
      typeof updater === "function" ? updater(columnVisibility) : updater,
    );
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
      columnVisibility,
      onGlobalFilterChange: changeSearch,
      onSortingChange: changeSorting,
      onColumnFiltersChange: changeFilters,
      onColumnVisibilityChange: changeVisibility,
      // While narrowed, the matching count comes from the (complete) filtered rows.
      total: isNarrowed ? undefined : serverTotal,
      isComplete,
      busy: isDeleting || isSelectAllRequested,
      selection: {
        participants: selectedParticipants,
        busy: isSelectAllRequested,
        onClear: () => {
          setSelectedParticipants(null);
        },
        // Completed by the effect below once every page has loaded.
        onSelectAll: () => {
          if (!isAnyRowEditing && !isSelectAllRequested) {
            setIsSelectAllRequested(true);
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

  // "Select all" targets every matching participant, not just loaded rows:
  // wait until all pages are in, then select the whole filtered set.
  useEffect(() => {
    if (!isSelectAllRequested) {
      return;
    }
    if (isFetching) {
      return;
    }
    if (isFetchNextPageError || isParticipantsError || isSnapshotStale) {
      // Never treat a partial or shifted snapshot as "all matching".
      setIsSelectAllRequested(false);
      toast({ variant: "destructive", title: t("selectionError") });
      return;
    }
    // Table rows are synced from `participants` one render later; selecting
    // before that would pick only the previously loaded rows.
    if (!isComplete || data.length !== participants.length) {
      return;
    }
    setSelectedParticipants(
      table.getFilteredRowModel().rows.map(({ original }) => ({
        uuid: original.uuid,
        email: original.email,
      })),
    );
    setIsSelectAllRequested(false);
  }, [
    isSelectAllRequested,
    isComplete,
    isFetching,
    isFetchNextPageError,
    isParticipantsError,
    isSnapshotStale,
    data.length,
    participants.length,
    table,
    toast,
    t,
  ]);

  function changeView(change: () => void) {
    if (isSelectAllRequested) {
      return;
    }
    if (isAnyRowEditing) {
      setPendingChange(() => change);
      return;
    }
    table.resetRowSelection();
    setSelectedParticipants(null);
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

  if (isAttributesError || (isParticipantsError && pages == null)) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p role="alert" aria-label={t("participantsError")}>
          {t("participantsError")}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            // Retry whichever request failed; participants wait for attributes.
            if (isAttributesError) {
              void refetchAttributes();
            }
            if (isParticipantsError) {
              void refetch();
            }
          }}
        >
          {t("retryLoading")}
        </Button>
      </div>
    );
  }
  if (attributes == null || pages == null) {
    return (
      <div role="status" className="flex justify-center p-8">
        <Loader2 className="animate-spin" aria-hidden="true" />
        <span className="sr-only">{t("loadingMoreParticipants")}</span>
      </div>
    );
  }

  const footer = isSnapshotStale ? (
    <div className="flex items-center justify-center gap-2 p-4 text-sm">
      <p role="alert" aria-label={t("participantsChangedWhileLoading")}>
        {t("participantsChangedWhileLoading")}
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={isFetching}
        onClick={() => {
          // Refetches every loaded page; open edit drafts are kept.
          void refetch();
        }}
      >
        {t("refreshParticipants")}
      </Button>
    </div>
  ) : isFetchNextPageError ? (
    <div className="flex items-center justify-center gap-2 p-4 text-sm">
      <p role="alert" aria-label={t("loadMoreParticipantsError")}>
        {t("loadMoreParticipantsError")}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void loadNextPage();
        }}
      >
        {t("retryLoading")}
      </Button>
    </div>
  ) : (
    <p
      role="status"
      aria-live="polite"
      className="text-muted-foreground flex items-center justify-center gap-2 p-4 text-sm"
    >
      {hasNextPage ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {needsCompleteList
            ? t("loadingAllParticipants", {
                loaded: participants.length,
                total: serverTotal,
              })
            : t("loadingMoreParticipants")}
        </>
      ) : participants.length > 0 ? (
        t("allParticipantsLoaded", { count: serverTotal })
      ) : null}
    </p>
  );

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
          isQuerying={isDeleting || isSelectAllRequested}
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
      {isParticipantsError && !isFetchNextPageError ? (
        <p role="alert">{t("participantsError")}</p>
      ) : null}
      <ParticipantTable
        table={table}
        footer={footer}
        scrollResetKey={JSON.stringify([search, sorting, columnFilters])}
        onEndReached={() => {
          if (canLoadMore) {
            void loadNextPage();
          }
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
          setData(flattenParticipants(participants));
          table.resetRowSelection();
          setSelectedParticipants(null);
          pendingChange?.();
          setPendingChange(null);
        }}
      />
    </>
  );
}
