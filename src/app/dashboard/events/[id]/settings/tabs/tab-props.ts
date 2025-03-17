import type { RefObject } from "react";

import type { Event } from "@/types/event";

export interface TabProps {
  event: Event;
  saveFormRef: RefObject<
    () => Promise<{ success: boolean; event: Event | null }>
  >;
}
