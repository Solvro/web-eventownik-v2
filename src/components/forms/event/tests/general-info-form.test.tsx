import { faker } from "@faker-js/faker";
import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import { EventGeneralInfoSchema, GeneralInfoForm } from "../general-info-form";

function TestWrapper({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<z.infer<typeof EventGeneralInfoSchema>>;
}) {
  const methods = useForm<z.infer<typeof EventGeneralInfoSchema>>({
    resolver: zodResolver(EventGeneralInfoSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      startTime: "12:00",
      endDate: new Date(),
      endTime: "14:00",
      location: "",
      organizer: "",
      contactEmail: "",
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <form
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
  defaultValues?: Partial<z.infer<typeof EventGeneralInfoSchema>>,
) {
  const user = userEvent.setup();

  render(
    <TestWrapper defaultValues={defaultValues}>
      <GeneralInfoForm />
    </TestWrapper>,
  );

  const nameInput = screen.getByRole("textbox", { name: "Nazwa" });
  const startDateButton = screen.getByRole("button", {
    name: /data i godzina rozpoczęcia/i,
  });
  const startTimeInput = screen.getByLabelText("Godzina rozpoczęcia");
  const endDateButton = screen.getByRole("button", {
    name: /data i godzina zakończenia/i,
  });
  const endTimeInput = screen.getByLabelText("Godzina zakończenia");
  const locationInput = screen.getByRole("textbox", {
    name: "Miejsce",
  });
  const organizerInput = screen.getByRole("textbox", {
    name: "Organizator",
  });
  const contactEmailInput = screen.getByRole("textbox", {
    name: "Email do kontaktu",
  });
  const submitButton = screen.getByRole("button", { name: "Submit" });

  return {
    user,
    nameInput,
    startDateButton,
    startTimeInput,
    endDateButton,
    endTimeInput,
    locationInput,
    organizerInput,
    contactEmailInput,
    submitButton,
  };
}

describe("GeneralInfoForm", () => {
  beforeAll(() => {
    vi.setSystemTime(new Date("2025-09-02T12:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render all form fields correctly", () => {
      const {
        nameInput,
        startDateButton,
        startTimeInput,
        endDateButton,
        endTimeInput,
        locationInput,
        organizerInput,
        contactEmailInput,
      } = renderComponent();

      expect(nameInput).toBeInTheDocument();
      expect(startDateButton).toBeInTheDocument();
      expect(startTimeInput).toBeInTheDocument();
      expect(endDateButton).toBeInTheDocument();
      expect(endTimeInput).toBeInTheDocument();
      expect(locationInput).toBeInTheDocument();
      expect(organizerInput).toBeInTheDocument();
      expect(contactEmailInput).toBeInTheDocument();
    });

    it("should render description label and editor", () => {
      renderComponent();
      expect(screen.getByText("Opis")).toBeInTheDocument();
    });

    it("should not show date picker popovers initially", () => {
      renderComponent();
      expect(
        screen.queryByLabelText("Kalendarz daty rozpoczęcia"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("Kalendarz daty zakończenia"),
      ).not.toBeInTheDocument();
    });

    it("should display placeholders for input fields", () => {
      renderComponent();
      expect(
        screen.getByPlaceholderText("Podaj nazwę wydarzenia"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Podaj miejsce wydarzenia"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Podaj organizatora wydarzenia"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("example@example.org"),
      ).toBeInTheDocument();
    });
  });

  describe("Date Picker Interactions", () => {
    it("should show start date picker after clicking the start date button", async () => {
      const { user, startDateButton } = renderComponent();
      await user.click(startDateButton);
      expect(
        screen.getByLabelText("Kalendarz daty rozpoczęcia"),
      ).toBeInTheDocument();
    });

    it("should show end date picker after clicking the end date button", async () => {
      const { user, endDateButton } = renderComponent();
      await user.click(endDateButton);
      expect(
        screen.getByLabelText("Kalendarz daty zakończenia"),
      ).toBeInTheDocument();
    });

    it("should disable past dates in start date picker", async () => {
      const { user, startDateButton } = renderComponent();
      await user.click(startDateButton);
      const pastDateButton = await screen.findByRole("button", {
        name: "Monday, September 1st, 2025",
      });
      expect(pastDateButton).toBeDisabled();
    });

    it("should allow selecting a future date in start date picker", async () => {
      const { user, startDateButton } = renderComponent();
      await user.click(startDateButton);
      const futureDateButton = await screen.findByRole("button", {
        name: "Wednesday, September 3rd, 2025",
      });
      expect(futureDateButton).not.toBeDisabled();
    });

    it("should disable dates before start date in end date picker", async () => {
      const { user, startDateButton, endDateButton } = renderComponent({
        startDate: new Date("2025-09-05"),
      });
      await user.click(startDateButton);
      await user.click(
        await screen.findByRole("button", {
          name: "Saturday, September 6th, 2025",
        }),
      );
      await user.click(endDateButton);
      const pastDateButton = await screen.findByRole("button", {
        name: "Thursday, September 4th, 2025",
      });
      expect(pastDateButton).toBeDisabled();
    });
  });

  describe("Input Interactions", () => {
    it("should allow entering event name", async () => {
      const { user, nameInput } = renderComponent();
      const eventName = faker.lorem.words(3);
      await user.type(nameInput, eventName);
      expect(nameInput).toHaveValue(eventName);
    });

    it("should allow entering location", async () => {
      const { user, locationInput } = renderComponent();
      const location = faker.location.city();
      await user.type(locationInput, location);
      expect(locationInput).toHaveValue(location);
    });

    it("should allow entering organizer", async () => {
      const { user, organizerInput } = renderComponent();
      const organizer = faker.person.fullName();
      await user.type(organizerInput, organizer);
      expect(organizerInput).toHaveValue(organizer);
    });

    it("should allow entering contact email", async () => {
      const { user, contactEmailInput } = renderComponent();
      const email = faker.internet.email();
      await user.type(contactEmailInput, email);
      expect(contactEmailInput).toHaveValue(email);
    });

    it("should allow entering start time", async () => {
      const { user, startTimeInput } = renderComponent();
      const time = format(faker.date.soon(), "HH:mm");
      await user.clear(startTimeInput);
      await user.type(startTimeInput, time);
      expect(startTimeInput).toHaveValue(time);
    });

    it("should allow entering end time", async () => {
      const { user, endTimeInput } = renderComponent();
      const time = format(faker.date.soon(), "HH:mm");
      await user.clear(endTimeInput);
      await user.type(endTimeInput, time);
      expect(endTimeInput).toHaveValue(time);
    });
  });

  describe("Form Initial Values", () => {
    it("should render with provided default values", () => {
      const defaultValues = {
        name: faker.lorem.words(3),
        location: faker.location.city(),
        organizer: faker.person.fullName(),
        contactEmail: faker.internet.email(),
        startDate: faker.date.soon(),
        startTime: format(faker.date.soon(), "HH:mm"),
        endDate: faker.date.future(),
        endTime: format(faker.date.soon(), "HH:mm"),
      };
      const {
        nameInput,
        locationInput,
        organizerInput,
        contactEmailInput,
        startTimeInput,
        endTimeInput,
      } = renderComponent(defaultValues);

      expect(nameInput).toHaveValue(defaultValues.name);
      expect(locationInput).toHaveValue(defaultValues.location);
      expect(organizerInput).toHaveValue(defaultValues.organizer);
      expect(contactEmailInput).toHaveValue(defaultValues.contactEmail);
      expect(startTimeInput).toHaveValue(defaultValues.startTime);
      expect(endTimeInput).toHaveValue(defaultValues.endTime);
    });
  });

  describe("Validation Errors", () => {
    it("should show error when name is empty", async () => {
      const { user, nameInput, submitButton } = renderComponent();

      await user.clear(nameInput);
      await user.click(submitButton);

      expect(
        await screen.findByText("Nazwa nie może być pusta."),
      ).toBeInTheDocument();
    });

    it("should not show error for empty email (optional field)", async () => {
      const { user, nameInput, submitButton } = renderComponent();

      await user.type(nameInput, "Test Event");
      await user.click(submitButton);

      expect(
        screen.queryByText("Nieprawidłowy adres email"),
      ).not.toBeInTheDocument();
    });

    it("should show error when end date is before start date", async () => {
      const { user, submitButton } = renderComponent({
        name: "Test Event",
        startDate: new Date("2025-09-10"),
        startTime: "14:00",
        endDate: new Date("2025-09-10"),
        endTime: "12:00",
      });

      await user.click(submitButton);

      expect(
        await screen.findByText(
          "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.",
        ),
      ).toBeInTheDocument();
    });
  });
});
