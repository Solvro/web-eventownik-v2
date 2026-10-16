import { describe, expect, it } from "vitest";

import { photoUrl } from "../api";
import { attributePayload, attributeValue, emailPayload } from "../api-v3";

describe("v3 write contracts", () => {
  it("preserves public block config and resolves new attribute references", () => {
    expect(
      attributePayload(
        {
          type: "block",
          options: ["temporary-text"],
          isMultiple: true,
          maxSelections: 2,
          config: { custom: true },
        },
        new Map([["temporary-text", "saved-text"]]),
      ).config,
    ).toEqual({
      participantFields: ["saved-text"],
      maxSelections: 2,
      custom: true,
    });
  });
  it("preserves storage URLs", () => {
    expect(photoUrl("https://storage.example/photo.png")).toBe(
      "https://storage.example/photo.png",
    );
  });
  it("writes v3 attribute configuration", () => {
    expect(
      attributePayload({
        name: "Choice",
        type: "multiselect",
        options: [{ label: "Alpha", value: "a" }],
        maxSelections: 2,
      }),
    ).toMatchObject({
      type: "multiSelect",
      config: { options: ["a"], maxSelections: 2 },
    });
  });
  it.each([
    ["number", "0", 0],
    ["checkbox", "false", false],
    ["checkbox", "true", true],
    ["block", "uuid", ["uuid"]],
    ["multiSelect", '["a","b"]', ["a", "b"]],
    ["multiSelect", '["A, B","C"]', ["A, B", "C"]],
    ["text", "", null],
  ])("writes native %s values", (type, value, expected) => {
    expect(attributeValue(type, value)).toEqual(expected);
  });
  it("writes email trigger configuration and JSON editor schema", () => {
    expect(
      emailPayload({
        trigger: "form_filled",
        triggerValue: "form",
        schema: '{"content":[]}',
      }),
    ).toMatchObject({
      trigger: "FORM_FILLED",
      triggerConfig: { formUuid: "form" },
      schema: { content: [] },
    });
  });
  it("serializes editor mentions to the exact v3 email marker", () => {
    expect(
      emailPayload({
        trigger: "manual",
        triggerValue: null,
        schema: null,
        content:
          '<p>Hello <span class="mention" data-id="/participant_first_name" data-type="mention">Name</span></p>',
      }).content,
    ).toBe('<p>Hello <span data-id="/participant_first_name"></span></p>');
  });
  it("preserves attribute config without imposing a multiselect limit", () => {
    expect(
      attributePayload({
        type: "multiselect",
        options: ["a", "b"],
        config: { custom: true },
      }).config,
    ).toEqual({ custom: true, options: ["a", "b"] });
  });
});
