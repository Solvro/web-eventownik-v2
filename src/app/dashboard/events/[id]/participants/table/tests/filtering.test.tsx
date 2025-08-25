import {
  cleanup,
  getAllByRole,
  getByRole,
  screen,
} from "@testing-library/react";
import { describe, it } from "vitest";

import {
  checkboxCaseData,
  multiselectCaseData,
  selectAndMultiselectTestCaseData,
  selectCaseData,
  textCaseData,
} from "./mocks/test-cases-data";
import { renderTable } from "./utils";

function getMenuOptions(menu: HTMLElement) {
  return getAllByRole(menu, "menuitemcheckbox");
}

function getFilterButtonPopup(header: HTMLElement) {
  return getByRole(header, "button", {
    name: /filtr/i,
  });
}

describe("Filtering", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should correctly filter rows using global filter", async () => {
    const { participants, attributes } = textCaseData;
    const { user, getDataRows } = renderTable(participants, attributes);

    const globalFilterInput = screen.getByPlaceholderText(/wyszukaj/i);

    // Step 1: All rows should be visisble at the beginning
    expect(getDataRows().length).toBe(participants.length);

    // Step 2: Enter value which is specific to only 1 row
    await user.type(globalFilterInput, participants[0].attributes[0].value);
    expect(getDataRows().length).toBe(1);

    //Step 3: Clear global filter input - all rows should be visible
    await user.clear(globalFilterInput);
    expect(getDataRows().length).toBe(participants.length);

    //Step 4: Enter value which is specific to 2 rows
    await user.type(globalFilterInput, "domain");
    expect(getDataRows().length).toBe(2);
  });

  it.each([selectCaseData, multiselectCaseData, checkboxCaseData])(
    "should correctly filter rows using header filter for $attributeType attribute",
    async ({ participants, attributes }) => {
      const { user, getDataRows } = renderTable(participants, attributes);

      // Step 1: All rows should be visisble at the beginning
      expect(getDataRows().length).toBe(participants.length);

      const headerFilter = screen.getByRole("columnheader", {
        name: attributes[0].name,
      });
      const filterButtonPopup = getFilterButtonPopup(headerFilter);

      // Step 2: Click filter popup button - popup menu should be visible
      await user.click(filterButtonPopup);
      const filterMenu = screen.getByRole("menu");
      expect(filterMenu).toBeVisible();

      // Step 3: Click first of filters - rows should be filtered
      let options = getMenuOptions(filterMenu);
      await user.click(options[0]);
      // Close menu - aria-hidden is set to true when portal is opened
      await user.keyboard("{Escape}");
      const oneFilterAppliedRows = getDataRows();
      expect(oneFilterAppliedRows.length).toBeLessThan(participants.length);

      // Step 4: Click second of filters - rows should be filtered
      await user.click(filterButtonPopup);
      options = getMenuOptions(screen.getByRole("menu"));
      // Previously checked filter should be still applied
      expect(options[0].getAttribute("aria-checked")).toBe("true");
      await user.click(options[1]);
      await user.keyboard("{Escape}");

      const twoFiltersAppliedRows = getDataRows();

      expect(twoFiltersAppliedRows.length).toBeGreaterThanOrEqual(
        oneFilterAppliedRows.length,
      );
      expect(twoFiltersAppliedRows.length).toBeLessThanOrEqual(
        participants.length,
      );

      // Step 5: Check all filters - all rows should be visible
      await user.click(filterButtonPopup);
      options = getMenuOptions(screen.getByRole("menu"));
      for (const option of options) {
        if (option.getAttribute("aria-checked") === "false") {
          await user.click(option);
        }
      }
      await user.keyboard("{Escape}");

      expect(getDataRows().length).toBe(participants.length);
    },
  );

  it.each([selectCaseData, multiselectCaseData, checkboxCaseData])(
    "should correctly filter rows by empty values using header filter for $attributeType attribute",
    async ({ participants, attributes }) => {
      // Only one row will have empty values
      const participantWithEmptyValues = { ...participants[0] };
      participantWithEmptyValues.attributes = [];
      participants = [...participants.slice(0, 2), participantWithEmptyValues];
      const numberOfRowsWithEmptyValues = 1;

      const { user, getDataRows } = renderTable(participants, attributes);

      // Step 1: All rows should be visisble at the beginning
      expect(getDataRows().length).toBe(participants.length);

      const headerFilter = screen.getByRole("columnheader", {
        name: attributes[0].name,
      });
      const filterButtonPopup = getFilterButtonPopup(headerFilter);

      // Step 2: Click filter popup button - popup menu should be visible
      await user.click(filterButtonPopup);
      const filterMenu = screen.getByRole("menu");
      expect(filterMenu).toBeVisible();

      // Step 3: Click last filter option (Empty)- rows should be filtered
      let options = getMenuOptions(filterMenu);
      const emptyOption = options.at(-1);
      if (emptyOption === undefined) {
        throw new Error("Empty option not found!");
      }
      await user.click(emptyOption);
      // Close menu - aria-hidden is set to true when portal is opened
      await user.keyboard("{Escape}");
      const rowsAfterFiltering = getDataRows();
      expect(rowsAfterFiltering.length).toBe(numberOfRowsWithEmptyValues);

      // Step 5: Check all filters - all rows should be visible
      await user.click(filterButtonPopup);
      options = getMenuOptions(screen.getByRole("menu"));
      for (const option of options) {
        if (option.getAttribute("aria-checked") === "false") {
          await user.click(option);
        }
      }
      await user.keyboard("{Escape}");

      expect(getDataRows().length).toBe(participants.length);
    },
  );

  it("should reset all column filters", async () => {
    const { participants, attributes } = selectAndMultiselectTestCaseData;
    const { user, resetFiltersButton, getDataRows } = renderTable(
      participants,
      attributes,
    );

    const filterButtonPopups = attributes.map((attribute) => {
      const header = screen.getByRole("columnheader", {
        name: attribute.name,
      });
      return getFilterButtonPopup(header);
    });

    // Step 1: Apply filters for 2 columns
    for (const filterButton of filterButtonPopups) {
      await user.click(filterButton);
      const filterMenu = screen.getByRole("menu");
      const options = getMenuOptions(filterMenu);
      await user.click(options[0]);
      await user.keyboard("{Escape}");
    }

    expect(getDataRows().length).toBeLessThan(participants.length);

    // Step 2: Reset filters - all rows should be visible
    await user.click(resetFiltersButton);
    expect(getDataRows().length).toBe(participants.length);
  });
});
