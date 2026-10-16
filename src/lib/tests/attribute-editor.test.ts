import { describe, expect, it } from "vitest";

import { attributeDraft } from "@/components/forms/event/attributes/attribute-draft";
import type { V3Attribute } from "@/types/v3";

import { attributePayload } from "../api-v3";

describe("attribute editor configuration", () => {
  it("retains native configuration when changing a label", () => {
    const attribute: V3Attribute = {
      uuid: "attribute",
      eventUuid: "event",
      name: "Choice",
      type: "multiSelect",
      order: 2,
      showInList: true,
      config: {
        options: ["a", "b"],
        maxSelections: 2,
        isSensitiveData: true,
        reason: "Contact",
        custom: { enabled: true },
      },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    const draft = attributeDraft(attribute);
    const payload = attributePayload({ ...draft, name: "Updated label" });
    expect(payload).toMatchObject({
      name: "Updated label",
      type: "multiSelect",
      config: attribute.config,
    });
    expect(attribute.name).toBe("Choice");
  });
});
