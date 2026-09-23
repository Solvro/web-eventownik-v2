import { cleanup, screen } from "@testing-library/react";
import { format } from "date-fns";
import { describe, expect, it } from "vitest";

import {
  numberCaseData,
  stringLikeDataTestCases,
  textCaseData,
} from "./mocks/test-cases-data";
import { renderTable } from "./utils";

/**
 * For now every value is treated as string and the order used for comparison is alphanumeric (punctuation and symbols < numbers < uppercase letters < lowercase letters)
 * So testing sorting for each attribute type is redundant for now
 * But maybe it will be useful in the future, maybe...
 */

interface ParticipantForSortingTest {
  createdAt: string;
  attributes: {
    value?: string | string[] | number | Date | null | undefined;
  }[];
}

function getDisplayedAttributeValue(
  participant: ParticipantForSortingTest,
  attributeType?: string,
) {
  const value = participant.attributes[0]?.value;

  if (value == null) {
    return "";
  }

  if (Array.isArray(value)) {
    return attributeType === "multiselect" ? value.join(", ") : value.join(",");
  }

  if (attributeType === "date") {
    return format(new Date(value), "dd-MM-yyyy");
  }

  if (attributeType === "multiselect") {
    return typeof value === "string" ? value.split(",").join(", ") : "";
  }

  return String(value);
}

function getCreatedAtSortedOrder(
  participants: ParticipantForSortingTest[],
  attributeType?: string,
) {
  return participants
    .toSorted((left, right) => {
      return (
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      );
    })
    .map((participant) => {
      return getDisplayedAttributeValue(participant, attributeType);
    });
}

describe("Sorting", () => {
  // In current implementation first 4 columns are fixed:
  // Select checkbox | No. | Registration date | Email
  const TESTED_COLUMN_INDEX = 4;

  afterEach(() => {
    cleanup();
  });

  // Default view starts at createdAt asc, then the column cycles asc -> desc -> none.
  it.each([...stringLikeDataTestCases])(
    "should correctly cycle through each sorting state when sorting by $attributeType type",
    async ({ participants, attributes, attributeType }) => {
      // NOTE: Default view sorting is handled in the `getParticipants` server action - we enforce it here in the tests
      const initialParticipants = participants.toSorted(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      const { user, getDisplayedValuesFromColumn } = renderTable(
        initialParticipants,
        attributes,
      );

      const getSortHeader = () =>
        screen.getByRole("button", {
          name: attributes[0].name,
        });

      const initialOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      await user.click(getSortHeader());
      const ascendingOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      await user.click(getSortHeader());
      const descendingOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      await user.click(getSortHeader());
      const finalOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      expect(initialOrder).toEqual(
        getCreatedAtSortedOrder(participants, attributeType),
      );
      expect(descendingOrder).not.toEqual(ascendingOrder);
      expect(finalOrder).toEqual(
        initialParticipants.map((participant) => {
          return getDisplayedAttributeValue(participant, attributeType);
        }),
      );
    },
  );

  it("should reset any sorting", async () => {
    const { participants, attributes, attributeType } = numberCaseData;
    const initialParticipants = participants.toSorted(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const { user, getDisplayedValuesFromColumn, resetSortingButton } =
      renderTable(initialParticipants, attributes);

    const sortHeader = screen.getByRole("button", {
      name: attributes[0].name,
    });

    // Step 1: Capture initial order
    const initialOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

    // Step 2: Click to sort ascending
    await user.click(sortHeader);
    const ascendingOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

    // Step 3: Click to reset sorting
    await user.click(resetSortingButton);
    const finalOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

    expect(initialOrder).toEqual(
      getCreatedAtSortedOrder(participants, attributeType),
    );
    expect(ascendingOrder).not.toEqual(initialOrder);
    expect(finalOrder).toEqual(
      initialParticipants.map((participant) => {
        return getDisplayedAttributeValue(participant, attributeType);
      }),
    );
  });

  // TODO: This only checks if the headers indicate a sorting state rather than checking displayed data
  it("should properly apply multisort", async () => {
    const { participants, attributes } = textCaseData;
    const { user } = renderTable(participants, attributes);

    const getTextSortHeader = () =>
      screen.getByRole("columnheader", {
        name: attributes[0].name,
      });
    const getTextSortHeaderButton = () =>
      screen.getByRole("button", {
        name: attributes[0].name,
      });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getEmailSortHeader = () =>
      screen.getByRole("columnheader", {
        name: "Email",
      });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getEmailSortHeaderButton = () =>
      screen.getByRole("button", {
        name: "Email",
      });

    expect(getTextSortHeader().getAttribute("aria-sort")).toBe("none");
    expect(getEmailSortHeader().getAttribute("aria-sort")).toBe("none");

    await user.click(getTextSortHeaderButton());
    expect(getTextSortHeader().getAttribute("aria-sort")).toBe("ascending");

    await user.keyboard("{Shift>}");
    await user.click(getEmailSortHeaderButton());
    await user.keyboard("{/Shift}");
    expect(getTextSortHeader().getAttribute("aria-sort")).toBe("ascending");
    expect(getEmailSortHeader().getAttribute("aria-sort")).toBe("ascending");

    await user.click(getTextSortHeaderButton());
    expect(getTextSortHeader().getAttribute("aria-sort")).toBe("descending");
    expect(getEmailSortHeader().getAttribute("aria-sort")).toBe("none");
  });
});
