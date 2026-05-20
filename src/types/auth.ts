import type { JWTPayload } from "jose";

export interface AuthSuccessResponse {
  admin: Admin;
  token: string;
}

export interface AuthErrorResponse {
  errors: [
    {
      message: string;
      field?: string;
    },
  ];
}

export interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPayload extends JWTPayload {
  bearerToken: string;
}

export const LOGIN_ERRORS = [
  "invalidLoginCredentials",
  "serverErrorTryLater",
] as const;
export type LoginError = (typeof LOGIN_ERRORS)[number];

export const RESET_PASS_TOKEN_ERRORS = [
  "sendResetEmailFailed",
  "serverErrorTryLater",
] as const;
export type ResetPassTokenError = (typeof RESET_PASS_TOKEN_ERRORS)[number];

export const RESET_ERRORS = [
  "tokenInvalidOrExpired",
  "passwordResetFailed",
  "serverErrorTryLater",
] as const;
export type ResetError = (typeof RESET_ERRORS)[number];
