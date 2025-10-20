"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import { createSession } from "@/lib/session";
import type { AuthErrorResponse, AuthSuccessResponse } from "@/types/auth";
import type {
  loginFormSchema,
  registerFormSchema,
  resetPasswordSchema,
  sendPasswordResetTokenSchema,
} from "@/types/schemas";

export async function register(values: z.infer<typeof registerFormSchema>) {
  const data = await fetch(`${API_URL}/auth/register`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    }),
  }).then(async (response) => {
    if (response.status === 200) {
      return response.json() as Promise<AuthSuccessResponse>;
    }
    console.error("Error when registering", response);
    return response.json() as Promise<AuthErrorResponse>;
  });
  if ("token" in data) {
    try {
      await createSession({ bearerToken: data.token });
    } catch (error) {
      console.error("Error when creating session", error);
      return { errors: ["Internal server error"] };
    }
  }
  return data;
}

export async function login(values: z.infer<typeof loginFormSchema>) {
  try {
    const user = await fetch(`${API_URL}/auth/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        rememberMe: true,
      }),
    }).then(async (response) => {
      switch (response.status) {
        case 200: {
          return response.json() as Promise<AuthSuccessResponse>;
        }
        case 400: {
          return { error: "Nieprawidłowe dane logowania" };
        }
        default: {
          return { error: "Wystąpił błąd serwera. Spróbuj ponownie później" };
        }
      }
    });
    if ("error" in user) {
      return { success: false, error: user.error };
    }
    await createSession({ bearerToken: user.token });
    //return user;
  } catch (error) {
    console.error("Error during logging in", error);
    return { success: false, error: "Internal server error" };
  }
  return { success: true };
}

export async function sendPasswordResetToken(
  values: z.infer<typeof sendPasswordResetTokenSchema>,
) {
  try {
    const response = await fetch(`${API_URL}/auth/sendPasswordResetToken`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: values.email,
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    const error = (await response.json()) as { message?: string };
    return {
      success: false,
      error: error.message ?? "Nie udało się wysłać emaila resetującego hasło",
    };
  } catch (error) {
    console.error("Error sending password reset token", error);
    return {
      success: false,
      error: "Wystąpił błąd serwera. Spróbuj ponownie później",
    };
  }
}

export async function resetPassword(
  values: z.infer<typeof resetPasswordSchema>,
) {
  try {
    const response = await fetch(`${API_URL}/auth/resetPassword`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        token: values.token,
        newPassword: values.newPassword,
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    if (response.status === 401) {
      return {
        success: false,
        error: "Token jest nieprawidłowy lub wygasł",
      };
    }

    const error = (await response.json()) as { message?: string };
    return {
      success: false,
      error: error.message ?? "Nie udało się zresetować hasła",
    };
  } catch (error) {
    console.error("Error resetting password", error);
    return {
      success: false,
      error: "Wystąpił błąd serwera. Spróbuj ponownie później",
    };
  }
}
