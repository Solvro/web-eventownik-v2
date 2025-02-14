"use server";

import type { z } from "zod";

import type { loginFormSchema, registerFormSchema } from "@/types/schemas";

const API_URL = process.env.EVENTOWNIK_API ?? "";

if (API_URL === "") {
  throw new Error("EVENTOWNIK_API was not set in enviroment variables!");
}

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
      return response.json() as Promise<{
        admin: {
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          active: boolean;
          createdAt: string;
          updatedAt: string;
        };
        token: string;
      }>;
    } else if (response.status === 400) {
      return response.json() as Promise<{
        errors: [
          {
            message: string;
          },
        ];
      }>;
    } else {
      return response.json() as Promise<{
        errors: [
          {
            message: string;
            field: string;
          },
        ];
      }>;
    }
  });
  return data;
}

export async function login(values: z.infer<typeof loginFormSchema>) {
  const data = await fetch(`${API_URL}/auth/login`, {
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
    return response.status === 200
      ? (response.json() as Promise<{
          admin: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            active: boolean;
            createdAt: string;
            updatedAt: string;
          };
          token: string;
        }>)
      : (response.json() as Promise<{
          errors: [
            {
              message: string;
            },
          ];
        }>);
  });
  return data;
}
