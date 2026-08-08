import { faker } from "@faker-js/faker";
import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import type { Permission } from "@/types/co-organizer";

import {
  CoorganizersForm,
  EventCoorganizersFormSchema,
  PERMISSIONS_CONFIG,
} from "../coorganizers-form";

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<z.infer<typeof EventCoorganizersFormSchema>>;
}) {
  const methods = useForm<z.infer<typeof EventCoorganizersFormSchema>>({
    resolver: zodResolver(EventCoorganizersFormSchema),
    defaultValues: {
      coorganizers: [],
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={methods.handleSubmit(() => {
          /* empty */
        })}
      >
        {children}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

function renderComponent(
  props: {
    onAdd?: () => void;
    onRemove?: () => void;
    onChange?: () => void;
  } = {},
  defaultValues?: Partial<z.infer<typeof EventCoorganizersFormSchema>>,
) {
  const user = userEvent.setup();

  render(
    <TestWrapper defaultValues={defaultValues}>
      <CoorganizersForm {...props} />
    </TestWrapper>,
  );

  const addCoorganizerInput = screen.getByPlaceholderText(
    "Wprowadź email współorganizatora",
  );
  const addCoorganizerTrigger = screen.getByLabelText(
    "Dodaj współorganizatora",
  );
  const submitButton = screen.getByRole("button", { name: "Submit" });

  return {
    user,
    addCoorganizerInput,
    addCoorganizerTrigger,
    submitButton,
  };
}

describe("CoorganizersForm", () => {
  describe("Rendering", () => {
    it("should render the title and add co-organizer input", () => {
      const { addCoorganizerInput, addCoorganizerTrigger } = renderComponent();
      expect(screen.getByText("Współorganizatorzy")).toBeInTheDocument();
      expect(addCoorganizerInput).toBeInTheDocument();
      expect(addCoorganizerTrigger).toBeInTheDocument();
      expect(addCoorganizerTrigger).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    it("should enable popover trigger when a valid email is entered", async () => {
      const { user, addCoorganizerInput, addCoorganizerTrigger } =
        renderComponent();
      await user.type(addCoorganizerInput, faker.internet.email());
      expect(addCoorganizerTrigger).not.toBeDisabled();
    });

    it("should not allow adding a duplicate email", async () => {
      const email = faker.internet.email();
      const { user, addCoorganizerInput, addCoorganizerTrigger } =
        renderComponent(
          {},
          { coorganizers: [{ id: "1", email, permissions: [] }] },
        );

      await user.type(addCoorganizerInput, email);
      expect(addCoorganizerTrigger).toBeDisabled();
    });

    it("should remove a co-organizer when remove button is clicked", async () => {
      const onRemove = vi.fn();
      const initialCoorganizers = [
        {
          id: "1",
          email: faker.internet.email(),
          permissions: [],
        },
      ];
      const { user } = renderComponent(
        { onRemove },
        { coorganizers: initialCoorganizers },
      );

      const permissionsMenuTrigger = screen.getByLabelText(
        "Open permissions menu",
      );
      await user.click(permissionsMenuTrigger);

      const removeButton = screen.getByRole("button", { name: "Usuń" });
      await user.click(removeButton);

      expect(
        screen.queryByText(initialCoorganizers[0].email),
      ).not.toBeInTheDocument();
      expect(onRemove).toHaveBeenCalledWith(0, initialCoorganizers[0]);
    });

    // Skipped: Permission toggle functionality is currently commented out in coorganizers-form.tsx
    // Re-enable this test when the feature is restored
    it.skip("should call onChange when a permission is toggled", async () => {
      const onChange = vi.fn();
      const email = faker.internet.email();
      const initialCoorganizers = [{ id: "1", email, permissions: [] }];
      const { user } = renderComponent(
        { onChange },
        { coorganizers: initialCoorganizers },
      );

      const permissionsMenuTrigger = screen.getByLabelText(
        "Open permissions menu",
      );
      await user.click(permissionsMenuTrigger);

      const permission = PERMISSIONS_CONFIG[0];
      const permissionCheckbox = screen.getByLabelText(permission.label);
      await user.click(permissionCheckbox);

      expect(onChange).toHaveBeenCalled();
      const calls = onChange.mock.calls as [
        { email: string; permissions: Permission[] }[],
      ][];
      const call = calls[0][0];
      expect(call[0].email).toBe(email);
      expect(call[0].permissions).toContainEqual(permission.permission);
    });
  });

  describe("Form Initial Values", () => {
    it("should render initial co-organizers", async () => {
      const initialCoorganizers = [
        {
          id: "1",
          email: faker.internet.email(),
          permissions: [PERMISSIONS_CONFIG[0].permission],
        },
      ];
      const { user } = renderComponent(
        {},
        { coorganizers: initialCoorganizers },
      );

      expect(
        screen.getByText(initialCoorganizers[0].email),
      ).toBeInTheDocument();
      const permissionsMenuTrigger = screen.getByLabelText(
        "Open permissions menu",
      );
      await user.click(permissionsMenuTrigger);
      expect(
        await screen.findByText(PERMISSIONS_CONFIG[0].label),
      ).toBeInTheDocument();
    });
  });

  describe("Callbacks", () => {
    it("should call onAdd with correct data", async () => {
      const onAdd = vi.fn();
      const { user, addCoorganizerInput, addCoorganizerTrigger } =
        renderComponent({ onAdd });
      const email = faker.internet.email();

      await user.type(addCoorganizerInput, email);
      await user.click(addCoorganizerTrigger); // Open the popover
      const addCoorganizerButton = screen.getByRole("button", {
        name: "Dodaj",
      });
      await user.click(addCoorganizerButton);

      expect(onAdd).toHaveBeenCalledOnce();

      const expectedPermissions = PERMISSIONS_CONFIG.map(
        (config) => config.permission,
      ).toSorted((a, b) => a.id - b.id);

      const calls = onAdd.mock.calls as [{ permissions: Permission[] }][];
      const receivedPermissions = calls[0][0].permissions.toSorted(
        (a: Permission, b: Permission) => a.id - b.id,
      );

      expect(onAdd).toHaveBeenCalledWith({
        id: "",
        email,
        permissions: expect.arrayContaining(expectedPermissions) as unknown,
      });
      expect(receivedPermissions).toEqual(expectedPermissions);
    });

    it("should call onRemove with correct data", async () => {
      const onRemove = vi.fn();
      const initialCoorganizers = [
        {
          id: "1",
          email: faker.internet.email(),
          permissions: [],
        },
      ];
      const { user } = renderComponent(
        { onRemove },
        { coorganizers: initialCoorganizers },
      );
      const permissionsMenuTrigger = screen.getByLabelText(
        "Open permissions menu",
      );
      await user.click(permissionsMenuTrigger);
      const removeButton = screen.getByRole("button", { name: "Usuń" });
      await user.click(removeButton);
      expect(onRemove).toHaveBeenCalledOnce();
      expect(onRemove).toHaveBeenCalledWith(0, initialCoorganizers[0]);
    });

    it("should call onChange when removing a co-organizer", async () => {
      const onChange = vi.fn();
      const initialCoorganizers = [
        { id: "1", email: faker.internet.email(), permissions: [] },
      ];
      const { user } = renderComponent(
        { onChange },
        { coorganizers: initialCoorganizers },
      );

      const permissionsMenuTrigger = screen.getByLabelText(
        "Open permissions menu",
      );
      await user.click(permissionsMenuTrigger);

      const removeButton = screen.getByRole("button", { name: "Usuń" });
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    // Skipped: Permission toggle functionality is currently commented out in coorganizers-form.tsx
    // Re-enable this test when the feature is restored
    it.skip("should call onChange with updated permissions on toggle", async () => {
      const onChange = vi.fn();
      const email = faker.internet.email();
      const permissionToToggle = PERMISSIONS_CONFIG[1];
      const initialCoorganizers = [
        {
          id: "1",
          email,
          permissions: [PERMISSIONS_CONFIG[0].permission],
        },
      ];
      const { user } = renderComponent(
        { onChange },
        { coorganizers: initialCoorganizers },
      );

      const permissionsMenuTrigger = screen.getByLabelText(
        "Open permissions menu",
      );
      await user.click(permissionsMenuTrigger);

      const permissionCheckbox = screen.getByLabelText(
        permissionToToggle.label,
      );
      await user.click(permissionCheckbox);

      expect(onChange).toHaveBeenCalledOnce();
      const calls = onChange.mock.calls as [{ permissions: Permission[] }[]][];
      const updatedCoorganizers = calls[0][0];
      expect(updatedCoorganizers[0].permissions).toHaveLength(2);
      expect(updatedCoorganizers[0].permissions).toContainEqual(
        permissionToToggle.permission,
      );
    });
  });
});
