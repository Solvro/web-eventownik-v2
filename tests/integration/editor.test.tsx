import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WysiwygEditor } from "@/components/editor";

describe("Wysiwyg Editor", () => {
  const renderComponent = (content = "") => {
    render(<WysiwygEditor onChange={vi.fn()} content={content} />);
    const user = userEvent.setup();

    return {
      input: screen.getByRole("textbox"),
      insertText: async (text: string) => {
        await user.type(screen.getByRole("textbox"), text);
      },
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

  it("should render the component", () => {
    renderComponent();
    expect(screen.getByRole("paragraph")).toBeInTheDocument();
  });

  it("should insert text", async () => {
    const { insertText } = renderComponent();
    const phrase = "Lorem ipsum";

    await insertText("Lorem ipsum");

    expect(screen.getByRole("paragraph")).toHaveTextContent(phrase);
  });

  it("should allow removing text", async () => {
    const { insertText } = renderComponent();

    // Type in a single character first, then press Backspace
    await insertText("A");
    await insertText("{backspace}");

    expect(screen.getByRole("paragraph")).toHaveTextContent("");
  });

  it("should create new lines", async () => {
    const { insertText } = renderComponent();
    const phrases = ["Lorem ipsum", "Dolor sit amet"];

    await insertText(`${phrases[0]}{enter}${phrases[1]}`);
    const paragraphs = screen.getAllByRole("paragraph");

    expect(paragraphs).toHaveLength(2);
    for (const [index, phrase] of phrases.entries()) {
      expect(paragraphs[index]).toHaveTextContent(phrase);
    }
  });
});
