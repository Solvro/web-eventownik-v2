import type { Dispatch, RefObject, SetStateAction } from "react";

import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

export interface TabProps {
  event: Event;
  saveFormRef: RefObject<
    () => Promise<{ success: boolean; event: Event | null }>
  >;
  coOrganizers: CoOrganizer[];
  setCoOrganizers: Dispatch<SetStateAction<CoOrganizer[]>>;
  setCoOrganizersChanges: Dispatch<
    SetStateAction<{
      added: CoOrganizer[];
      updated: CoOrganizer[];
      deleted: CoOrganizer[];
    }>
  >;
}
