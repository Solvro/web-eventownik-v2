import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";

import { API_URL } from "./lib/api";
import type { AuthErrorResponse, AuthSuccessResponse } from "./types/auth";
import { loginFormSchema } from "./types/schemas";

declare module "next-auth" {
  interface User extends AuthSuccessResponse {}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
            await loginFormSchema.parseAsync(credentials);

          const user = await fetch(`${API_URL}/auth/login`, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              email,
              password,
              rememberMe: true,
            }),
          }).then(async (response) => {
            switch (response.status) {
              case 200: {
                return response.json() as Promise<AuthSuccessResponse>;
              }
              case 400: {
                throw new CredentialsSignin("Invalid credentials");
              }
              default: {
                return response.json() as Promise<AuthErrorResponse>;
              }
            }
          });

          if ("errors" in user) {
            return null;
          }

          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
        }
        return null;
      },
    }),
  ],
});
