import { render, screen } from "@testing-library/react";
import type { ByRoleMatcher, ByRoleOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import { WysiwygEditor } from "@/components/editor";

interface WysiwygEditorProps
  extends Partial<React.ComponentProps<typeof WysiwygEditor>> {
  onChange?: Mock;
}

const DEFAULT_PHRASE = "Lorem ipsum";

describe("Wysiwyg Editor", () => {
  beforeAll(() => {
    Range.prototype.getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });

    Range.prototype.getClientRects = () => ({
      item: () => null,
      length: 0,
      [Symbol.iterator]: vi.fn(),
    });

    Document.prototype.elementFromPoint = vi.fn();
  });

  const renderComponent = (props?: WysiwygEditorProps) => {
    render(
      <WysiwygEditor
        onChange={props?.onChange ?? vi.fn()}
        content={props?.content ?? ""}
        disabled={props?.disabled ?? false}
      />,
    );
    const user = userEvent.setup();

    return {
      input: screen.getByRole("textbox"),
      insertText: async (text: string) => {
        await user.type(screen.getByRole("textbox"), text);
      },
      getFirstParagraph: () => screen.getByRole("paragraph"),
      getAllParagraphs: () => screen.getAllByRole("paragraph"),
      menu: {
        bold: screen.getByRole("button", { name: /pogrubienie/i }),
        italics: screen.getByRole("button", { name: /kursywa/i }),
        mono: screen.getByRole("button", { name: /mono/i }),
        headingOne: screen.getByRole("button", { name: /pierwszego/i }),
        headingTwo: screen.getByRole("button", { name: /drugiego/i }),
        headingThree: screen.getByRole("button", { name: /trzeciego/i }),
        alignLeft: screen.getByRole("button", { name: /lewej/i }),
        alignCenter: screen.getByRole("button", { name: /środka/i }),
        alignRight: screen.getByRole("button", { name: /prawo/i }),
        justify: screen.getByRole("button", { name: /just/i }),
        imageButton: screen.getByRole("button", { name: /zdjęcie/i }),
        insertTag: screen.getByRole("button", { name: /znacznik/i }),
      },
      user,
    };
  };

  describe.skip("General", () => {
    it("should render the component", () => {
      const { getFirstParagraph } = renderComponent({ onChange: vi.fn() });
      expect(getFirstParagraph()).toBeInTheDocument();
    });

    it("should insert text", async () => {
      const { insertText, getFirstParagraph } = renderComponent();

      await insertText(DEFAULT_PHRASE);

      expect(getFirstParagraph()).toHaveTextContent(DEFAULT_PHRASE);
    });

    it("should allow removing text", async () => {
      const { getFirstParagraph, insertText } = renderComponent();

      // Type in a single character first, then press Backspace
      await insertText("A");
      await insertText("{backspace}");

      expect(getFirstParagraph()).toHaveTextContent("");
    });

    it("should create new lines", async () => {
      const { insertText, getAllParagraphs } = renderComponent();
      const phrases = ["Lorem ipsum", "Dolor sit amet"];

      await insertText(`${phrases[0]}{enter}${phrases[1]}`);
      const paragraphs = getAllParagraphs();

      expect(paragraphs).toHaveLength(2);
      for (const [index, phrase] of phrases.entries()) {
        expect(paragraphs[index]).toHaveTextContent(phrase);
      }
    });

    it("should block input when disabled", async () => {
      const { insertText, getFirstParagraph } = renderComponent({
        disabled: true,
      });

      await insertText("Test");

      expect(getFirstParagraph()).toHaveTextContent("");
    });

    // NOTE: Perhaps a separate suite for all parsing stuff?
    it("should render pre-defined plain text", () => {
      const { getFirstParagraph } = renderComponent({
        content: DEFAULT_PHRASE,
      });

      expect(getFirstParagraph()).toHaveTextContent(DEFAULT_PHRASE);
    });

    it("should correctly parse pre-defined html", () => {
      const html = "<p>Lorem <strong>ipsum</strong></p>";
      const { getFirstParagraph } = renderComponent({ content: html });

      expect(getFirstParagraph()).toHaveTextContent("Lorem ipsum");
      expect(screen.getByRole("strong")).toHaveTextContent("ipsum");
    });
  });

  describe.skip("Formatting (Markup)", () => {
    interface TextFormattingTestCase {
      effect: string;
      characters: string;
      spaceAfterChar?: boolean;
      double: boolean;
      element: ByRoleMatcher;
      properties?: ByRoleOptions;
    }

    // 'spaceAfterChar' property is used because in case of italics,
    // a single asterisk makes a list after putting a space after it.
    // Moreover, heading characters need to be separated by a space
    it.each([
      {
        effect: "bold",
        characters: "**",
        spaceAfterChar: false,
        double: true,
        element: "strong",
      },
      {
        effect: "italic",
        characters: "*",
        spaceAfterChar: false,
        double: true,
        element: "emphasis",
      },
      {
        effect: "monospace",
        characters: "`",
        spaceAfterChar: false,
        double: true,
        element: "code",
      },
      {
        effect: "lv1 heading",
        characters: "#",
        spaceAfterChar: true,
        double: false,
        element: "heading",
        properties: { level: 1 },
      },
      {
        effect: "lv2 heading",
        characters: "##",
        spaceAfterChar: true,
        double: false,
        element: "heading",
        properties: { level: 2 },
      },
      {
        effect: "lv3 heading",
        characters: "###",
        spaceAfterChar: true,
        double: false,
        element: "heading",
        properties: { level: 3 },
      },
    ] satisfies TextFormattingTestCase[])(
      "should make $effect text with $characters",
      async ({ characters, spaceAfterChar, double, element, properties }) => {
        const { insertText } = renderComponent();

        await insertText(
          `${characters}${spaceAfterChar ? " " : ""}${DEFAULT_PHRASE}${double ? characters : ""}`,
        );

        expect(screen.getByRole(element, properties)).toHaveTextContent(
          DEFAULT_PHRASE,
        );
      },
    );
  });

  describe("Formatting (Button menu)", () => {
    interface MenuFormattingTestCase {
      effect: string;
      button: keyof ReturnType<typeof renderComponent>["menu"];
      element: ByRoleMatcher;
      properties?: ByRoleOptions;
    }
    it.each([
      {
        effect: "bold",
        button: "bold",
        element: "strong",
      },
      {
        effect: "italic",
        button: "italics",
        element: "emphasis",
      },
      {
        effect: "monospace",
        button: "mono",
        element: "code",
      },
      {
        effect: "lv1 heading",
        button: "headingOne",
        element: "heading",
        properties: { level: 1 },
      },
      {
        effect: "lv2 heading",
        button: "headingTwo",
        element: "heading",
        properties: { level: 2 },
      },
      {
        effect: "lv3 heading",
        button: "headingThree",
        element: "heading",
        properties: { level: 3 },
      },
    ] satisfies MenuFormattingTestCase[])(
      "should make $effect text",
      async ({ button, element, properties }) => {
        const { menu, user, insertText, input } = renderComponent();

        await insertText(DEFAULT_PHRASE);
        await user.tripleClick(input);
        await user.click(menu[button]);

        expect(screen.getByRole(element, properties)).toHaveTextContent(
          DEFAULT_PHRASE,
        );
      },
    );
  });

  describe("Formatting (Text alignment)", () => {
    interface TextAlignmentTestCase {
      alignment: string;
      button: keyof ReturnType<typeof renderComponent>["menu"];
      style: Record<string, string>;
    }

    it.each([
      {
        alignment: "left",
        button: "alignLeft",
        style: {
          "text-align": "left",
        },
      },
      {
        alignment: "center",
        button: "alignCenter",
        style: {
          "text-align": "center",
        },
      },
      {
        alignment: "right",
        button: "alignRight",
        style: {
          "text-align": "right",
        },
      },
    ] satisfies TextAlignmentTestCase[])(
      "should align text to the $alignment",
      async ({ button, style }) => {
        const { menu, user, insertText, getFirstParagraph } = renderComponent();

        await insertText(DEFAULT_PHRASE);
        await user.click(menu[button]);

        expect(getFirstParagraph()).toHaveStyle(style);
      },
    );
  });
});
