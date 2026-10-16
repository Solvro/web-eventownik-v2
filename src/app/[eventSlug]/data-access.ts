import { cache } from "react";

import { API_URL } from "@/lib/api";
import {
  BackendError,
  getBackend,
  getReferenceCollection,
} from "@/lib/backend";
import type { V3Form, V3PrivacyAttribute, V3PublicEvent } from "@/types/v3";

export const getPublicEvent = cache(
  async (
    slug: string,
  ): Promise<
    { data: V3PublicEvent; status?: never } | { data?: never; status: number }
  > => {
    try {
      return {
        data: await getBackend<V3PublicEvent>(
          `${API_URL}/public/events/${encodeURIComponent(slug)}`,
        ),
      };
    } catch (error) {
      return { status: error instanceof BackendError ? error.status : 503 };
    }
  },
);

export const getPublicForm = cache(
  async (
    slug: string,
    formUuid: string,
  ): Promise<
    { data: V3Form; status?: never } | { data?: never; status: number }
  > => {
    try {
      return {
        data: await getBackend<V3Form>(
          `${API_URL}/public/events/${encodeURIComponent(slug)}/forms/${encodeURIComponent(formUuid)}`,
        ),
      };
    } catch (error) {
      return { status: error instanceof BackendError ? error.status : 503 };
    }
  },
);

export const getPublicPrivacyAttributes = cache(async (slug: string) => {
  try {
    return {
      data: await getReferenceCollection<V3PrivacyAttribute>(
        `${API_URL}/public/events/${encodeURIComponent(slug)}/privacy-attributes`,
      ),
    };
  } catch (error) {
    return { status: error instanceof BackendError ? error.status : 503 };
  }
});
