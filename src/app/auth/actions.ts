"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import { createSession } from "@/lib/session";
import type {
  Admin,
  AuthErrorResponse,
  AuthSuccessResponse,
} from "@/types/auth";
import type {
  loginFormSchema,
  registerFormSchema,
  resetPasswordSchema,
  sendPasswordResetTokenSchema,
} from "@/types/schemas";

export async function register(
  values: z.infer<typeof registerFormSchema> & { token: string },
) {
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
      token: values.token,
    }),
  }).then(async (response) => {
    if (response.status === 201) {
      return response.json() as Promise<Admin>;
    }
    console.error("Error when registering", response);
    return response.json() as Promise<AuthErrorResponse>;
  });

  return data;
}

export async function login(
  values: z.infer<typeof loginFormSchema> & { token: string },
) {
  try {
    const backendResponse = await fetch(`${API_URL}/auth/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        token: values.token,
      }),
    }).then(async (response) => {
      switch (response.status) {
        case 201: {
          const backendSetCookie = response.headers.get("set-cookie");
          const data = (await response.json()) as AuthSuccessResponse;

          return { ...data, backendSetCookie };
        }
        case 401: {
          return { error: "invalidLoginCredentials" };
        }
        default: {
          return { error: "serverErrorTryLater" };
        }
      }
    });
    if ("error" in backendResponse) {
      return { success: false, error: backendResponse.error };
    }
    await createSession(
      { bearerToken: backendResponse.access_token },
      backendResponse.backendSetCookie,
    );
  } catch (error) {
    console.error("Error during logging in", error);
    return { success: false, error: "serverErrorTryLater" };
  }
  return { success: true };
}

export async function sendPasswordResetToken(
  values: z.infer<typeof sendPasswordResetTokenSchema> & { token: string },
) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        token: values.token,
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

    if (response.status === 401) {
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
