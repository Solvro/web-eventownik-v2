import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { Toaster } from "@/components/ui/toaster";

import enMessages from "../../../messages/en.json";
import { DuplicateResourceButton } from "../duplicate-resource-button";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

type DuplicateResult = Awaited<
  ReturnType<
    React.ComponentProps<typeof DuplicateResourceButton>["onDuplicate"]
  >
>;

function renderButton() {
  // Settled by the test, so it can check the toast while duplication is in progress
  const pending = Promise.withResolvers<DuplicateResult>();
  const onDuplicate = vi.fn(async () => pending.promise);

  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <Toaster />
      <DuplicateResourceButton
        resourceName="Summer Camp"
        resourceType="Event"
        onDuplicate={onDuplicate}
      />
    </NextIntlClientProvider>,
  );

  return {
    button: screen.getByRole("button", { name: /duplicate event/i }),
    onDuplicate,
    finish: (result: DuplicateResult) => {
      pending.resolve(result);
    },
    fail: (error: Error) => {
      pending.reject(error);
    },
  };
}

describe("DuplicateResourceButton", () => {
  it("shows progress right away, then the result, and refreshes the page", async () => {
    const user = userEvent.setup();
    const { button, onDuplicate, finish } = renderButton();

    await user.click(button);

    expect(onDuplicate).toHaveBeenCalledOnce();
    expect(await screen.findByText("Duplicating event…")).toBeInTheDocument();
    expect(
      screen.getByText("Copying 'Summer Camp' may take a moment"),
    ).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(refresh).not.toHaveBeenCalled();

    finish({ success: true });

    expect(
      await screen.findByText("Event has been duplicated"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Created a copy of Event 'Summer Camp'"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Duplicating event…")).not.toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("lists warnings when parts of the copy failed", async () => {
    const user = userEvent.setup();
    const { button, finish } = renderButton();

    await user.click(button);
    finish({
      success: true,
      warnings: [{ key: "formCopyWarning", values: { name: "Signup" } }],
    });

    expect(
      await screen.findByText("Event has been duplicated"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        enMessages.Dashboard.formCopyWarning.replace("{name}", "Signup"),
      ),
    ).toBeInTheDocument();
  });

  it("replaces the progress toast with an error when duplication fails", async () => {
    const user = userEvent.setup();
    const { button, fail } = renderButton();

    await user.click(button);
    expect(await screen.findByText("Duplicating event…")).toBeInTheDocument();

    fail(new Error("Network error"));

    expect(
      await screen.findByText("Failed to duplicate event!"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Duplicating event…")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Copying 'Summer Camp' may take a moment"),
    ).not.toBeInTheDocument();
    expect(refresh).toHaveBeenCalledOnce();
  });
});
