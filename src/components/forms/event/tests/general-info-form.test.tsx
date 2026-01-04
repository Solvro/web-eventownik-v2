import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GeneralInfoForm } from "./general-info";

function renderComponent() {
  render(<GeneralInfoForm goToNextStep={vi.fn()} />);
  const nameInput = screen.getByRole("textbox", { name: "Nazwa" });
  const startDateButton = screen.getByRole("button", {
    name: "Data rozpoczęcia",
  });
  const startTimeInput = screen.getByLabelText("Godzina rozpoczęcia");
  const endDateButton = screen.getByRole("button", {
    name: "Data zakończenia",
  });
  const endTimeInput = screen.getByLabelText("Godzina zakończenia");
  const locationInput = screen.getByRole("textbox", {
    name: "Miejsce (opcjonalnie)",
  });
  const descriptionInput = screen.getByRole("textbox", {
    name: "Opis",
  });
  const organizerInput = screen.getByRole("textbox", {
    name: "Organizator (opcjonalnie)",
  });
  const submitButton = screen.getByText("Dalej");
  return {
    nameInput,
    startDateButton,
    startTimeInput,
    endDateButton,
    endTimeInput,
    locationInput,
    descriptionInput,
    organizerInput,
    submitButton,
  };
}

// Set up userEvent for simulating user interactions
const user = userEvent.setup();

describe("General Info Form", () => {
  beforeAll(() => {
    // Set system time
    vi.setSystemTime(new Date("2025-09-02T12:00:00Z"));
  });
  it("should render correctly", () => {
    // Render the GeneralInfoForm component
    const {
      nameInput,
      startDateButton,
      startTimeInput,
      endDateButton,
      endTimeInput,
      locationInput,
      descriptionInput,
      organizerInput,
      submitButton,
    } = renderComponent();
    // Check if the form elements are present
    expect(nameInput).toBeInTheDocument();
    expect(startDateButton).toBeInTheDocument();
    expect(startTimeInput).toBeInTheDocument();
    expect(endDateButton).toBeInTheDocument();
    expect(endTimeInput).toBeInTheDocument();
    expect(locationInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
    expect(organizerInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    // Check if calendars are not visible initially
    expect(
      screen.queryByLabelText("Wybierz datę rozpoczęcia"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Wybierz datę zakończenia"),
    ).not.toBeInTheDocument();
  });
  it("should show date pickers after clicking the date buttons", async () => {
    const { startDateButton, endDateButton } = renderComponent();
    await user.click(startDateButton);
    expect(
      screen.getByLabelText("Wybierz datę rozpoczęcia"),
    ).toBeInTheDocument();
    await user.click(endDateButton);
    expect(
      screen.getByLabelText("Wybierz datę zakończenia"),
    ).toBeInTheDocument();
  });
  it("should throw an error if the name is empty", async () => {
    const { submitButton } = renderComponent();
    await user.click(submitButton);
    expect(screen.getByText(/nie może być pusta/i)).toBeInTheDocument();
  });
  it("should not allow to select a start date in the past", async () => {
    const { startDateButton } = renderComponent();
    await user.click(startDateButton);
    const pastDateButton = screen.getByLabelText("Monday, September 1st, 2025");
    expect(pastDateButton).toBeDisabled();
  });
  it("should not allow to select end date before the start date", async () => {
    const { startDateButton, endDateButton } = renderComponent();
    await user.click(startDateButton);
    await user.click(screen.getByLabelText("Wednesday, September 3rd, 2025"));
    await user.click(endDateButton);
    expect(
      screen.getByLabelText("Wybierz datę zakończenia"),
    ).toBeInTheDocument();
    const pastDateButton = screen.getByLabelText("Monday, September 1st, 2025");
    expect(pastDateButton).toBeDisabled();
  });
  /**
   * NOTE: test is disabled because set system time does not affect the date picker,
   * it always uses the current date. Will fix it later.
   */
  /*
  it("should throw error if the start time causes the start datetime to be in the past", async () => {
    vi.setSystemTime(new Date("2025-09-02T12:00:00Z"));
    const { nameInput, startTimeInput, submitButton } = renderComponent();
    screen.debug();
    expect(screen.getByText("August 4th, 2025")).not.toBeInTheDocument();
    await user.type(nameInput, "Test Event");
    //await user.type(startTimeInput, "09:00");
    fireEvent.change(startTimeInput, { target: { value: "09:00" } });
    expect(startTimeInput).toHaveValue("09:00");
    await user.click(submitButton);
    expect(screen.getByText(/nie może być w przeszłości/i)).toBeInTheDocument();
  });
  */
});
