"use server";

import { AuthError } from "next-auth";
import type { z } from "zod";

import { signIn } from "@/auth";
import { API_URL } from "@/lib/api";
import type { AuthErrorResponse, AuthSuccessResponse } from "@/types/auth";
import type { loginFormSchema, registerFormSchema } from "@/types/schemas";

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
    console.error("Error", response);
    return response.json() as Promise<AuthErrorResponse>;
  });
  return data;
}

export async function login(values: z.infer<typeof loginFormSchema>) {
  try {
    //czemu redirect wyłączony -> https://github.com/nextauthjs/next-auth/issues/10928
    await signIn("credentials", { ...values, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Nieprawidłowe dane logowania", success: false };
        }
        default: {
          return { error: "Server error", success: false };
        }
      }
    }
  }
  return { success: true };
}
