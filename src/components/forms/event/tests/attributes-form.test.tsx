import { DndContext } from "@dnd-kit/core";
import { faker } from "@faker-js/faker";
import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import { AttributesForm, EventAttributesFormSchema } from "../attributes-form";
import type { NewEventAttribute } from "../attributes-form";

vi.mock("../attributes/sortable-attribute-item", () => ({
  SortableAttributeItem: ({
    attribute,
    onRemove,
    onUpdateItem,
    index,
  }: {
    attribute: NewEventAttribute;
    onRemove: () => void;
    onUpdateItem: (index: number, value: NewEventAttribute) => void;
    index: number;
  }) => (
    <div>
      <span>{attribute.name}</span>
      <button
        onClick={() => {
          onUpdateItem(index, { ...attribute, name: "Updated" });
        }}
      >
        Update
      </button>
      <button onClick={onRemove}>Remove</button>
    </div>
  ),
}));

// Mocking crypto.randomUUID
vi.stubGlobal(
  "crypto",
  Object.assign({}, globalThis.crypto, {
    randomUUID: () => {
      return faker.string.uuid();
    },
  }),
);

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<z.infer<typeof EventAttributesFormSchema>>;
}) {
  const methods = useForm<z.infer<typeof EventAttributesFormSchema>>({
    resolver: zodResolver(EventAttributesFormSchema),
    defaultValues: {
      attributes: [],
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <DndContext onDragEnd={vi.fn()}>
        <form
          noValidate
          onSubmit={methods.handleSubmit(() => {
            /* empty */
          })}
        >
          {children}
          <button type="submit">Submit</button>
        </form>
      </DndContext>
    </FormProvider>
  );
}

function renderComponent(
  props: {
    onAdd?: () => void;
    onUpdate?: () => void;
    onRemove?: () => void;
  } = {},
  defaultValues?: Partial<z.infer<typeof EventAttributesFormSchema>>,
) {
  const user = userEvent.setup();

  render(
    <TestWrapper defaultValues={defaultValues}>
      <AttributesForm {...props} />
    </TestWrapper>,
  );

  const nameInput = screen.getByPlaceholderText("Nazwa nowego atrybutu");
  const addButton = screen.getByRole("button", { name: /dodaj/i });
  const submitButton = screen.getByRole("button", { name: "Submit" });

  return {
    user,
    nameInput,
    addButton,
    submitButton,
  };
}

/**
 * Helper to create test attribute data with consistent structure
 */
function createTestAttribute(
  overrides: Partial<NewEventAttribute> = {},
): NewEventAttribute {
  return {
    name: faker.commerce.productName(),
    type: "text",
    slug: faker.lorem.slug(),
    options: [],
    showInList: true,
    order: 0,
    isSensitiveData: false,
    reason: null,
    ...overrides,
  };
}

describe("AttributesForm", () => {
  describe("Rendering", () => {
    it("should render the title, input, and add button", () => {
      const { nameInput, addButton } = renderComponent();
      expect(screen.getByText("Atrybuty")).toBeInTheDocument();
      expect(nameInput).toBeInTheDocument();
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeDisabled();
    });
  });

  describe("Form Initial Values", () => {
    it("should render initial attributes", () => {
      const initialAttributes = [createTestAttribute()];
      renderComponent({}, { attributes: initialAttributes });

      expect(screen.getByText(initialAttributes[0].name)).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should enable add button when text is entered", async () => {
      const { user, nameInput, addButton } = renderComponent();
      await user.type(nameInput, faker.commerce.productName());
      expect(addButton).not.toBeDisabled();
    });

    it("should add an attribute on Enter key press", async () => {
      const onAdd = vi.fn();
      const { user, nameInput } = renderComponent({ onAdd });
      const attributeName = faker.commerce.productName();

      await user.type(nameInput, `${attributeName}{enter}`);

      expect(screen.getByText(attributeName)).toBeInTheDocument();
      expect(nameInput).toHaveValue("");
      expect(onAdd).toHaveBeenCalled();
    });

    it("should remove an attribute when remove is clicked", async () => {
      const onRemove = vi.fn();
      const initialAttributes = [
        createTestAttribute({ name: "Attribute to remove" }),
      ];
      const { user } = renderComponent(
        { onRemove },
        { attributes: initialAttributes },
      );

      const removeButton = screen.getByRole("button", { name: "Remove" });
      await user.click(removeButton);

      expect(
        screen.queryByText(initialAttributes[0].name),
      ).not.toBeInTheDocument();
      expect(onRemove).toHaveBeenCalledWith(0, initialAttributes[0]);
    });

    it("should call onUpdate when an item is updated", async () => {
      const onUpdate = vi.fn();
      const initialAttributes = [createTestAttribute({ name: "Initial Name" })];
      const { user } = renderComponent(
        { onUpdate },
        { attributes: initialAttributes },
      );
      const updateButton = screen.getByRole("button", { name: "Update" });
      await user.click(updateButton);

      expect(onUpdate).toHaveBeenCalled();
    });
  });

  describe("Callbacks", () => {
    it("should call onAdd with correct data when add button is clicked", async () => {
      const onAdd = vi.fn();
      const { user, nameInput, addButton } = renderComponent({ onAdd });
      const attributeName = faker.commerce.productName();

      await user.type(nameInput, attributeName);
      await user.click(addButton);

      expect(onAdd).toHaveBeenCalledOnce();
      const calls = onAdd.mock.calls as [NewEventAttribute[]];
      const addedAttribute = calls[0][0];
      expect(addedAttribute.name).toBe(attributeName);
      expect(addedAttribute.type).toBe("text");
      expect(addedAttribute.order).toBe(0);
      // Also verify the input was cleared and attribute is displayed
      expect(nameInput).toHaveValue("");
      expect(screen.getByText(attributeName)).toBeInTheDocument();
    });

    it("should call onRemove with correct index and data", async () => {
      const onRemove = vi.fn();
      const initialAttributes = [createTestAttribute()];
      const { user } = renderComponent(
        { onRemove },
        { attributes: initialAttributes },
      );

      const removeButton = screen.getByRole("button", { name: "Remove" });
      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith(0, initialAttributes[0]);
    });

    it("should call onUpdate with correct index and data", async () => {
      const onUpdate = vi.fn();
      const initialAttributes = [createTestAttribute({ name: "Initial" })];
      const { user } = renderComponent(
        { onUpdate },
        { attributes: initialAttributes },
      );

      const updateButton = screen.getByRole("button", { name: "Update" });
      await user.click(updateButton);

      expect(onUpdate).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          ...initialAttributes[0],
          name: "Updated",
        }),
      );
    });
  });
});
