import type { Dispatch, SetStateAction } from "react";

import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";

import type { AttributeChange, CoOrganizerChange } from "../change-types";

export interface TabProps {
  coOrganizers: CoOrganizer[];
  setCoOrganizers: Dispatch<SetStateAction<CoOrganizer[]>>;
  setCoOrganizersChanges: Dispatch<SetStateAction<CoOrganizerChange[]>>;
  attributes: EventAttribute[];
  setAttributes: Dispatch<SetStateAction<EventAttribute[]>>;
  setAttributesChanges: Dispatch<SetStateAction<AttributeChange[]>>;
}
