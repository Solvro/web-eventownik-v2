import { expect, test } from "@playwright/test";
import path from "node:path";

import { EVENT_DATA, TemplatesPage } from "./utils";
import type { Editor } from "./utils";

test.describe.configure({ mode: "serial" });

let templatesPage: TemplatesPage;

test.beforeEach(async ({ page }) => {
  templatesPage = new TemplatesPage(page);
  await templatesPage.navigateToTemplates();
});

test.describe("General", () => {
  test("should render the page", async ({ page }) => {
    await expect(page).toHaveURL(
      `/dashboard/events/${EVENT_DATA.id.toString()}/emails`,
    );
    await expect(
      page.getByRole("heading", { name: /szablony/i }),
    ).toBeVisible();
  });

  test("should render add template button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /stwórz/i })).toBeVisible();
  });
});

test.describe("Creating templates - 1st step", () => {
  test.beforeEach(async () => {
    await templatesPage.launchDialog();
  });

  test("should show the first step", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /rodzaj/i, level: 2 }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /konfiguruj/i, level: 2 }),
    ).toBeVisible();

    await expect(page.getByRole("radiogroup")).toBeVisible();

    await expect(page.getByRole("button", { name: /dalej/i })).toBeVisible();
  });

  const noConfigTriggers = ["rejestracja", "usunięcie", "manual"];

  for (const trigger of noConfigTriggers) {
    test(`should not show configuration for '${trigger}'`, async ({ page }) => {
      await page.getByRole("radio", { name: new RegExp(trigger, "i") }).click();

      await expect(page.getByText(/nie wymaga/i)).toBeVisible();
    });
  }

  test("should show configuration for 'formularz'", async ({ page }) => {
    await page.getByRole("radio", { name: /formularz/i }).click();
    await page.getByRole("combobox", { name: /formularz/i }).click();

    // The dropdown with options
    await expect(page.getByRole("listbox")).toBeVisible();
    // The option itself
    await expect(
      page.getByRole("option", {
        name: EVENT_DATA.forms[0].name ?? "",
      }),
    ).toBeVisible();
  });

  test("should force configuration for 'formularz'", async ({ page }) => {
    await page.getByRole("radio", { name: /formularz/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();

    await expect(page.getByText(/pola/i)).toBeVisible();
  });

  test("should show configuration for 'atrybut'", async ({ page }) => {
    await page.getByRole("radio", { name: /atrybut/i }).click();
    await page.getByRole("combobox", { name: /atrybut/i }).click();

    // The dropdown with options
    await expect(page.getByRole("listbox")).toBeVisible();
    // The options themselves
    const options = await page.getByRole("option").all();
    for (const [index, option] of options.entries()) {
      await expect(option).toBeVisible();
      await expect(option).toHaveText(EVENT_DATA.attributes[index].name ?? "");
    }
  });

  test("should force configuration for 'atrybut'", async ({ page }) => {
    await page.getByRole("radio", { name: /atrybut/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();

    await expect(page.getByText(/pola/i)).toBeVisible();
  });
});

test.describe("Creating templates - 2nd step", () => {
  test.beforeEach(async ({ page }) => {
    await templatesPage.launchDialog();
    await page.getByRole("radio", { name: /manual/i }).click();
    await page.getByRole("button", { name: /dalej/i }).click();
  });

  test("should show the second step", async ({ page }) => {
    const textBoxes = await page.getByRole("textbox").all();

    await expect(page.getByLabel(/tytuł/i)).toBeVisible();
    expect(textBoxes).toHaveLength(2); // NOTE: Title and editor - should it be done differently?
    await expect(page.getByRole("button", { name: /wróć/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /zapisz/i })).toBeVisible();
  });

  test("should force entering in a title", async ({ page }) => {
    await page.getByRole("button", { name: /zapisz/i }).click();

    await expect(page.getByText(/pusty/i)).toBeVisible();
  });

  test("should create a new template", async ({ page }) => {
    const templateTitle = "New template";
    const saveButton = page.getByRole("button", { name: /zapisz/i });

    await page.getByRole("textbox").first().fill(templateTitle);
    await templatesPage.getEditor().insertText("Message content");
    await saveButton.click();

    await expect(saveButton).toBeDisabled();
    // TODO: I can't seem to verify that the confirmation toast is showing up
    // Exact method works in editor's "images" suite but doesn't work here
    // await expect(page.getByRole("status")).toHaveText(/dodano/i);
    await expect(page.getByText(templateTitle)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

// TODO: Refactor the whole creating and deleting mechanism
// This is very messy because currently all tests need to be run in this specific sequence
// otherwise there will be errors due to more than one template visible
test.describe("Deleting templates", () => {
  test("should delete template", async ({ page }) => {
    await page.getByRole("button", { name: /usuń/i }).click();
    const deleteConfirmation = page.getByRole("dialog");
    await deleteConfirmation.getByRole("button", { name: /usuń/i }).click();
  });
});

test.describe("Editor", () => {
  let editor: Editor;

  test.beforeEach(async ({ page }) => {
    await templatesPage.launchDialog();
    await page.getByRole("button", { name: /dalej/i }).click();
    editor = templatesPage.getEditor();
  });

  test("should enter text", async () => {
    await editor.insertText("Lorem ipsum");
    await expect(editor.getFirstParagraph()).toHaveText("Lorem ipsum");
  });

  test("should delete text", async () => {
    await editor.insertText("A");
    await editor.element.press("Backspace");
    await expect(editor.getFirstParagraph()).toBeEmpty();
  });

  test("should create new paragraph pressing 'Enter'", async () => {
    const phrases = ["Lorem ipsum", "Dolor sit amet"];

    await editor.insertText(phrases[0]);
    await editor.element.press("Enter");
    await editor.insertText(phrases[1]);

    const paragraphs = editor.getAllParagraphs();
    await expect(paragraphs).toHaveCount(2);

    await expect(paragraphs.nth(0)).toHaveText(phrases[0]);
    await expect(paragraphs.nth(1)).toHaveText(phrases[1]);
  });

  test("should not create new paragraph pressing 'Shift+Enter'", async () => {
    const phrases = ["Lorem ipsum", "Dolor sit amet"];

    await editor.insertText(phrases[0]);
    await editor.element.press("Shift+Enter");
    await editor.insertText(phrases[1]);

    const paragraphs = editor.getAllParagraphs();
    await expect(paragraphs).toHaveCount(1);

    await expect(paragraphs.nth(0)).toHaveText(`${phrases[0]}${phrases[1]}`);
  });

  test.describe("Formatting with Markdown", () => {
    const marks = [
      {
        effect: "bold",
        characters: "**",
        role: "strong",
      },
      {
        effect: "italic",
        characters: "*",
        role: "emphasis",
      },
      {
        effect: "monospace",
        characters: "`",
        role: "code",
      },
    ] as const;

    const nodes = [
      {
        characters: "#",
        role: "heading",
        level: 1,
      },
      {
        characters: "##",
        level: 2,
      },
      {
        characters: "###",
        level: 3,
      },
    ] as const;

    for (const { effect, characters, role } of marks) {
      test(`should make '${effect}' text with '${characters}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(`${characters}${phrase}${characters}`);

        await expect(page.getByRole(role)).toHaveText(phrase);
      });
    }

    for (const { characters, level } of nodes) {
      test(`should make level '${level.toString()}' heading with '${characters}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(`${characters} ${phrase}`);

        await expect(page.getByRole("heading", { level }).last()).toHaveText(
          phrase,
        );
      });
    }
  });

  test.describe("Formatting with Menu", () => {
    const marks = [
      {
        effect: "bold",
        button: "bold",
        role: "strong",
      },
      {
        effect: "italic",
        button: "italics",
        role: "emphasis",
      },
      {
        effect: "monospace",
        button: "mono",
        role: "code",
      },
    ] as const;

    const nodes = [
      {
        effect: "heading1",
        button: "headingOne",
        role: "heading",
        level: 1,
      },
      {
        effect: "heading2",
        button: "headingTwo",
        role: "heading",
        level: 2,
      },
      {
        effect: "heading3",
        button: "headingThree",
        role: "heading",
        level: 3,
      },
    ] as const;

    for (const { effect, button, role } of marks) {
      test(`should make '${effect}' text with when pressing '${button}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(phrase);
        await editor.selectAll();
        await editor.menu[button].click();

        await expect(page.getByRole(role)).toHaveText(phrase);
      });
    }

    for (const { button, level } of nodes) {
      test(`should make level '${level.toString()}' heading with '${button}'`, async ({
        page,
      }) => {
        const phrase = "Lorem ipsum";
        await editor.insertText(phrase);
        await editor.menu[button].click();

        await expect(page.getByRole("heading", { level }).last()).toHaveText(
          phrase,
        );
      });
    }
  });

  test.describe("Text Alignment", () => {
    const alignmentTestCases = [
      { alignment: "left", button: "alignLeft" },
      { alignment: "center", button: "alignCenter" },
      { alignment: "right", button: "alignRight" },
      { alignment: "justify", button: "justify" },
    ] as const;

    for (const { alignment, button } of alignmentTestCases) {
      test(`should set 'text-align' to '${alignment}' with '${button}'`, async () => {
        await editor.insertText("Lorem ipsum");
        await editor.menu[button].click();

        await expect(editor.getFirstParagraph()).toHaveCSS(
          "text-align",
          alignment,
        );
      });
    }
  });

  test.describe("Tags", () => {
    test("should show tags list when typing '/'", async ({ page }) => {
      await editor.insertText("/");
      await expect(page.getByRole("menu")).toBeVisible();
    });

    test("should show tags list after clicking on tags button", async ({
      page,
    }) => {
      await editor.menu.tag.click();
      await expect(editor.getFirstParagraph()).toHaveText("/");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      const buttons = await menu.getByRole("button").all();
      expect(buttons.length).toBeGreaterThan(0);
    });

    test("should show attribute tags", async ({ page }) => {
      await editor.insertText("/");
      await expect(page.getByRole("menu")).toBeVisible();
      for (const attribute of EVENT_DATA.attributes) {
        await expect(
          page.getByRole("button", { name: attribute.name }),
        ).toBeVisible();
      }
    });

    test("should filter tags - multiple results", async ({ page }) => {
      await editor.insertText("/data");
      await expect(page.getByRole("menu")).toBeVisible();
      for (const tag of [/zakończenia/i, /rozpoczęcia/i, /rejestracji/i]) {
        await expect(page.getByRole("button", { name: tag })).toBeVisible();
      }
    });

    test("should filter tags - single result", async ({ page }) => {
      await editor.insertText("/nazwa");
      await expect(page.getByRole("menu")).toBeVisible();
      await expect(page.getByRole("button", { name: /nazwa/i })).toBeVisible();
    });

    test("should filter tags - no results", async ({ page }) => {
      await editor.insertText("/loremipsum");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu).toHaveText(/brak/i);
    });

    test("should insert a tag by clicking on one", async ({ page }) => {
      await editor.insertText("/nazwa");
      const menu = page.getByRole("menu");
      const button = menu.getByRole("button", { name: /nazwa/i });
      await button.click();
      await expect(editor.getFirstParagraph()).toHaveText(/nazwa/i);
    });

    test("should insert a tag by pressing enter", async ({ page }) => {
      await editor.insertText("/nazwa");
      await page.keyboard.press("Enter");
      await expect(editor.getFirstParagraph()).toHaveText(/nazwa/i);
    });

    test("should allow navigation by keyboard", async ({ page }) => {
      await editor.insertText("/data");
      const buttons = await page.getByRole("menu").getByRole("button").all();
      const tags = await Promise.all(
        buttons.map(async (button) => {
          return button.textContent();
        }),
      );
      // Go one option down
      await page.keyboard.press("ArrowDown");
      // Press enter
      await page.keyboard.press("Enter");
      // Expect the second tag to have been inserted
      await expect(editor.getFirstParagraph()).toHaveText(tags[1] ?? "");
    });

    test("should not show tags list with space after '/'", async ({ page }) => {
      await editor.insertText("/ ");
      await expect(page.getByRole("menu")).not.toBeVisible();
    });
  });

  test.describe("Images", () => {
    test("should insert image", async () => {
      await editor.menu.imageButton.click();
      await editor.menu.imageInput.setInputFiles(
        path.join("./src/tests/e2e/emails/image.jpg"),
      );
      await expect(editor.element.getByRole("img")).toBeVisible();
    });

    test("should remove image", async ({ page }) => {
      await editor.menu.imageButton.click();
      await editor.menu.imageInput.setInputFiles(
        path.join("./src/tests/e2e/emails/image.jpg"),
      );
      await expect(editor.element.getByRole("img")).toBeVisible();
      await editor.element.click();
      // Get back to the line with the image
      await page.keyboard.press("Backspace");
      // Backspace with caret next to the image
      await page.keyboard.press("Backspace");
      await expect(editor.element.getByRole("img")).not.toBeVisible();
    });

    test("should not allow inserting non-image files", async ({ page }) => {
      await editor.menu.imageButton.click();
      await editor.menu.imageInput.setInputFiles({
        name: "file.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("This is a test"),
      });
      await expect(editor.element.getByRole("img")).not.toBeVisible();
      await expect(page.getByRole("status")).toHaveText(/nieobsługiwany/i);
    });
  });
});
