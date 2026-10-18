import type { Dispatch, SetStateAction } from "react";

import type { CoOrganizer } from "@/types/co-organizer";
import type { V3Attribute } from "@/types/v3";

import type { AttributeChange, CoOrganizerChange } from "../change-types";

export interface TabProps {
  coOrganizers: CoOrganizer[];
  setCoOrganizers: Dispatch<SetStateAction<CoOrganizer[]>>;
  setCoOrganizersChanges: Dispatch<SetStateAction<CoOrganizerChange[]>>;
  attributes: V3Attribute[];
  setAttributesChanges: Dispatch<SetStateAction<AttributeChange[]>>;
}
