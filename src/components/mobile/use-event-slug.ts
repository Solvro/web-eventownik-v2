"use client";

import { useParams } from "next/navigation";

export function useEventSlug(): string {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  return eventSlug;
}
