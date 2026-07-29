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

      const sortHeader = screen.getByRole("button", {
        name: attributes[0].name,
      });

      // Step 1: Capture initial order
      const initialOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      // Step 2: Click to sort ascending
      await user.click(sortHeader);
      const ascendingOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      // Step 3: Click to sort descending
      await user.click(sortHeader);
      const descendingOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      // Step 4: Click to return to no sorting
      await user.click(sortHeader);
      const finalOrder = getDisplayedValuesFromColumn(TESTED_COLUMN_INDEX);

      // These assertions highly depend on test data so it's important to keep the data robust
      expect(ascendingOrder).not.toEqual(initialOrder); // Something changed
      expect(descendingOrder).not.toEqual(initialOrder); // Still different from initial
      expect(descendingOrder).not.toEqual(ascendingOrder); // Different from first sort
      expect(finalOrder).toEqual(initialOrder); // Back to original
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

    const textSortHeader = screen.getByRole("columnheader", {
      name: attributes[0].name,
    });
    const textSortHeaderButton = screen.getByRole("button", {
      name: attributes[0].name,
    });

    const emailSortHeader = screen.getByRole("columnheader", {
      name: "Email",
    });

    const emailSortHeaderButton = screen.getByRole("button", {
      name: "Email",
    });

    //Step 1: No columns are sorted
    expect(textSortHeader).toHaveAttribute("aria-sort");
    expect(textSortHeader.getAttribute("aria-sort")).toBe("none");
    expect(emailSortHeader).toHaveAttribute("aria-sort");
    expect(emailSortHeader.getAttribute("aria-sort")).toBe("none");

    //Step 2: Sort only text column
    await user.click(textSortHeaderButton);
    expect(textSortHeader.getAttribute("aria-sort")).toBe("ascending");

    //Step 3: Press and hold Shift and click email column (multisort)
    await user.keyboard("{Shift>}");
    await user.click(emailSortHeaderButton);
    expect(textSortHeader.getAttribute("aria-sort")).toBe("ascending");
    expect(emailSortHeader.getAttribute("aria-sort")).toBe("ascending");

    //Step 4: Release Shift and click email column - only text column should be sorted
    await user.keyboard("{/Shift}");
    await user.click(textSortHeaderButton);
    expect(emailSortHeader.getAttribute("aria-sort")).toBe("none");
    expect(textSortHeader.getAttribute("aria-sort")).toBe("descending");
  });
});
