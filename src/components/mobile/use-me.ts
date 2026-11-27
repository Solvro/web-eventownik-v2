"use client";

import { useQuery } from "@tanstack/react-query";

import { mobileApi, mobileKeys } from "@/lib/mobile/client";
import type { MobileMe } from "@/types/mobile";

export function useMobileMe(eventSlug: string) {
  return useQuery({
    queryKey: mobileKeys.me(eventSlug),
    queryFn: async () => mobileApi<MobileMe>(eventSlug, "me"),
  });
}
