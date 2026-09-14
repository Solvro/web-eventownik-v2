import { format, startOfDay, startOfMinute } from "date-fns";

import type { AttributeType, EventAttribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

/** A distinct answer together with how many participants gave it. */
export interface AnswerBucket {
  answer: string;
  count: number;
  /** Only set for `color` attributes: the participant's own hex. */
  color?: string;
}

/** How an attribute's answers are shown. */
export type AttributeStatistic =
  | { kind: "pie"; buckets: AnswerBucket[] }
  | { kind: "bar"; buckets: AnswerBucket[] }
  | { kind: "list"; answers: string[] }
  | { kind: "none" };

/**
 * Localized strings the display rule needs. Passed in rather than looked up so
 * this module stays pure and i18n-agnostic.
 */
export interface StatisticLabels {
  noAnswer: string;
  yes: string;
  no: string;
  /** Stands in for a block uuid the block tree no longer names. */
  unknownBlock: string;
}

export interface AttributeStatisticInput {
  attribute: Pick<EventAttribute, "uuid" | "type" | "config">;
  participants: Participant[];
  /** Block uuid → block name. Empty for every type except `block`. */
  blockNames: ReadonlyMap<string, string>;
  labels: StatisticLabels;
}

/**
 * How each attribute type is presented, before the distinct-answer threshold is
 * applied. Declared as a total record so that adding a member to
 * `AttributeType` fails the build here rather than silently picking a chart.
 */
type Presentation = "answerList" | "bucketed" | "checkbox" | "none";

const PRESENTATION_BY_TYPE: Record<AttributeType, Presentation> = {
  text: "answerList",
  textarea: "answerList",
  email: "answerList",
  tel: "answerList",
  number: "bucketed",
  select: "bucketed",
  multiselect: "bucketed",
  block: "bucketed",
  date: "bucketed",
  time: "bucketed",
  datetime: "bucketed",
  color: "bucketed",
  checkbox: "checkbox",
  file: "none",
  drawing: "none",
};

/**
 * A widened view of the table above. `type` is declared as `AttributeType`, but
 * it arrives off the wire, so a type added to the backend before this page
 * learns about it really can miss — the declared type just can't say so.
 * Reading through this keeps the exhaustiveness check on the table itself while
 * letting the miss be handled.
 */
const PRESENTATION_LOOKUP: Partial<Record<string, Presentation>> =
  PRESENTATION_BY_TYPE;

function presentationFor(type: AttributeType): Presentation {
  // An unrecognised type gets no statistic rather than a chart nobody designed.
  return PRESENTATION_LOOKUP[type] ?? "none";
}

/**
 * Whether an attribute has any statistic at all. Used to keep the page from
 * opening on an attribute that can only show "no statistic".
 */
export function attributeHasStatistic(type: AttributeType): boolean {
  return presentationFor(type) !== "none";
}

function normalizeValues(
  raw: string | string[] | boolean | undefined,
  labels: StatisticLabels,
): string[] {
  if (raw == null) {
    return [];
  }
  const values = Array.isArray(raw) ? raw : [raw];
  return values
    .map((value) => {
      if (typeof value === "string") {
        return value.trim();
      }
      if (typeof value === "boolean") {
        return value ? labels.yes : labels.no;
      }
      return String(value);
    })
    .filter((value) => value.length > 0);
}

/** The part of a block tree that name resolution reads. */
export interface BlockNameNode {
  uuid: string;
  name: string;
  children: BlockNameNode[];
}

/**
 * Flattens a block tree into the uuid → name map the display rule takes.
 *
 * Every node is included, at every depth, because a block answer names the
 * block the participant actually chose — a room rather than the building it
 * sits in — and nothing here rolls a choice up to its parent.
 */
export function flattenBlockNames(
  tree: BlockNameNode | null | undefined,
): ReadonlyMap<string, string> {
  const names = new Map<string, string>();

  function collect(block: BlockNameNode) {
    names.set(block.uuid, block.name);
    for (const child of block.children) {
      collect(child);
    }
  }

  if (tree != null) {
    collect(tree);
  }

  return names;
}

/**
 * Turns one stored answer into the label its bucket carries.
 *
 * A block answer is an array of block uuids, so each entry is resolved through
 * the name map. A uuid the map does not name — a block deleted after someone
 * chose it — falls back to the localized unknown-block label, so the answer is
 * still counted and the chart never shows a uuid. Every other type is displayed
 * as stored.
 */
function answerLabelFor(
  type: AttributeType,
  blockNames: ReadonlyMap<string, string>,
  labels: StatisticLabels,
): (value: string) => string {
  if (type !== "block") {
    return (value) => value;
  }
  return (value) => blockNames.get(value) ?? labels.unknownBlock;
}

/**
 * An answer read as the value it means. `label` names the bucket and doubles as
 * its key, so answers that mean the same thing collapse together; `order` is
 * where that bucket sits on the numeric or chronological scale.
 */
interface ScaledAnswer {
  label: string;
  order: number;
}

/** Reads one answer as a number or a moment, or `null` if it is neither. */
type AnswerScale = (value: string) => ScaledAnswer | null;

/** The day format the participants table displays dates in. */
const DAY_FORMAT = "dd-MM-yyyy";
const DAY_AND_MINUTE_FORMAT = "dd-MM-yyyy HH:mm";
/** `HH:mm`, `HH:mm:ss` or `HH:mm:ss.sss`, as a time input submits it. */
const TIME_OF_DAY = /^(\d{1,2}):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/u;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;

function momentOf(value: string): Date | null {
  // `new Date` rather than a date-fns parser because the backend stores the
  // string exactly as it was submitted: the same day arrives both as
  // "2026-05-01" and as "2026-05-01T00:00:00.000Z", and reading each as an
  // instant is what collapses the two into one bucket.
  const moment = new Date(value);
  return Number.isNaN(moment.getTime()) ? null : moment;
}

/**
 * The attribute types whose answers mean a number or a moment rather than the
 * string they arrived as. Every other type counts its answers as strings.
 */
const SCALE_BY_TYPE: Partial<Record<AttributeType, AnswerScale>> = {
  number: (value) => {
    // Bucketing on the parsed value is what collapses "5", "5.0" and " 5 ".
    const parsed = Number(value);
    return Number.isFinite(parsed)
      ? { label: String(parsed), order: parsed }
      : null;
  },
  date: (value) => {
    const moment = momentOf(value);
    if (moment === null) {
      return null;
    }
    const day = startOfDay(moment);
    return { label: format(day, DAY_FORMAT), order: day.getTime() };
  },
  time: (value) => {
    const match = TIME_OF_DAY.exec(value);
    if (match === null) {
      return null;
    }
    const hours = Number(match[1]);
    if (hours >= HOURS_PER_DAY) {
      return null;
    }
    // Seconds are discarded, so everyone who picked the same minute lands in
    // one bucket. There is no day to place them in, so the scale is the minute.
    const minutes = Number(match[2]);
    return {
      label: `${String(hours).padStart(2, "0")}:${match[2]}`,
      order: hours * MINUTES_PER_HOUR + minutes,
    };
  },
  datetime: (value) => {
    const moment = momentOf(value);
    if (moment === null) {
      return null;
    }
    const minute = startOfMinute(moment);
    return {
      label: format(minute, DAY_AND_MINUTE_FORMAT),
      order: minute.getTime(),
    };
  },
};

/** Descending count, then alphabetically for stability. */
function byPopularity(a: AnswerBucket, b: AnswerBucket): number {
  return b.count - a.count || a.answer.localeCompare(b.answer);
}

/**
 * Ascending along the scale: lowest number first, earliest moment first. An
 * answer that could not be read as its type has no place on the scale, so it
 * keeps a stable alphabetical order after the ones that could.
 */
function byScale(order: ReadonlyMap<string, number>) {
  return (a: AnswerBucket, b: AnswerBucket): number => {
    const left = order.get(a.answer);
    const right = order.get(b.answer);

    if (left === undefined || right === undefined) {
      if (left !== undefined) {
        return -1;
      }
      if (right !== undefined) {
        return 1;
      }
      return a.answer.localeCompare(b.answer);
    }
    return left - right;
  };
}

/**
 * The types that declare their full option set up front, and whose declared
 * options therefore each get a bucket whether or not anyone chose them.
 *
 * `block` is listed because the display rule treats it as an option-declaring
 * type, though only `select` and `multiselect` put an `options` list in their
 * config today — a block attribute's config carries no options, so expanding it
 * is a no-op until one does.
 */
const OPTION_DECLARING_TYPES = new Set<AttributeType>([
  "select",
  "multiselect",
  "block",
]);

/**
 * The options an attribute declares, or none for a type that declares no option
 * set.
 *
 * Normalized through the same function participants' answers go through, so a
 * declared option and the identical answer given by a participant land in one
 * bucket rather than two.
 */
function declaredOptionsFor(
  attribute: AttributeStatisticInput["attribute"],
  labels: StatisticLabels,
): string[] {
  if (!OPTION_DECLARING_TYPES.has(attribute.type)) {
    return [];
  }
  return normalizeValues(attribute.config?.options, labels);
}

/**
 * Counts how many participants gave each answer to an attribute.
 *
 * - Multi-value answers (arrays) are counted per entry, so totals can exceed
 *   the participant count. Multi-select blocks are counted the same way, one
 *   count per block chosen.
 * - Options the attribute declares start at zero, so an option nobody chose
 *   still gets a bucket instead of vanishing — an unpopular option and one that
 *   was never offered look nothing alike.
 * - An answer outside the declared set — a write-in, or an option withdrawn
 *   after someone chose it — is counted as an ordinary bucket rather than
 *   merged into an "other" lump, because the text a participant wrote is the
 *   answer. That is also why `config.allowOther` needs no branch here: the
 *   backend enforces the flag when an answer is written, so an out-of-set
 *   answer that reaches this page is real data and dropping it would
 *   under-count the chart.
 * - Blank / missing answers are grouped into a single trailing bucket carrying
 *   the localized "no answer" label, added only when at least one participant
 *   left it blank.
 * - Ordered by descending count, then alphabetically for stability — except for
 *   the types that read as a number or a moment, which are ordered ascending
 *   along that scale. The no-answer bucket stays last either way.
 */
function countAttributeValues(
  participants: Participant[],
  attributeUuid: string,
  type: AttributeType,
  labels: StatisticLabels,
  declaredOptions: string[],
  displayAnswer: (value: string) => string,
): AnswerBucket[] {
  const scale = SCALE_BY_TYPE[type];
  // Seeded before anything is counted, so that a declared option nobody chose
  // survives to the sort as a zero-count bucket.
  const counts = new Map<string, number>(
    declaredOptions.map((option): [string, number] => [option, 0]),
  );
  /** Bucket label to its place on the scale, for the types that have one. */
  const order = new Map<string, number>();
  let noAnswer = 0;

  for (const participant of participants) {
    const attribute = participant.attributes.find(
      (candidate) => candidate.uuid === attributeUuid,
    );
    const values = normalizeValues(attribute?.value, labels);

    if (values.length === 0) {
      noAnswer += 1;
      continue;
    }

    for (const value of values) {
      // Resolved first, so a block answer is scaled and bucketed by its name
      // rather than by the uuid it was stored as. For every other type this is
      // the value itself.
      const displayed = displayAnswer(value);
      const scaled = scale?.(displayed) ?? null;
      const answer = scaled?.label ?? displayed;

      if (scaled !== null) {
        order.set(answer, scaled.order);
      }
      counts.set(answer, (counts.get(answer) ?? 0) + 1);
    }
  }

  const result = [...counts.entries()]
    .map(([answer, count]) => ({ answer, count }))
    .toSorted(scale === undefined ? byPopularity : byScale(order));

  if (noAnswer > 0) {
    result.push({ answer: labels.noAnswer, count: noAnswer });
  }

  return result;
}

/**
 * Distinct answers at which a bucketed attribute switches from a pie to a bar
 * chart: a pie stops being readable long before a bar chart does.
 */
const BAR_CHART_THRESHOLD = 10;

/**
 * How many distinct non-empty answers these buckets hold.
 *
 * The no-answer bucket is drawn like any other but never decides the chart
 * type, so the chart cannot flip shape just because one participant skipped the
 * question. It is always the trailing bucket when present, which is what
 * identifies it here.
 */
function distinctAnswerCount(
  buckets: AnswerBucket[],
  labels: StatisticLabels,
): number {
  return buckets.at(-1)?.answer === labels.noAnswer
    ? buckets.length - 1
    : buckets.length;
}

/**
 * Draws a `color` attribute's answers in the colours participants chose: every
 * bucket carries the hex it is labelled with, so a chart can paint it.
 *
 * The no-answer bucket is left without one — it stands for participants who
 * picked no colour at all, and what an absent colour should look like is the
 * chart's decision rather than this module's.
 */
function withAnswerColors(
  buckets: AnswerBucket[],
  noAnswerLabel: string,
): AnswerBucket[] {
  return buckets.map((bucket) =>
    bucket.answer === noAnswerLabel
      ? bucket
      : { ...bucket, color: bucket.answer },
  );
}

/**
 * Every answer to a free-text attribute: one entry per participant who gave
 * one, in the order participants submitted them.
 *
 * The order is recovered here rather than asked of the API. The v3 participants
 * listing orders by email and ignores the sort parameter, so the pages arrive
 * alphabetically however they are requested; every page is fetched before this
 * runs, so sorting on `createdAt` here sees the whole event and yields exact
 * submission order.
 *
 * Participants who left the attribute blank are dropped rather than counted.
 * An answer list shows what was written, and a "no answer" entry would say
 * nothing about anyone.
 */
function collectAnswers(
  participants: Participant[],
  attributeUuid: string,
): string[] {
  return participants
    .toSorted((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    .map((participant) => {
      // A free-text answer is a single string. An array belongs to a
      // multi-value type, none of which are presented as an answer list.
      const value = participant.attributes.find(
        (candidate) => candidate.uuid === attributeUuid,
      )?.value;

      return typeof value === "string" ? value.trim() : "";
    })
    .filter((answer) => answer.length > 0);
}

/**
 * Reads one checkbox answer as a tri-state: `true` for a ticked box, `false`
 * for an unticked one, `undefined` for no answer at all.
 *
 * v3 stores a checkbox as a real boolean. The string forms are read too because
 * `AttributeBase.value` still describes the v2 shape, where every value —
 * booleans included — arrived as a string; the registration form's checkbox
 * already accepts both for the same reason.
 */
function readCheckboxAnswer(raw: unknown): boolean | undefined {
  if (typeof raw === "boolean") {
    return raw;
  }

  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return undefined;
}

/**
 * Counts a checkbox attribute into its three fixed buckets: yes, no, no answer.
 *
 * Always exactly those three, always in that order, whatever the counts. An
 * empty bucket is itself worth seeing, and ordering by count would shuffle the
 * answers around as the event fills up.
 *
 * Expect the no bucket to read zero on real data: an untouched checkbox submits
 * nothing rather than `false`, so a participant who simply left the box unticked
 * lands in no answer. A stored `false` only happens when someone ticked the box
 * and then unticked it.
 */
function countCheckboxAnswers(
  participants: Participant[],
  attributeUuid: string,
  labels: StatisticLabels,
): AnswerBucket[] {
  let yes = 0;
  let no = 0;
  let noAnswer = 0;

  for (const participant of participants) {
    const answer = readCheckboxAnswer(
      participant.attributes.find(
        (candidate) => candidate.uuid === attributeUuid,
      )?.value,
    );

    if (answer === true) {
      yes += 1;
    } else if (answer === false) {
      no += 1;
    } else {
      noAnswer += 1;
    }
  }

  return [
    { answer: labels.yes, count: yes },
    { answer: labels.no, count: no },
    { answer: labels.noAnswer, count: noAnswer },
  ];
}

/**
 * The display rule: decides how one attribute's answers are shown, and builds
 * the data for it.
 *
 * Pure and synchronous — block names arrive already resolved, and localized
 * labels are passed in, so every rule this encodes is testable without
 * rendering anything.
 */
export function buildAttributeStatistic({
  attribute,
  participants,
  blockNames,
  labels,
}: AttributeStatisticInput): AttributeStatistic {
  const presentation = presentationFor(attribute.type);

  if (presentation === "none") {
    return { kind: "none" };
  }

  // Free text is read, not counted: every answer in full, in submission order.
  if (presentation === "answerList") {
    return {
      kind: "list",
      answers: collectAnswers(participants, attribute.uuid),
    };
  }

  // A checkbox counts into three fixed buckets rather than into whatever
  // answers happen to be present, so it never reaches the generic count.
  if (presentation === "checkbox") {
    return {
      kind: "pie",
      buckets: countCheckboxAnswers(participants, attribute.uuid, labels),
    };
  }

  const buckets = countAttributeValues(
    participants,
    attribute.uuid,
    attribute.type,
    labels,
    declaredOptionsFor(attribute, labels),
    answerLabelFor(attribute.type, blockNames, labels),
  );

  // A colour attribute is drawn in the colours participants chose. Every other
  // type leaves its fills to the chart, which derives them from the event's
  // palette. This happens before the shape is chosen, so a colour attribute
  // carries its hexes whether it lands on a pie or a bar chart.
  const painted =
    attribute.type === "color"
      ? withAnswerColors(buckets, labels.noAnswer)
      : buckets;

  // Only the bucketed types get here — every other presentation has returned
  // above — and they are the ones that switch shape on how many distinct
  // answers they collected.
  return {
    kind:
      distinctAnswerCount(painted, labels) >= BAR_CHART_THRESHOLD
        ? "bar"
        : "pie",
    buckets: painted,
  };
}
