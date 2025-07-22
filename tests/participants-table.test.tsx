import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ParticipantTable } from "@/app/dashboard/events/[id]/participants/table/participants-table";
import type { Attribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

const PARTICIPANTS: Participant[] = [];
const ATTRIBUTES: Attribute[] = [];

describe("test", () => {
  it("test", () => {
    render(
      <ParticipantTable
        eventId="1"
        participants={PARTICIPANTS}
        attributes={ATTRIBUTES}
        emails={null}
        blocks={null}
      />,
    );
    expect(screen.getByText(/nie znaleziono/i)).toBeVisible();
  });
});
