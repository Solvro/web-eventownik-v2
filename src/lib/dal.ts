//DATA ACCESS LAYER
import { cache } from "react";
import "server-only";

import type { Admin } from "@/types/auth";

import { API_URL } from "./api";
import { verifySession } from "./session";

export const getUser = cache(async () => {
  const session = await verifySession();
  if (session == null) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch user", response);
      return null;
    }
    const user = (await response.json()) as Admin;

    return user;
  } catch (error) {
    console.error("Failed to fetch user", error);
    return null;
  }
});
