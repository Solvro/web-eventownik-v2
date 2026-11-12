import { CoorganizersForm } from "@/components/forms/event/coorganizers-form";
import type { CoOrganizer, Permission } from "@/types/co-organizer";

import type { CoOrganizerChange } from "../change-types";
import type { TabProps } from "./tab-props";

export function CoOrganizers({
  coOrganizers,
  setCoOrganizers,
  setCoOrganizersChanges,
}: TabProps) {
  const originalCoOrganizersMap = new Map(
    coOrganizers.map((coOrganizer, index) => [index, coOrganizer]),
  );

  const handleCoorganizersFormChange = (
    coorganizers: { id?: string; email?: string; permissions?: Permission[] }[],
  ) => {
    const updatedCoOrganizers: CoOrganizer[] = coorganizers.map(
      (formCoOrganizer, index) => {
        const original = originalCoOrganizersMap.get(index);

        return {
          id: original?.id ?? null,
          email: formCoOrganizer.email ?? "",
          permissions: formCoOrganizer.permissions ?? [],
        };
      },
    );

    setCoOrganizers(updatedCoOrganizers);
  };

  const handleAdd = (coorganizer: {
    id: string;
    email: string;
    permissions: Permission[];
  }) => {
    const newCoOrganizer: CoOrganizer = {
      id: null,
      email: coorganizer.email,
      permissions: coorganizer.permissions,
    };

    setCoOrganizersChanges((previous: CoOrganizerChange[]) => {
      const newChange: CoOrganizerChange = {
        type: "add",
        data: newCoOrganizer,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
  };

  const handleRemove = (
    index: number,
    _coorganizer: { id: string; email: string; permissions: Permission[] },
  ) => {
    const original = originalCoOrganizersMap.get(index);
    if (original == null) {
      return;
    }

    setCoOrganizersChanges((previous: CoOrganizerChange[]) => {
      const newChange: CoOrganizerChange = {
        type: "delete",
        data: original,
        timestamp: Date.now(),
      };
      return [...previous, newChange];
    });
  };

  return (
    <CoorganizersForm
      onAdd={handleAdd}
      onRemove={handleRemove}
      onChange={handleCoorganizersFormChange}
      className="max-w-lg"
    />
  );
}
