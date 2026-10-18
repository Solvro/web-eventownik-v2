"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import type { OnChangeFn, VisibilityState } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import type { Block } from "@/types/blocks";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import {
  PARTICIPANTS_PAGE_SIZE,
  defaultColumnVisibility,
  isConsistentSnapshot,
  mergeParticipantPages,
  nextParticipantsPage,
  participantsQueryKey,
  visibleBonusAttributes,
} from "./query";
import { TableMenu } from "./table/components/buttons/table-menu";
import { HelpDialog } from "./table/components/dialogs/help-dialog";
import { ParticipantTable } from "./table/core/participants-table";

const EMPTY_BLOCKS: (Block | null)[] = [];

export function ParticipantsLoader({ eventUuid }: { eventUuid: string }) {
  const t = useTranslations("Table");
  const [visibilityOverrides, setVisibilityOverrides] =
    useState<VisibilityState>({});

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
      globalFilter: "",
      sorting: [],
      columnFilters: [],
      columnVisibility,
      onColumnVisibilityChange: changeVisibility,
      total: serverTotal,
      isComplete,
      busy: isDeleting,
    },
    onUpdateData: (rowIndex, value) => {
      setData((previous) =>
        previous.map((row, index) => (index === rowIndex ? value : row)),
      );
    },
  });

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
          {isFetchingNextPage ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isFetchingNextPage
            ? t("loadingMoreParticipants")
            : t("scrollForMoreParticipants", {
                loaded: participants.length,
                total: serverTotal,
              })}
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
        <p role="status" className="text-muted-foreground text-sm">
          {t("participantQueriesUnavailable")}
        </p>
        <TableMenu
          table={table}
          eventUuid={eventUuid}
          globalFilter={globalFilter}
          isQuerying={isDeleting}
          emails={emails ?? []}
          attributes={attributes}
          blocks={blocks ?? EMPTY_BLOCKS}
          deleteManyParticipants={async (ids) => {
            await deleteManyParticipants(ids);
            table.resetRowSelection();
          }}
        />
      </div>
      {isParticipantsError && !isFetchNextPageError ? (
        <p role="alert">{t("participantsError")}</p>
      ) : null}
      <ParticipantTable
        table={table}
        footer={footer}
        onEndReached={() => {
          if (
            canLoadMore &&
            data.length > 0 &&
            data.length === participants.length
          ) {
            void loadNextPage();
          }
        }}
      />
      <UnsavedChangesAlert
        active={isGuardActive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
}
