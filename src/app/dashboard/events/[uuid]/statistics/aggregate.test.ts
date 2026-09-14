import { describe, expect, it } from "vitest";

import type {
  AttributeBase,
  AttributeConfig,
  AttributeType,
} from "@/types/attributes";
import type { Participant } from "@/types/participant";

import {
  attributeHasStatistic,
  buildAttributeStatistic,
  flattenBlockNames,
} from "./aggregate";

const LABELS = {
  noAnswer: "Brak odpowiedzi",
  yes: "Tak",
  no: "Nie",
  unknownBlock: "Nieznany blok",
};
const NO_ANSWER = LABELS.noAnswer;
const ATTRIBUTE_UUID = "attribute-7";

// v3 stores typed JSON, so a checkbox answer arrives as a real boolean even
// though `AttributeBase.value` still describes the v2 string-only shape.
type TestAnswer = Pick<AttributeBase, "uuid"> & {
  value: AttributeBase["value"] | boolean;
};

function participant(n: number, attributes: TestAnswer[]): Participant {
  return {
    uuid: `participant-${n.toString()}`,
    email: `p${n.toString()}@example.com`,
    slug: `p${n.toString()}`,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    // The cast is the v2/v3 gap above, not a lie about the runtime shape: the
    // API really does send a boolean here. Widening `AttributeBase.value`
    // belongs with the checkbox work.
    attributes: attributes.map((attribute) => ({
      name: "Rozmiar koszuli",
      slug: "shirt-size",
      ...attribute,
    })) as AttributeBase[],
  };
}

function statisticFor(
  participants: Participant[],
  type: AttributeType = "select",
) {
  return buildAttributeStatistic({
    attribute: { uuid: ATTRIBUTE_UUID, type, config: null },
    participants,
    blockNames: new Map(),
    labels: LABELS,
  });
}

/** Participants who each gave a different answer, so `count` buckets come back. */
function distinctAnswers(count: number): Participant[] {
  return Array.from({ length: count }, (_, index) =>
    participant(index + 1, [
      { uuid: ATTRIBUTE_UUID, value: `answer-${index.toString()}` },
    ]),
  );
}

/** Buckets, or a failed expectation if this statistic has none. */
function bucketsOf(participants: Participant[], type?: AttributeType) {
  const statistic = statisticFor(participants, type);
  if (statistic.kind !== "pie" && statistic.kind !== "bar") {
    throw new Error(`expected a bucketed statistic, got "${statistic.kind}"`);
  }
  return statistic.buckets;
}

/** The same participant, submitted at a given moment. */
function submittedAt(base: Participant, createdAt: string): Participant {
  return { ...base, createdAt };
}

/** Answers, or a failed expectation if this statistic is not a list. */
function answerListOf(
  participants: Participant[],
  type: AttributeType = "textarea",
) {
  const statistic = statisticFor(participants, type);
  if (statistic.kind !== "list") {
    throw new Error(`expected an answer list, got "${statistic.kind}"`);
  }
  return statistic.answers;
}

/** One participant per answer; `undefined` leaves the attribute out entirely. */
function checkboxParticipants(answers: (boolean | string | undefined)[]) {
  return answers.map((value, index) =>
    participant(
      index + 1,
      value === undefined ? [] : [{ uuid: ATTRIBUTE_UUID, value }],
    ),
  );
}

/** Buckets for an attribute that declares an option set. */
function bucketsFor(
  participants: Participant[],
  config: AttributeConfig,
  type: AttributeType = "select",
) {
  const statistic = buildAttributeStatistic({
    attribute: { uuid: ATTRIBUTE_UUID, type, config },
    participants,
    blockNames: new Map(),
    labels: LABELS,
  });
  if (statistic.kind !== "pie" && statistic.kind !== "bar") {
    throw new Error(`expected a bucketed statistic, got "${statistic.kind}"`);
  }
  return statistic.buckets;
}

/** Buckets of a block attribute answered with block uuids. */
function blockBucketsOf(
  participants: Participant[],
  blockNames: ReadonlyMap<string, string>,
) {
  const statistic = buildAttributeStatistic({
    attribute: { uuid: ATTRIBUTE_UUID, type: "block", config: null },
    participants,
    blockNames,
    labels: LABELS,
  });
  if (statistic.kind !== "pie" && statistic.kind !== "bar") {
    throw new Error(`expected a bucketed statistic, got "${statistic.kind}"`);
  }
  return statistic.buckets;
}

function checkboxBuckets(answers: (boolean | string | undefined)[]) {
  return bucketsOf(checkboxParticipants(answers), "checkbox");
}

describe("the display rule", () => {
  it.each<AttributeType>(["file", "drawing"])(
    "gives a %s attribute no statistic",
    (type) => {
      expect(statisticFor([], type)).toEqual({ kind: "none" });
      expect(attributeHasStatistic(type)).toBe(false);
    },
  );

  it("gives an attribute type it does not recognise no statistic", () => {
    // Types come off the wire, so one added to the backend before this page
    // learns about it must not fall through to a chart.
    const unknown = "hologram" as AttributeType;

    expect(statisticFor([], unknown)).toEqual({ kind: "none" });
    expect(attributeHasStatistic(unknown)).toBe(false);
  });

  it.each<AttributeType>([
    "text",
    "textarea",
    "email",
    "tel",
    "number",
    "select",
    "multiselect",
    "block",
    "date",
    "time",
    "datetime",
    "color",
    "checkbox",
  ])("gives a %s attribute a statistic", (type) => {
    expect(attributeHasStatistic(type)).toBe(true);
    expect(statisticFor([], type).kind).not.toBe("none");
  });
});

describe("the pie/bar threshold", () => {
  it.each([
    { distinct: 1, kind: "pie" },
    { distinct: 9, kind: "pie" },
    { distinct: 10, kind: "bar" },
    { distinct: 25, kind: "bar" },
  ])(
    "shows $distinct distinct answers as a $kind chart",
    ({ distinct, kind }) => {
      expect(statisticFor(distinctAnswers(distinct)).kind).toBe(kind);
    },
  );

  it("draws the no-answer bucket without counting it toward the threshold", () => {
    // Nine answers plus one participant who skipped: ten buckets, still a pie.
    const participants = [
      ...distinctAnswers(9),
      participant(99, [{ uuid: ATTRIBUTE_UUID, value: "" }]),
    ];

    const buckets = bucketsOf(participants);

    expect(statisticFor(participants).kind).toBe("pie");
    expect(buckets).toHaveLength(10);
    expect(buckets.at(-1)).toEqual({ answer: NO_ANSWER, count: 1 });
  });

  it("switches to a bar on a tenth answer even when someone skipped the question", () => {
    const participants = [
      ...distinctAnswers(10),
      participant(99, [{ uuid: ATTRIBUTE_UUID, value: "" }]),
    ];

    expect(statisticFor(participants).kind).toBe("bar");
    expect(bucketsOf(participants).at(-1)?.answer).toBe(NO_ANSWER);
  });

  it("keeps a checkbox a pie however many answers it collects", () => {
    expect(statisticFor(distinctAnswers(12), "checkbox").kind).toBe("pie");
  });
});

describe("answer buckets", () => {
  it("counts single-value (select) answers and orders by descending count", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "M" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
      participant(4, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
      participant(5, [{ uuid: ATTRIBUTE_UUID, value: "M" }]),
    ];

    expect(bucketsOf(participants)).toEqual([
      { answer: "L", count: 3 },
      { answer: "M", count: 2 },
    ]);
  });

  it("counts each option of a multiselect (array) answer", () => {
    const participants = [
      participant(1, [
        { uuid: ATTRIBUTE_UUID, value: ["Vege", "Bezglutenowa"] },
      ]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: ["Vege"] }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: [] }]),
    ];

    expect(bucketsOf(participants, "multiselect")).toEqual([
      { answer: "Vege", count: 2 },
      { answer: "Bezglutenowa", count: 1 },
      { answer: NO_ANSWER, count: 1 },
    ]);
  });

  it("groups blank, missing and whitespace-only answers into a trailing no-answer bucket", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "   " }]),
      participant(4, []), // attribute entirely absent
    ];

    const buckets = bucketsOf(participants);

    expect(buckets).toEqual([
      { answer: "L", count: 1 },
      { answer: NO_ANSWER, count: 3 },
    ]);
    expect(buckets.at(-1)?.answer).toBe(NO_ANSWER);
  });

  it("omits the no-answer bucket when every participant answered", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "M" }]),
    ];

    expect(
      bucketsOf(participants).some((bucket) => bucket.answer === NO_ANSWER),
    ).toBe(false);
  });

  it("returns no buckets when there are no participants", () => {
    expect(bucketsOf([])).toEqual([]);
  });

  it("breaks ties alphabetically for stable ordering", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "Banan" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "Ananas" }]),
    ];

    expect(bucketsOf(participants)).toEqual([
      { answer: "Ananas", count: 1 },
      { answer: "Banan", count: 1 },
    ]);
  });
});

describe("checkbox answers", () => {
  it("labels boolean answers from the localized labels, not hardcoded strings", () => {
    expect(checkboxBuckets([true, false, true, undefined])).toEqual([
      { answer: LABELS.yes, count: 2 },
      { answer: LABELS.no, count: 1 },
      { answer: NO_ANSWER, count: 1 },
    ]);
  });

  it("keeps all three buckets even when nobody gave that answer", () => {
    expect(checkboxBuckets([])).toEqual([
      { answer: LABELS.yes, count: 0 },
      { answer: LABELS.no, count: 0 },
      { answer: NO_ANSWER, count: 0 },
    ]);

    expect(checkboxBuckets([true, true])).toEqual([
      { answer: LABELS.yes, count: 2 },
      { answer: LABELS.no, count: 0 },
      { answer: NO_ANSWER, count: 0 },
    ]);
  });

  it("orders the buckets yes, no, no answer rather than by count", () => {
    // Counts 1, 3, 2 are in neither ascending nor descending order, so only
    // the fixed order can produce this.
    expect(
      checkboxBuckets([true, false, false, false, undefined, undefined]),
    ).toEqual([
      { answer: LABELS.yes, count: 1 },
      { answer: LABELS.no, count: 3 },
      { answer: NO_ANSWER, count: 2 },
    ]);
  });

  it("is always a pie, never a bar, however many participants answered", () => {
    const answers = Array.from({ length: 40 }, (_, index) => index % 2 === 0);

    const statistic = statisticFor(checkboxParticipants(answers), "checkbox");

    expect(statistic.kind).toBe("pie");
    expect(checkboxBuckets(answers)).toHaveLength(3);
  });

  it("counts a blank or whitespace-only answer as no answer", () => {
    expect(checkboxBuckets(["", "   ", undefined])).toEqual([
      { answer: LABELS.yes, count: 0 },
      { answer: LABELS.no, count: 0 },
      { answer: NO_ANSWER, count: 3 },
    ]);
  });

  it("reads the string form a checkbox answer can still arrive in", () => {
    expect(checkboxBuckets(["true", "false"])).toEqual([
      { answer: LABELS.yes, count: 1 },
      { answer: LABELS.no, count: 1 },
      { answer: NO_ANSWER, count: 0 },
    ]);
  });
});

describe("colour answers", () => {
  it("gives each colour bucket the hex it is labelled with", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "#ff0000" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "#00ff00" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "#ff0000" }]),
    ];

    expect(bucketsOf(participants, "color")).toEqual([
      { answer: "#ff0000", count: 2, color: "#ff0000" },
      { answer: "#00ff00", count: 1, color: "#00ff00" },
    ]);
  });

  it("leaves the no-answer bucket without a colour", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "#ff0000" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "" }]),
    ];

    const buckets = bucketsOf(participants, "color");

    expect(buckets.at(-1)).toEqual({ answer: NO_ANSWER, count: 1 });
    expect(buckets.at(-1)?.color).toBeUndefined();
  });

  it("colours no other attribute type, even when its answers look like hexes", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "#ff0000" }]),
    ];

    expect(bucketsOf(participants, "select")).toEqual([
      { answer: "#ff0000", count: 1 },
    ]);
    expect(bucketsOf(participants, "select")[0].color).toBeUndefined();
  });
});

describe("the answer list", () => {
  it.each<AttributeType>(["text", "textarea", "email", "tel"])(
    "reads a %s attribute's answers back as a list rather than a chart",
    (type) => {
      const participants = [
        participant(1, [
          { uuid: ATTRIBUTE_UUID, value: "Bardzo udana impreza" },
        ]),
      ];

      expect(statisticFor(participants, type)).toEqual({
        kind: "list",
        answers: ["Bardzo udana impreza"],
      });
    },
  );

  it("orders answers by submission time, not by the order they arrived in", () => {
    // The participants listing orders by email and ignores the sort parameter,
    // so submission order has to be recovered from `createdAt` here.
    const participants = [
      submittedAt(
        participant(1, [{ uuid: ATTRIBUTE_UUID, value: "trzecia odpowiedz" }]),
        "2026-03-03T09:00:00.000Z",
      ),
      submittedAt(
        participant(2, [{ uuid: ATTRIBUTE_UUID, value: "pierwsza odpowiedz" }]),
        "2026-03-01T09:00:00.000Z",
      ),
      submittedAt(
        participant(3, [{ uuid: ATTRIBUTE_UUID, value: "druga odpowiedz" }]),
        "2026-03-02T09:00:00.000Z",
      ),
    ];

    expect(answerListOf(participants)).toEqual([
      "pierwsza odpowiedz",
      "druga odpowiedz",
      "trzecia odpowiedz",
    ]);
  });

  it("omits participants who left the attribute blank, with no no-answer entry", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "Wszystko super" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "   " }]),
      participant(4, []), // attribute entirely absent
    ];

    const answers = answerListOf(participants);

    expect(answers).toEqual(["Wszystko super"]);
    expect(answers).not.toContain(NO_ANSWER);
  });

  it("keeps one entry per participant, so two identical answers both appear", () => {
    const participants = [
      submittedAt(
        participant(1, [{ uuid: ATTRIBUTE_UUID, value: "Nie mam uwag" }]),
        "2026-03-01T09:00:00.000Z",
      ),
      submittedAt(
        participant(2, [{ uuid: ATTRIBUTE_UUID, value: "Nie mam uwag" }]),
        "2026-03-02T09:00:00.000Z",
      ),
    ];

    expect(answerListOf(participants)).toEqual([
      "Nie mam uwag",
      "Nie mam uwag",
    ]);
  });

  it("keeps a long answer whole, with the participant's own line breaks", () => {
    const reply =
      "Pierwszy akapit, w ktorym uczestnik pisze naprawde sporo.\n\nDrugi akapit,\nz wlasnym lamaniem wiersza.";

    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: reply }]),
    ];

    expect(answerListOf(participants)).toEqual([reply]);
  });

  it("is empty when nobody answered", () => {
    expect(answerListOf([])).toEqual([]);
    expect(answerListOf([participant(1, [])])).toEqual([]);
  });
});

/**
 * An ISO timestamp for a wall-clock moment in local time. Buckets are labelled
 * in local time, so building answers this way keeps the expected labels the
 * same whatever timezone the tests run in.
 */
function moment(
  month: number,
  day: number,
  hours = 12,
  minutes = 0,
  seconds = 0,
) {
  return new Date(2026, month - 1, day, hours, minutes, seconds).toISOString();
}

/** Just the labels, in order. */
function answersOf(participants: Participant[], type: AttributeType) {
  return bucketsOf(participants, type).map((bucket) => bucket.answer);
}

describe("number answers", () => {
  it("counts values that mean the same number as one answer", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "5" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "5.0" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: " 5 " }]),
    ];

    expect(bucketsOf(participants, "number")).toEqual([
      { answer: "5", count: 3 },
    ]);
  });

  it("orders numerically ascending rather than by count", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "30" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "7" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "30" }]),
      participant(4, [{ uuid: ATTRIBUTE_UUID, value: "-2.5" }]),
    ];

    // Ascending, so the two-participant bucket is neither first nor sorted as
    // the string "30" would be.
    expect(bucketsOf(participants, "number")).toEqual([
      { answer: "-2.5", count: 1 },
      { answer: "7", count: 1 },
      { answer: "30", count: 2 },
    ]);
  });
});

describe("date answers", () => {
  it("buckets by calendar day, in the participants table's day format", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: moment(5, 1, 9, 15) }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: moment(5, 1, 23, 40) }]),
    ];

    expect(bucketsOf(participants, "date")).toEqual([
      { answer: "01-05-2026", count: 2 },
    ]);
  });

  it("counts one day written two ways as one answer", () => {
    // The backend keeps whatever string was submitted, so the same day arrives
    // in more than one shape.
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "2026-05-01" }]),
      participant(2, [
        { uuid: ATTRIBUTE_UUID, value: "2026-05-01T00:00:00.000Z" },
      ]),
    ];

    expect(bucketsOf(participants, "date")).toEqual([
      { answer: expect.any(String) as string, count: 2 },
    ]);
  });

  it("orders days chronologically rather than by count or alphabetically", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: moment(9, 1) }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: moment(2, 3) }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: moment(9, 1) }]),
    ];

    expect(answersOf(participants, "date")).toEqual([
      "03-02-2026",
      "01-09-2026",
    ]);
  });
});

describe("time answers", () => {
  it("buckets to the minute, discarding seconds", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "14:30" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "14:30:00" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "14:30:59" }]),
    ];

    expect(bucketsOf(participants, "time")).toEqual([
      { answer: "14:30", count: 3 },
    ]);
  });

  it("orders times chronologically rather than by count or alphabetically", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "14:30" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "9:05" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "14:30" }]),
    ];

    expect(answersOf(participants, "time")).toEqual(["09:05", "14:30"]);
  });
});

describe("datetime answers", () => {
  it("buckets to the day and minute", () => {
    const participants = [
      participant(1, [
        { uuid: ATTRIBUTE_UUID, value: moment(5, 1, 14, 30, 0) },
      ]),
      participant(2, [
        { uuid: ATTRIBUTE_UUID, value: moment(5, 1, 14, 30, 45) },
      ]),
      participant(3, [
        { uuid: ATTRIBUTE_UUID, value: moment(5, 1, 14, 31, 0) },
      ]),
    ];

    expect(bucketsOf(participants, "datetime")).toEqual([
      { answer: "01-05-2026 14:30", count: 2 },
      { answer: "01-05-2026 14:31", count: 1 },
    ]);
  });

  it("orders moments chronologically rather than by count", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: moment(9, 1, 8, 0) }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: moment(2, 3, 17, 45) }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: moment(9, 1, 8, 0) }]),
    ];

    expect(answersOf(participants, "datetime")).toEqual([
      "03-02-2026 17:45",
      "01-09-2026 08:00",
    ]);
  });
});

describe("the no-answer bucket under a numeric or chronological order", () => {
  it.each<[AttributeType, string]>([
    ["number", "5"],
    ["date", "2026-05-01"],
    ["time", "14:30"],
    ["datetime", "2026-05-01T14:30:00.000Z"],
  ])("stays last for %s answers", (type, answered) => {
    // The no-answer bucket outnumbers the only answer, so a count-ordered or
    // scale-ordered list would both put it first if it were not pinned last.
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: answered }]),
      participant(2, []),
      participant(3, []),
    ];

    const buckets = bucketsOf(participants, type);

    expect(buckets).toHaveLength(2);
    expect(buckets.at(-1)).toEqual({ answer: NO_ANSWER, count: 2 });
  });
});

describe("declared options and write-ins", () => {
  it("shows an option nobody chose as a zero-count bucket", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "M" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "L" }]),
    ];

    expect(bucketsFor(participants, { options: ["S", "M", "L"] })).toEqual([
      { answer: "L", count: 2 },
      { answer: "M", count: 1 },
      { answer: "S", count: 0 },
    ]);
  });

  it("shows the declared options before anyone has answered", () => {
    expect(bucketsFor([], { options: ["S", "M"] })).toEqual([
      { answer: "M", count: 0 },
      { answer: "S", count: 0 },
    ]);
  });

  it("keeps the no-answer bucket last, behind the zero-count options", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: ["Vege"] }]),
      participant(2, [
        { uuid: ATTRIBUTE_UUID, value: ["Vege", "Bezglutenowa"] },
      ]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: [] }]),
    ];

    const buckets = bucketsFor(
      participants,
      { options: ["Vege", "Bezglutenowa", "Bezlaktozowa"] },
      "multiselect",
    );

    expect(buckets).toEqual([
      { answer: "Vege", count: 2 },
      { answer: "Bezglutenowa", count: 1 },
      { answer: "Bezlaktozowa", count: 0 },
      { answer: NO_ANSWER, count: 1 },
    ]);
    expect(buckets.at(-1)?.answer).toBe(NO_ANSWER);
  });

  it("counts zero-count options among the distinct answers the threshold sees", () => {
    // Twelve options of which three were chosen is a twelve-answer attribute,
    // so the chart type stays a property of the attribute rather than of how
    // full the event currently is.
    const options = [
      "Wrocław",
      "Kraków",
      "Gdańsk",
      ...Array.from(
        { length: 9 },
        (_, index) => `Miasto ${(index + 1).toString()}`,
      ),
    ];
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "Wrocław" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "Kraków" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "Gdańsk" }]),
      participant(4, []),
    ];

    const buckets = bucketsFor(participants, { options });
    // What the pie/bar threshold counts: every bucket but "no answer".
    const answeredBuckets = buckets.filter(
      (bucket) => bucket.answer !== NO_ANSWER,
    );

    expect(answeredBuckets).toHaveLength(12);
    expect(answeredBuckets.filter((bucket) => bucket.count === 0)).toHaveLength(
      9,
    );
    expect(buckets.at(-1)).toEqual({ answer: NO_ANSWER, count: 1 });
  });

  it("counts a write-in answer as an ordinary bucket", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "S" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "XXL" }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: "XXL" }]),
    ];

    expect(
      bucketsFor(participants, { options: ["S", "M"], allowOther: true }),
    ).toEqual([
      { answer: "XXL", count: 2 },
      { answer: "S", count: 1 },
      { answer: "M", count: 0 },
    ]);
  });

  it("gives every write-in its own bucket rather than one lumped 'other'", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "XS" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "XXL" }]),
    ];

    expect(
      bucketsFor(participants, { options: ["S"], allowOther: true }),
    ).toEqual([
      { answer: "XS", count: 1 },
      { answer: "XXL", count: 1 },
      { answer: "S", count: 0 },
    ]);
  });

  it("counts an answer outside the option set even where write-ins are not allowed", () => {
    // The backend rejects an out-of-set answer as it is written, so one that
    // reaches this page is real data — an option withdrawn after somebody chose
    // it. Dropping it would under-count the chart.
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "S" }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: "Wycofany" }]),
    ];

    expect(bucketsFor(participants, { options: ["S", "M"] })).toEqual([
      { answer: "S", count: 1 },
      { answer: "Wycofany", count: 1 },
      { answer: "M", count: 0 },
    ]);
  });

  it("leaves a type that declares no option set alone", () => {
    // Only select, multiselect and block declare options, so a stray `options`
    // on any other type must not invent buckets for it.
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: "1" }]),
    ];

    const answers = bucketsFor(
      participants,
      { options: ["1", "2", "3"] },
      "number",
    ).map((bucket) => bucket.answer);

    expect(answers).not.toContain("2");
    expect(answers).not.toContain("3");
  });
});

describe("block answers", () => {
  // The tree an organizer built: one building holding two rooms, and a
  // stand-alone room beside it.
  const BLOCK_TREE = {
    uuid: "root",
    name: "Nocleg",
    children: [
      {
        uuid: "building-a",
        name: "Budynek A",
        children: [
          { uuid: "room-101", name: "Sala 101", children: [] },
          { uuid: "room-102", name: "Sala 102", children: [] },
        ],
      },
      { uuid: "room-201", name: "Sala 201", children: [] },
    ],
  };

  it("names every block in the tree, at every depth", () => {
    expect([...flattenBlockNames(BLOCK_TREE)]).toEqual([
      ["root", "Nocleg"],
      ["building-a", "Budynek A"],
      ["room-101", "Sala 101"],
      ["room-102", "Sala 102"],
      ["room-201", "Sala 201"],
    ]);
  });

  it("resolves no names when the attribute has no block tree", () => {
    expect(flattenBlockNames(null).size).toBe(0);
  });

  it("shows block names rather than the uuids that were stored", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: ["room-101"] }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: ["room-201"] }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: ["room-101"] }]),
    ];

    expect(blockBucketsOf(participants, flattenBlockNames(BLOCK_TREE))).toEqual(
      [
        { answer: "Sala 101", count: 2 },
        { answer: "Sala 201", count: 1 },
      ],
    );
  });

  it("counts every block a participant chose, so totals exceed the participant count", () => {
    const participants = [
      participant(1, [
        { uuid: ATTRIBUTE_UUID, value: ["room-101", "room-102"] },
      ]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: ["room-101"] }]),
      participant(3, [{ uuid: ATTRIBUTE_UUID, value: [] }]),
    ];

    expect(blockBucketsOf(participants, flattenBlockNames(BLOCK_TREE))).toEqual(
      [
        { answer: "Sala 101", count: 2 },
        { answer: "Sala 102", count: 1 },
        { answer: NO_ANSWER, count: 1 },
      ],
    );
  });

  it("counts the block that was chosen, never rolling it up to its parent", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: ["room-101"] }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: ["building-a"] }]),
    ];

    expect(blockBucketsOf(participants, flattenBlockNames(BLOCK_TREE))).toEqual(
      [
        { answer: "Budynek A", count: 1 },
        { answer: "Sala 101", count: 1 },
      ],
    );
  });

  it("counts an answer the tree no longer names without showing its uuid", () => {
    // A block deleted after someone chose it: the answer still happened, so it
    // is still counted, under the localized unknown-block label.
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: ["room-101"] }]),
      participant(2, [
        { uuid: ATTRIBUTE_UUID, value: ["room-101", "deleted-block"] },
      ]),
    ];

    expect(blockBucketsOf(participants, flattenBlockNames(BLOCK_TREE))).toEqual(
      [
        { answer: "Sala 101", count: 2 },
        { answer: LABELS.unknownBlock, count: 1 },
      ],
    );
  });

  it("labels every answer as unknown when the block tree failed to resolve", () => {
    const participants = [
      participant(1, [{ uuid: ATTRIBUTE_UUID, value: ["room-101"] }]),
      participant(2, [{ uuid: ATTRIBUTE_UUID, value: ["room-201"] }]),
    ];

    expect(blockBucketsOf(participants, new Map())).toEqual([
      { answer: LABELS.unknownBlock, count: 2 },
    ]);
  });

  it("resolves names for block attributes only", () => {
    // A select answer that happens to read like a block uuid is still the
    // answer the participant gave.
    const statistic = buildAttributeStatistic({
      attribute: { uuid: ATTRIBUTE_UUID, type: "select", config: null },
      participants: [
        participant(1, [{ uuid: ATTRIBUTE_UUID, value: "room-101" }]),
      ],
      blockNames: flattenBlockNames(BLOCK_TREE),
      labels: LABELS,
    });

    expect(statistic).toEqual({
      kind: "pie",
      buckets: [{ answer: "room-101", count: 1 }],
    });
  });
});
