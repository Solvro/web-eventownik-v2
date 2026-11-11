import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { createRef } from "react";
import type { ComponentProps } from "react";

import type { MessageTag } from "@/lib/message-tags";
import type { MessageTagCategory } from "@/lib/message-tags/categories";

import enMessages from "../../../messages/en.json";
import { TagsList } from "../tags-list";

const participantCategory: MessageTagCategory = {
  title: "Participant",
  searchBy: ["participant"],
  icon: null,
};

const attributeCategory: MessageTagCategory = {
  title: "Attribute",
  searchBy: ["attribute"],
  icon: null,
};

function createTag(value: string, category: MessageTagCategory): MessageTag {
  return {
    title: value,
    description: value,
    value: `/${value}`,
    color: "blue",
    category,
  };
}

// The ticket tag is appended after attribute tags but belongs to the "participant" category,
// so the displayed (grouped) order differs from the order of `items`.
const items: MessageTag[] = [
  createTag("participant_email", participantCategory),
  createTag("nickname", attributeCategory),
  createTag("ticket_link", participantCategory),
];

function renderTagsList() {
  const command = vi.fn();
  const ref = createRef<{ onKeyDown: (event: KeyboardEvent) => boolean }>();

  const props = {
    items,
    command,
    ref,
  } as unknown as ComponentProps<typeof TagsList>;

  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <TagsList {...props} />
    </NextIntlClientProvider>,
  );

  return { command, ref };
}

describe("TagsList", () => {
  it("displays tags grouped by category", () => {
    renderTagsList();

    const buttons = screen.getAllByRole("button");

    expect(buttons.map((button) => button.textContent)).toEqual([
      "participant_email",
      "ticket_link",
      "nickname",
    ]);
  });

  it.each(["nickname", "ticket_link", "participant_email"])(
    "inserts the clicked tag (%s) when its category is not contiguous in items",
    (title) => {
      const { command } = renderTagsList();

      fireEvent.mouseDown(screen.getByRole("button", { name: title }));

      expect(command).toHaveBeenCalledExactlyOnceWith({
        id: `/${title}`,
        label: title,
      });
    },
  );

  it("follows the displayed order when navigating with the keyboard", () => {
    const { command, ref } = renderTagsList();

    act(() => {
      ref.current?.onKeyDown(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
    });
    act(() => {
      ref.current?.onKeyDown(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(command).toHaveBeenCalledExactlyOnceWith({
      id: "/ticket_link",
      label: "ticket_link",
    });
  });
});
