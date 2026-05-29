import { cleanup, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { stringLikeDataTestCases, textCaseData } from "./mocks/test-cases-data";
import { renderTable } from "./utils";

/**
 * For now every value is treated as string and the order used for comparison is alphanumeric (punctuation and symbols < numbers < uppercase letters < lowercase letters)
 * So testing sorting for each attribute type is redundant for now
 * But maybe it will be useful in the future, maybe...
 */

describe("Sorting", () => {
  // In current implementation first 4 columns are fixed:
  // Select checkbox | No. | Registration date | Email
  const TESTED_COLUMN_INDEX = 4;

  afterEach(() => {
    cleanup();
  });

  // Default sorting state cycle - 'none' -> 'asc' -> 'desc' -> 'none'
  it.each([...stringLikeDataTestCases])(
    "should correctly cycle through each sorting state when sorting by $attributeType type",
    async ({ participants, attributes }) => {
      const { user, getDisplayedValuesFromColumn } = renderTable(
        participants,
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

      expect(descendingOrder).not.toEqual(ascendingOrder);
      expect(finalOrder).toEqual(initialOrder);
    },
  );

  it("should reset any sorting", async () => {
    const { participants, attributes } = textCaseData;
    const { user, getDisplayedValuesFromColumn, resetSortingButton } =
      renderTable(participants, attributes);

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

    expect(ascendingOrder).not.toEqual(initialOrder);
    expect(finalOrder).toEqual(initialOrder);
  });

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
