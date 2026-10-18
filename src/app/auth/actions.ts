"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import { saveAuthResponse } from "@/lib/session";
import type {
  loginFormSchema,
  registerFormSchema,
  resetPasswordSchema,
  sendPasswordResetTokenSchema,
} from "@/types/schemas";

export async function register(values: z.infer<typeof registerFormSchema>) {
  const response = await fetch(`${API_URL}/auth/register`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    }),
  });
  if (!response.ok) {
    return { errors: [{ message: "Registration failed" }] };
  }
  const result = await login(values);
  return result.success
    ? { success: true }
    : { errors: [{ message: result.error }] };
}

export async function login(values: z.infer<typeof loginFormSchema>) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ email: values.email, password: values.password }),
    });
    if (!response.ok) {
      return {
        success: false,
        error:
          response.status === 401
            ? "invalidLoginCredentials"
            : "serverErrorTryLater",
      };
    }
    const user = (await response.json()) as { access_token: string };
    await saveAuthResponse(response, user.access_token);
    return { success: true };
  } catch {
    return { success: false, error: "serverErrorTryLater" };
  }
}

export async function sendPasswordResetToken(
  values: z.infer<typeof sendPasswordResetTokenSchema>,
) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
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
      error: error.message ?? "sendResetEmailFailed",
    };
  } catch (error) {
    console.error("Error sending password reset token", error);
    return {
      success: false,
      error: "serverErrorTryLater",
    };
  }
}

export async function resetPassword(
  values: z.infer<typeof resetPasswordSchema>,
) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        token: values.token,
        password: values.newPassword,
      }),
    });

    if (response.ok) {
      return { success: true };
    }

    if (response.status === 400 || response.status === 401) {
      return {
        success: false,
        error: "tokenInvalidOrExpired",
      };
    }

    const error = (await response.json()) as { message?: string };
    return {
      success: false,
      error: error.message ?? "passwordResetFailed",
    };
  } catch (error) {
    console.error("Error resetting password", error);
    return {
      success: false,
      error: "serverErrorTryLater",
    };
  }
}
