/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toast } from "@/hooks/use-toast";

import RegisterPage from "../app/auth/register/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

let registeredEmails: string[] = [];

vi.mock("../app/auth/actions", () => ({
  register: vi.fn(
    (values: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      if (registeredEmails.includes(values.email)) {
        return { errors: ["Użytkownik już istnieje"] };
      }
      if (
        values.email === "test@test.com" &&
        values.password === "password" &&
        values.firstName === "Jan" &&
        values.lastName === "Kowalski"
      ) {
        registeredEmails.push(values.email);
        return { token: "mocked-token" };
      }
      return { errors: ["Błąd rejestracji"] };
    },
  ),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const toastMock = toast as unknown as ReturnType<typeof vi.fn>;

const fillAndSubmitForm = async ({
  email = "test@test.com",
  password = "password",
  firstName = "Jan",
  lastName = "Kowalski",
}: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}) => {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText(/e-mail/i), email);
  await user.type(screen.getByPlaceholderText(/hasło/i), password);
  await user.type(screen.getByPlaceholderText(/imię/i), firstName);
  await user.type(screen.getByPlaceholderText(/nazwisko/i), lastName);
  await user.click(screen.getByRole("button", { name: /kontynuuj/i }));
};
describe("RegisterPage", () => {
  beforeEach(() => {
    registeredEmails = [];
    toastMock.mockClear();
    cleanup();
  });

  it("renderuje formularz rejestracji", () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/e-mail/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/hasło/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/imię/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/nazwisko/i)).not.toBeNull();
    expect(screen.getByRole("button", { name: /kontynuuj/i })).not.toBeNull();
  });

  it("rejestruje przy poprawnych danych", async () => {
    render(<RegisterPage />);
    await fillAndSubmitForm({});
    await waitFor(() => {
      expect(document.body.textContent).not.toMatch(/coś poszło nie tak/i);
    });
  });

  it("nie pozwala zarejestrować dwa razy tego samego użytkownika", async () => {
    render(<RegisterPage />);
    await fillAndSubmitForm({});

    await waitFor(() => {
      expect(document.body.textContent).not.toMatch(/coś poszło nie tak/i);
    });

    cleanup();
    render(<RegisterPage />);

    await fillAndSubmitForm({});

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/coś poszło/i),
        }),
      );
    });
  });
});
