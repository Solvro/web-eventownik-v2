"use server";

import { redirect } from "next/navigation";

import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { AttributeType, EventAttribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { Participant } from "@/types/participant";

/**
 * The largest page the participants endpoint will serve. Asking for more is
 * rejected, so a bigger event means more requests, not a bigger request.
 */
const PARTICIPANTS_PAGE_SIZE = 100;

/**
 * Attribute types the backend spells differently from this codebase, mapped to
 * the spelling used everywhere else.
 *
 * Translating here rather than downstream is what keeps the difference in one
 * place: `aggregate.ts` and every component it feeds compare against
 * {@link AttributeType} without knowing which backend answered. A type absent
 * from this table is already spelled the same and passes through untouched.
 */
const ATTRIBUTE_TYPE_ALIASES: Partial<Record<string, AttributeType>> = {
  multiSelect: "multiselect",
  textArea: "textarea",
};

function withKnownType(attribute: EventAttribute): EventAttribute {
  const type = ATTRIBUTE_TYPE_ALIASES[attribute.type];
  return type === undefined ? attribute : { ...attribute, type };
}

interface ParticipantsPage {
  data: Participant[];
  meta: {
    pageCount: number;
  };
}

export async function getOrderedEventAttributes(
  eventUuid: string,
): Promise<EventAttribute[]> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(`${API_URL}/events/${eventUuid}/attributes`, {
    headers: {
      Authorization: `Bearer ${session.bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch attributes for event ${eventUuid} (status ${response.status.toString()})`,
    );
  }

  // Every list endpoint answers with the rows under `data` and the paging
  // counts under `meta`; only the rows matter here, since the attribute list
  // is served whole rather than paged.
  const { data } = (await response.json()) as { data: EventAttribute[] };
  const attributes = data.map((attribute) => withKnownType(attribute));
  attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return attributes;
}

/**
 * Fetches one block attribute's block tree, so that block answers — arrays of
 * block uuids — can be shown as the room and group names participants picked.
 *
 * The endpoint answers with the root block, its descendants nested underneath,
 * or with an empty array when the attribute has no root block yet. The empty
 * case is read as "no names to resolve" rather than passed on as a tree.
 */
export async function getAttributeBlockTree(
  eventUuid: string,
  attributeUuid: string,
): Promise<Block | null> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const response = await fetch(
    `${API_URL}/events/${encodeURIComponent(eventUuid)}/attributes/${encodeURIComponent(attributeUuid)}/blocks`,
    {
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch blocks of attribute ${attributeUuid} (status ${response.status.toString()})`,
    );
  }

  const tree = (await response.json()) as Block | Block[];
  return Array.isArray(tree) ? null : tree;
}

/**
 * Fetches every participant of an event, for computing attribute statistics in
 * the browser.
 *
 * Three things here are about correctness rather than speed:
 *
 * - **Every page is fetched.** The endpoint serves at most
 *   {@link PARTICIPANTS_PAGE_SIZE} participants at a time, so a larger event is
 *   walked page by page until the page metadata says there are no more. Taking
 *   only the first page would silently under-count every statistic shown.
 * - **Every attribute is included.** The participants listing only preloads
 *   attributes with `showInList === true`, so the hidden ones are named
 *   explicitly. Asking for all of them at once is what lets the caller fetch
 *   participants once for the whole page rather than once per selected
 *   attribute.
 * - **Ascending submission order is requested explicitly**, so a page boundary
 *   cannot reorder or duplicate a participant while the pages are being walked,
 *   and answers read in the order participants submitted them.
 */
export async function getParticipantsForStats(
  eventUuid: string,
  attributes: Pick<EventAttribute, "uuid" | "showInList">[],
): Promise<Participant[]> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }

  const { bearerToken } = session;
  const hiddenAttributeUuids = attributes
    .filter((attribute) => !attribute.showInList)
    .map((attribute) => attribute.uuid);

  async function fetchPage(page: number): Promise<ParticipantsPage> {
    const url = new URL(`${API_URL}/events/${eventUuid}/participants`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("take", PARTICIPANTS_PAGE_SIZE.toString());
    url.searchParams.set("sort", "createdAt:asc");
    if (hiddenAttributeUuids.length > 0) {
      url.searchParams.set("bonusAttributes", hiddenAttributeUuids.join(","));
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch participants for event ${eventUuid} (status ${response.status.toString()})`,
      );
    }

    return (await response.json()) as ParticipantsPage;
  }

  const firstPage = await fetchPage(1);
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(0, firstPage.meta.pageCount - 1) },
      async (_, index) => fetchPage(index + 2),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.data);
}
