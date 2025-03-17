import type { RefObject } from "react";

import type { Event } from "@/types/event";

export interface TabProps {
  event: Event;
  setEvent: (event: Event) => void;
  saveFormRef: RefObject<() => Promise<boolean>>;
}
