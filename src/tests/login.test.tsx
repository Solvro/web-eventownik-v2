/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "../app/auth/login/page";

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

vi.mock("../app/auth/actions", () => ({
  login: vi.fn((values: { email: string; password: string }) => {
    if (values.email === "test@test.com" && values.password === "password") {
      return { success: true };
    }
    return { success: false, error: "Nieprawidłowe dane logowania" };
  }),
}));

const toastMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

const fillAndSubmitLoginForm = async ({
  email = "test@test.com",
  password = "password",
}: {
  email?: string;
  password?: string;
}) => {
  const user = userEvent.setup();
  const emailInput = screen.getByPlaceholderText(/e-mail/i);
  const passwordInput = screen.getByPlaceholderText(/hasło/i);
  const submitButton = screen.getByRole("button", {
    name: /kontynuuj/i,
  });

  await user.type(emailInput, email);
  await user.type(passwordInput, password);
  await user.click(submitButton);
};

describe("LoginPage", () => {
  beforeEach(() => {
    toastMock.mockClear();
    cleanup();
  });

  it("renderuje formularz logowania", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/e-mail/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/hasło/i)).not.toBeNull();
    expect(screen.getByRole("button", { name: /kontynuuj/i })).not.toBeNull();
  });

  it("pokazuje błąd przy nieprawidłowych danych", async () => {
    render(<LoginPage />);
    await fillAndSubmitLoginForm({
      email: "wrong@test.com",
      password: "wrongpass",
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/coś poszło/i),
        }),
      );
    });
  });

  it("loguje przy poprawnych danych", async () => {
    render(<LoginPage />);
    await fillAndSubmitLoginForm({});

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/logowanie zakończone sukcesem/i),
        }),
      );
    });
  });
});
