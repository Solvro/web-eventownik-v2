import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import assert from "node:assert";
import { useForm } from "react-hook-form";

import type { Attribute } from "@/types/attributes";

import enMessages from "../../../../../../../messages/en.json";
import { TicketForm, TicketSchema } from "../ticket-form";
import type { TicketFormValues } from "../ticket-form";

function createTestAttribute(overrides: Partial<Attribute> = {}): Attribute {
  return {
    uuid: crypto.randomUUID(),
    name: "Attribute",
    type: "text",
    order: 0,
    showInList: true,
    config: {},
    ...overrides,
  };
}

function FormWrapper({
  defaultValues,
  attributes,
  targetAttributes,
  isEditing,
  onSubmit,
}: {
  defaultValues: TicketFormValues;
  attributes: Attribute[];
  targetAttributes: Attribute[];
  isEditing?: boolean;
  onSubmit: (data: TicketFormValues) => void;
}) {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(TicketSchema),
    defaultValues,
  });

  return (
    <TicketForm
      form={form}
      onSubmit={onSubmit}
      attributes={attributes}
      targetAttributes={targetAttributes}
      isEditing={isEditing}
      loadingText="Submitting"
      submitText="Submit"
    />
  );
}

function renderComponent({
  mode,
  attributes = [],
  targetAttributes = [],
  attributeUuid = "",
  shownAttributeUuids = [],
  isEditing,
}: {
  mode: TicketFormValues["mode"];
  attributes?: Attribute[];
  targetAttributes?: Attribute[];
  attributeUuid?: string;
  shownAttributeUuids?: string[];
  isEditing?: boolean;
}) {
  const onSubmit = vi.fn();
  const user = userEvent.setup();

  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <FormWrapper
        defaultValues={{ mode, attributeUuid, shownAttributeUuids }}
        attributes={attributes}
        targetAttributes={targetAttributes}
        isEditing={isEditing}
        onSubmit={onSubmit}
      />
    </NextIntlClientProvider>,
  );

  return {
    user,
    onSubmit,
    typeInput: screen.getByLabelText("Ticket type"),
    shownAttributesInput: screen.getByRole("button", {
      name: /Displayed attributes/,
    }),
    targetInput: screen.queryByRole("combobox", { name: "Target block" }),
    submitButton: screen.getByRole("button", { name: "Submit" }),
  };
}

describe("TicketForm", () => {
  it("should show a read-only event type without a target block field", () => {
    const { typeInput, targetInput } = renderComponent({ mode: "EVENT" });

    expect(typeInput).toHaveValue("Event");
    expect(typeInput).toBeDisabled();
    expect(targetInput).not.toBeInTheDocument();
  });

  it("should show a read-only block type with a target block field", () => {
    const { typeInput, targetInput } = renderComponent({ mode: "BLOCK" });

    expect(typeInput).toHaveValue("Block");
    expect(typeInput).toBeDisabled();
    expect(targetInput).toBeInTheDocument();
    expect(targetInput).toBeEnabled();
  });

  it("should only offer the given target block attributes", async () => {
    const available = createTestAttribute({ name: "Workshops", type: "block" });
    const taken = createTestAttribute({ name: "Lectures", type: "block" });
    const { user, targetInput } = renderComponent({
      mode: "BLOCK",
      attributes: [available, taken],
      targetAttributes: [available],
    });

    assert.ok(targetInput !== null);
    await user.click(targetInput);

    const listbox = await screen.findByRole("listbox");
    expect(
      within(listbox).getByRole("option", { name: "Workshops" }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: "Lectures" }),
    ).not.toBeInTheDocument();
  });

  it("should leave out file and drawing attributes from displayed attributes", async () => {
    const { user, shownAttributesInput } = renderComponent({
      mode: "EVENT",
      attributes: [
        createTestAttribute({ name: "Dietary needs", type: "text" }),
        createTestAttribute({ name: "Workshops", type: "block" }),
        createTestAttribute({ name: "CV", type: "file" }),
        createTestAttribute({ name: "Signature", type: "drawing" }),
      ],
    });

    await user.click(shownAttributesInput);

    const listbox = await screen.findByRole("listbox");
    expect(
      within(listbox).getByRole("option", { name: "Dietary needs" }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole("option", { name: "Workshops" }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: "CV" }),
    ).not.toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: "Signature" }),
    ).not.toBeInTheDocument();
    expect(
      within(listbox).queryByRole("option", { name: "Email" }),
    ).not.toBeInTheDocument();
  });

  it("should require a target block for block tickets", async () => {
    const { user, onSubmit, submitButton } = renderComponent({
      mode: "BLOCK",
      targetAttributes: [createTestAttribute({ type: "block" })],
    });

    await user.click(submitButton);

    expect(
      await screen.findByText("Select the block this ticket is for"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should submit an event ticket without displayed attributes", async () => {
    const { user, onSubmit, submitButton } = renderComponent({
      mode: "EVENT",
    });

    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(
      { mode: "EVENT", attributeUuid: "", shownAttributeUuids: [] },
      expect.anything(),
    );
  });

  it("should submit the selected displayed attributes and target block", async () => {
    const dietaryNeeds = createTestAttribute({ name: "Dietary needs" });
    const workshops = createTestAttribute({ name: "Workshops", type: "block" });
    const { user, onSubmit, shownAttributesInput, targetInput, submitButton } =
      renderComponent({
        mode: "BLOCK",
        attributes: [dietaryNeeds, workshops],
        targetAttributes: [workshops],
      });

    await user.click(shownAttributesInput);
    await user.click(
      within(await screen.findByRole("listbox")).getByRole("option", {
        name: "Dietary needs",
      }),
    );
    await user.keyboard("{Escape}");

    assert.ok(targetInput !== null);
    await user.click(targetInput);
    await user.click(
      within(await screen.findByRole("listbox")).getByRole("option", {
        name: "Workshops",
      }),
    );

    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(
      {
        mode: "BLOCK",
        attributeUuid: workshops.uuid,
        shownAttributeUuids: [dietaryNeeds.uuid],
      },
      expect.anything(),
    );
  });

  it("should disable the target block when editing", () => {
    const workshops = createTestAttribute({ name: "Workshops", type: "block" });
    const { targetInput } = renderComponent({
      mode: "BLOCK",
      attributes: [workshops],
      targetAttributes: [workshops],
      attributeUuid: workshops.uuid,
      isEditing: true,
    });

    expect(targetInput).toBeDisabled();
    expect(targetInput).toHaveTextContent("Workshops");
  });
});
