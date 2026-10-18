import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import { submitParticipantForm } from "@/app/[eventSlug]/actions";
import { login, register, resetPassword } from "@/app/auth/actions";
import { updateEventEmail } from "@/app/dashboard/events/[uuid]/emails/actions";
import {
  createEventForm,
  updateEventForm,
} from "@/app/dashboard/events/[uuid]/forms/actions";
import type { Payload } from "@/app/dashboard/events/[uuid]/forms/actions";
import {
  bulkUpdateParticipantAttribute,
  deleteManyParticipants,
} from "@/app/dashboard/events/[uuid]/participants/actions";
import { API_URL } from "@/lib/api";
import {
  getDefaultFormDates,
  withResolvedFormDates,
} from "@/lib/event-form-utils";
import { saveAuthResponse } from "@/lib/session";

import { server } from "../../../tests/msw/node";

vi.mock("@/lib/session", () => ({
  verifySession: vi.fn().mockResolvedValue({ bearerToken: "test-access" }),
  saveAuthResponse: vi.fn().mockResolvedValue(null),
}));

const formUuid = "550e8400-e29b-41d4-a716-446655440000";
const fieldUuid = "550e8400-e29b-41d4-a716-446655440001";

describe("v3 server action requests", () => {
  it("sends separate opening and closing dates and definition UUIDs", async () => {
    let received: unknown;
    server.use(
      http.post(`${API_URL}/events/event/forms`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ uuid: formUuid }, { status: 201 });
      }),
    );
    const form: Payload = {
      name: "Registration",
      description: "",
      isFirstForm: true,
      isOpen: true,
      openCondition: "ON_DATE",
      openDate: new Date(2026, 9, 1),
      openTime: "10:00",
      closeDate: new Date(2026, 9, 2),
      closeTime: "18:00",
      attributes: [
        { uuid: fieldUuid, isRequired: true, isEditable: true, order: 0 },
      ],
    };
    expect(await createEventForm("event", withResolvedFormDates(form))).toEqual(
      { success: true },
    );
    expect(received).toMatchObject({
      openDate: new Date(2026, 9, 1, 10).toISOString(),
      closeDate: new Date(2026, 9, 2, 18).toISOString(),
      attributes: [{ attributeUuid: fieldUuid, isRequired: true, order: 0 }],
      isEditable: true,
    });
  });

  it("forwards browser-resolved form dates verbatim so repeated saves do not drift", async () => {
    const received: unknown[] = [];
    server.use(
      http.patch(
        `${API_URL}/events/event/forms/${formUuid}`,
        async ({ request }) => {
          received.push(await request.json());
          return HttpResponse.json({ uuid: formUuid });
        },
      ),
    );
    const openDate = "2026-11-02T11:00:00.000Z";
    const closeDate = "2026-11-03T11:00:00.000Z";
    const stored = {
      openDate: new Date(openDate),
      closeDate: new Date(closeDate),
    };
    // Simulate the edit page: reload stored values into the pickers, save, repeat.
    for (let save = 0; save < 3; save++) {
      const pickers = getDefaultFormDates(stored.openDate, stored.closeDate);
      const resolved = withResolvedFormDates({
        name: "Registration",
        description: "",
        isFirstForm: false,
        isOpen: false,
        openCondition: "ON_DATE",
        ...pickers,
        attributes: [],
      });
      await updateEventForm("event", formUuid, resolved);
      stored.openDate = new Date(resolved.openDate ?? "");
      stored.closeDate = new Date(resolved.closeDate ?? "");
    }
    expect(received).toHaveLength(3);
    for (const body of received) {
      expect(body).toMatchObject({ openDate, closeDate });
    }
  });

  it("submits typed values with the Turnstile token outside attributes", async () => {
    let received: unknown;
    server.use(
      http.get(`${API_URL}/public/events/demo/forms/${formUuid}`, () =>
        HttpResponse.json({
          uuid: formUuid,
          openCondition: "MANUAL",
          formDefinitions: [
            {
              attributeUuid: fieldUuid,
              attribute: {
                uuid: fieldUuid,
                type: "number",
                showInList: true,
                config: {},
              },
            },
          ],
        }),
      ),
      http.post(
        `${API_URL}/public/events/demo/forms/${formUuid}/submit`,
        async ({ request }) => {
          received = await request.json();
          return HttpResponse.json({ uuid: "participant" });
        },
      ),
    );
    expect(
      await submitParticipantForm({
        eventUuid: "demo",
        formUuid,
        values: {
          email: "test@example.com",
          token: "captcha",
          [fieldUuid]: "0",
        },
        files: [],
      }),
    ).toEqual({ success: true });
    expect(received).toEqual({
      email: "test@example.com",
      "cf-turnstile-response": "captcha",
      attributes: [{ attributeUuid: fieldUuid, value: 0 }],
    });
  });

  it("replaces file placeholders with uploaded tokens exactly once", async () => {
    let received: unknown;
    server.use(
      http.get(`${API_URL}/public/events/demo/forms/${formUuid}`, () =>
        HttpResponse.json({
          uuid: formUuid,
          openCondition: "MANUAL",
          formDefinitions: [],
        }),
      ),
      http.post(`${API_URL}/public/events/demo/forms/${formUuid}/files`, () =>
        HttpResponse.json({ fileToken: "uploaded-file-token" }),
      ),
      http.post(
        `${API_URL}/public/events/demo/forms/${formUuid}/submit`,
        async ({ request }) => {
          received = await request.json();
          return HttpResponse.json({});
        },
      ),
    );
    await submitParticipantForm({
      eventUuid: "demo",
      formUuid,
      values: { token: "captcha", [fieldUuid]: "placeholder" },
      files: [new File(["test"], fieldUuid, { type: "text/plain" })],
    });
    expect(received).toMatchObject({
      attributes: [{ attributeUuid: fieldUuid, value: "uploaded-file-token" }],
    });
  });

  it("accepts v3 login status and retains the refresh response", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({ access_token: "access" }, { status: 201 }),
      ),
    );
    expect(
      await login({ email: "test@example.com", password: "test-password" }),
    ).toEqual({ success: true });
    expect(saveAuthResponse).toHaveBeenCalledWith(
      expect.any(Response),
      "access",
    );
  });

  it("logs in after v3 registration returns an admin rather than a token", async () => {
    server.use(
      http.post(`${API_URL}/auth/register`, () =>
        HttpResponse.json({ uuid: "admin" }, { status: 201 }),
      ),
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({ access_token: "access" }, { status: 201 }),
      ),
    );
    expect(
      await register({
        email: "test@example.com",
        password: "test-password",
        firstName: "Test",
        lastName: "User",
      }),
    ).toEqual({ success: true });
  });

  it("uses the v3 password reset path and password field", async () => {
    let received: unknown;
    server.use(
      http.post(`${API_URL}/auth/reset-password`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ message: "Password reset" });
      }),
    );
    expect(
      await resetPassword({
        token: "reset",
        newPassword: "new-password",
        confirmPassword: "new-password",
      }),
    ).toEqual({ success: true });
    expect(received).toEqual({ token: "reset", password: "new-password" });
  });
  it("splits bulk unregister requests at the backend limit", async () => {
    const batches: string[][] = [];
    server.use(
      http.post(
        `${API_URL}/events/${formUuid}/participants/unregister-many`,
        async ({ request }) => {
          const body = (await request.json()) as {
            participantsToUnregisterIds: string[];
          };
          batches.push(body.participantsToUnregisterIds);
          return HttpResponse.json({ success: true });
        },
      ),
    );
    const participants = Array.from({ length: 501 }, (_, index) =>
      String(index),
    );
    expect(await deleteManyParticipants(formUuid, participants)).toEqual({
      success: true,
    });
    expect(batches.map((batch) => batch.length)).toEqual([500, 1]);
    expect(batches.flat()).toEqual(participants);
  });
});

describe("native email trigger edits", () => {
  it.each([
    [false, "false"],
    [0, "0"],
    [["A, B", "C"], '["A, B","C"]'],
  ])(
    "preserves expected JSON value %j when only the title changes",
    async (expectedValue, text) => {
      let received: unknown;
      server.use(
        http.get(`${API_URL}/events/event/emails/email`, () =>
          HttpResponse.json({
            trigger: "ATTRIBUTE_CHANGED",
            triggerConfig: { attributeUuid: fieldUuid, expectedValue },
          }),
        ),
        http.patch(
          `${API_URL}/events/event/emails/email`,
          async ({ request }) => {
            received = await request.json();
            return HttpResponse.json({ id: "email" });
          },
        ),
      );
      expect(
        await updateEventEmail({
          eventUuid: "event",
          mailUuid: "email",
          emailTemplate: {
            name: "Changed title",
            content: "<p>Message</p>",
            schema: null,
            trigger: "attribute_changed",
            triggerValue: fieldUuid,
            triggerValue2: text,
          },
        }),
      ).toMatchObject({ success: true });
      expect(received).toMatchObject({
        trigger: "ATTRIBUTE_CHANGED",
        triggerConfig: { attributeUuid: fieldUuid, expectedValue },
      });
    },
  );
  it("writes an edited checkbox trigger as a boolean", async () => {
    let received: unknown;
    server.use(
      http.get(`${API_URL}/events/event/emails/email`, () =>
        HttpResponse.json({
          trigger: "ATTRIBUTE_CHANGED",
          triggerConfig: { attributeUuid: fieldUuid, expectedValue: true },
        }),
      ),
      http.get(`${API_URL}/events/event/attributes/${fieldUuid}`, () =>
        HttpResponse.json({ uuid: fieldUuid, type: "checkbox" }),
      ),
      http.patch(
        `${API_URL}/events/event/emails/email`,
        async ({ request }) => {
          received = await request.json();
          return HttpResponse.json({ id: "email" });
        },
      ),
    );
    expect(
      await updateEventEmail({
        eventUuid: "event",
        mailUuid: "email",
        emailTemplate: {
          name: "Title",
          content: "<p>Message</p>",
          schema: null,
          trigger: "attribute_changed",
          triggerValue: fieldUuid,
          triggerValue2: "false",
        },
      }),
    ).toMatchObject({ success: true });
    expect(received).toMatchObject({ triggerConfig: { expectedValue: false } });
  });
});

describe("native bulk attribute updates", () => {
  it.each([
    { type: "checkbox", input: "false", expected: false },
    { type: "number", input: "0", expected: 0 },
    {
      type: "multiSelect",
      input: '["Alpha","Beta"]',
      expected: ["Alpha", "Beta"],
    },
  ])(
    "sends typed $type values for selections spanning pages",
    async ({ type, input, expected }) => {
      const ids = Array.from({ length: 105 }, () => faker.string.uuid());
      const requests: unknown[] = [];
      server.use(
        http.get(`${API_URL}/events/${formUuid}/attributes`, () =>
          HttpResponse.json({
            data: [{ uuid: fieldUuid, type }],
            meta: { hasNextPage: false },
          }),
        ),
        http.patch(
          `${API_URL}/events/${formUuid}/participants/attributes/${fieldUuid}/bulk-update`,
          async ({ request }) => {
            requests.push(await request.json());
            return new HttpResponse(null, { status: 204 });
          },
        ),
      );
      expect(
        await bulkUpdateParticipantAttribute(formUuid, ids, fieldUuid, input),
      ).toEqual({ failedCount: 0 });
      expect(requests).toEqual([{ participantIds: ids, newValue: expected }]);
    },
  );

  it("batches at 500 and reports failed batches without dropping the remainder", async () => {
    const ids = Array.from({ length: 501 }, () => faker.string.uuid());
    const requests: { participantIds: string[] }[] = [];
    server.use(
      http.get(`${API_URL}/events/${formUuid}/attributes`, () =>
        HttpResponse.json({
          data: [{ uuid: fieldUuid, type: "number" }],
          meta: { hasNextPage: false },
        }),
      ),
      http.patch(
        `${API_URL}/events/${formUuid}/participants/attributes/${fieldUuid}/bulk-update`,
        async ({ request }) => {
          requests.push((await request.json()) as { participantIds: string[] });
          return new HttpResponse(null, {
            status: requests.length === 1 ? 500 : 204,
          });
        },
      ),
    );
    expect(
      await bulkUpdateParticipantAttribute(formUuid, ids, fieldUuid, "0"),
    ).toEqual({ failedCount: 500 });
    expect(requests.map((request) => request.participantIds)).toEqual([
      ids.slice(0, 500),
      ids.slice(500),
    ]);
  });
});
