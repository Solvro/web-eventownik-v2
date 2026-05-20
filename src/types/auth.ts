import type { JWTPayload } from "jose";

export interface AuthSuccessResponse {
  access_token: string;
  refresh_token: string;
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
