import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import type { PaginatedResponse } from "@/lib/api";
import { isValidUuid } from "@/lib/is-valid-uuid";
import type { Participant } from "@/types/participant";
import type { V3Attribute as Attribute } from "@/types/v3";

/**
 * The deployed participants listing only supports `page`, `take`,
 * `bonusAttributes` and exact-match `filters`, and always orders by email.
 * Search, sorting and column filters are applied client-side over the
 * complete list instead (see ParticipantsLoader).
 */
export interface ParticipantPageQuery {
  page: number;
  take: number;
  /** Attributes with `showInList: false` whose values should still be returned. */
  bonusAttributes?: string[];
}

export const PARTICIPANTS_PAGE_SIZE = 100;
/** Backend `bonusAttributes` is limited to 1000 characters (~27 UUIDs). */
const BONUS_ATTRIBUTES_MAX_LENGTH = 1000;

export function participantsQueryKey(
  eventUuid: string,
  bonusAttributes: string[],
) {
  return [
    "participants",
    eventUuid,
    { take: PARTICIPANTS_PAGE_SIZE, bonusAttributes },
  ] as const;
}

/** Oldest registration first. */
export const DEFAULT_PARTICIPANT_SORTING: SortingState = [
  { id: "createdAt", desc: false },
];

export function bonusAttributesParameter(uuids: string[]) {
  const accepted: string[] = [];
  for (const uuid of [...new Set(uuids)].toSorted()) {
    if (!isValidUuid(uuid)) {
      continue;
    }
    if ([...accepted, uuid].join(",").length > BONUS_ATTRIBUTES_MAX_LENGTH) {
      break;
    }
    accepted.push(uuid);
  }
  return accepted.join(",");
}

/** `showInList` only decides whether a column starts visible; every attribute stays toggleable. */
export function defaultColumnVisibility(
  attributes: Attribute[],
): VisibilityState {
  return Object.fromEntries([
    ["id", false],
    ...attributes
      .filter((attribute) => !attribute.showInList)
      .map((attribute) => [attribute.uuid, false]),
  ]) as VisibilityState;
}

/** Hidden-by-default attributes the user turned on; the backend omits their values otherwise. */
export function visibleBonusAttributes(
  attributes: Attribute[],
  visibility: VisibilityState,
) {
  return attributes
    .filter(
      (attribute) =>
        !attribute.showInList &&
        attribute.type !== "block" &&
        visibility[attribute.uuid],
    )
    .map((attribute) => attribute.uuid)
    .toSorted();
}

/** Search, sorting and filtering are only correct once every page is loaded. */
export function requiresCompleteList(view: {
  search: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
}) {
  return (
    view.search.trim() !== "" ||
    view.sorting.length > 0 ||
    view.columnFilters.some(
      (filter) => !Array.isArray(filter.value) || filter.value.length > 0,
    )
  );
}

/** Concatenates server pages, dropping rows repeated after concurrent inserts/deletes shift offsets. */
export function mergeParticipantPages(
  pages: (PaginatedResponse<Participant> | null)[],
) {
  const seen = new Set<string>();
  const rows: Participant[] = [];
  for (const page of pages) {
    for (const participant of page?.data ?? []) {
      if (!seen.has(participant.uuid)) {
        seen.add(participant.uuid);
        rows.push(participant);
      }
    }
  }
  return rows;
}

/**
 * A fully loaded list is only trustworthy if every page saw the same total and
 * together they hold exactly that many distinct rows. Inserts or deletes
 * between page requests shift offsets, which shows up as differing
 * `itemCount`s, overlapping rows (deduplicated away) or skipped rows.
 */
export function isConsistentSnapshot(
  pages: (PaginatedResponse<Participant> | null)[],
) {
  const loaded = pages.filter((page) => page !== null);
  if (loaded.length === 0) {
    return true;
  }
  const total = loaded[0].meta.itemCount;
  const rowCount = loaded.reduce((sum, page) => sum + page.data.length, 0);
  return (
    loaded.every((page) => page.meta.itemCount === total) &&
    rowCount === total &&
    mergeParticipantPages(loaded).length === rowCount
  );
}

export function nextParticipantsPage(
  lastPage: PaginatedResponse<Participant> | null,
) {
  return lastPage?.meta.hasNextPage === true
    ? lastPage.meta.page + 1
    : undefined;
}
