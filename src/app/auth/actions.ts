"use server";

import type { z } from "zod";

import { API_URL } from "@/lib/api";
import { createSession } from "@/lib/session";
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
