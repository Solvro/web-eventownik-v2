"use server";

import { formatISO } from "date-fns";

import type { DashboardKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { generateFileFromDataUrl } from "@/lib/event";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

export async function isSlugTaken(slug: string) {
  const response = await fetch(`${API_URL}/events/${slug}/public`);
  return response.ok;
}

interface ErrorMessage {
  key: DashboardKey;
  values?: Record<string, string | number | Date>;
}

interface SaveEventResult {
  id?: string;
  errors?: { message: string }[];
  warnings?: string[];
}

// TODO Ai generated slop - review and refactor
function parseApiErrors(errorData: ApiErrorResponse): { message: string }[] {
  if (Array.isArray(errorData.message)) {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    return errorData.message.map((msg) => ({ message: msg }));
  }
  if (typeof errorData.message === "string") {
    return [{ message: errorData.message }];
  }
  return [{ message: errorData.error ?? "Unknown error" }];
}

export async function saveEvent(event: Event): Promise<SaveEventResult> {
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  const warnings: ErrorMessage[] = [];

  const formData = new FormData();

  formData.append("name", event.name);
  formData.append("description", event.description ?? "");
  formData.append("organizer", event.organizer ?? "");
  formData.append("contactEmail", event.contactEmail ?? "");
  formData.append("isPublic", "true"); // TODO need to add this field to the form as API docs state that this defaults to false, but still throws error when not provided
  formData.append("slug", event.slug);
  formData.append("startDate", formatISO(event.startDate));
  formData.append("endDate", formatISO(event.endDate));
  formData.append("location", event.location ?? "");
  formData.append("primaryColor", event.primaryColor);
  formData.append("participantsCount", event.participantsNumber.toString());

  const addLinkToFormData = (
    url: string,
    type: string,
    label: string,
    index: string,
  ) => {
    formData.append(`links[${index}][url]`, url);
    formData.append(`links[${index}][type]`, type);
    formData.append(`links[${index}][label]`, label);
  };

  const allLinks = [
    ...(event.termsLink == null
      ? []
      : [{ url: event.termsLink, type: "policy", label: "" }]),
    ...event.socialMediaLinks
      .filter((link) => link.url.trim())
      .map((link) => ({
        url: link.url,
        type: "general",
        label: link.label ?? "",
      })),
  ];
  for (const [index, link] of allLinks.entries()) {
    addLinkToFormData(link.url, link.type, link.label.trim(), index.toString());
  }

  if (event.photoUrl) {
    try {
      const photoFile = generateFileFromDataUrl(event.photoUrl);
      formData.append("photo", photoFile);
    } catch (error) {
      console.error("[saveEvent] Error processing photo:", error);
      return {
        errors: [
          { message: { key: "failedToProcessEventPhoto" as DashboardKey } },
        ],
      };
    }
  }

  const response = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;
    const errors = parseApiErrors(errorData);
    console.error(
      `[saveEvent] Failed to create event: ${errors[0]?.message ?? "Unknown error"}`,
    );
    return { errors };
  }

  const data = (await response.json()) as Record<"uuid", string>;

  if (!("uuid" in data)) {
    console.error("[saveEvent] No event UUID returned from server");
    return { errors: [{ message: "Failed to create event" }] };
  }

  const eventUuid = data.uuid;

  const coOrganizerErrors: ErrorMessage[] = [];
  let coOrganizersAdded = 0;

  for (const coorganizer of event.coorganizers) {
    try {
      const coorganizerResponse = await fetch(
        `${API_URL}/events/${eventUuid}/organizers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: coorganizer.email,
            permissionsIds: [1],
          }),
        },
      );

      if (coorganizerResponse.ok) {
        coOrganizersAdded++;
      } else {
        const errorData =
          (await coorganizerResponse.json()) as ApiErrorResponse;
        console.error(
          "[saveEvent] Failed to add co-organizer %s:",
          coorganizer.email,
          errorData,
        );
        coOrganizerErrors.push({
          key: "coOrganizerAddWarning",
          values: {
            email: coorganizer.email,
          },
        });
      }
    } catch (error) {
      console.error(
        "[saveEvent] Error adding co-organizer %s:",
        coorganizer.email,
        error,
      );
      coOrganizerErrors.push({
        key: "coOrganizerAddError",
        values: {
          email: coorganizer.email,
        },
      });
    }
  }

  if (coOrganizerErrors.length > 0) {
    console.warn(
      `[saveEvent] Added ${coOrganizersAdded.toString()}/${event.coorganizers.length.toString()} co-organizers`,
    );
    warnings.push(...coOrganizerErrors);
  }

  const attributeErrors: ErrorMessage[] = [];
  let attributesAdded = 0;

  for (const attribute of event.attributes) {
    try {
      const attributeResponse = await fetch(
        `${API_URL}/events/${eventUuid}/attributes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: attribute.name,
            type: attribute.type,
            showInList: attribute.showInList,
            order: attribute.order,
            config: {
              options:
                (attribute.config.options ?? []).length > 0
                  ? attribute.config.options
                  : null,
              isSensitiveData: attribute.config.isSensitiveData,
              reason: attribute.config.isSensitiveData
                ? (attribute.config.reason ?? null)
                : null,
              isMultiple: attribute.config.isMultiple ?? false,
              maxSelections: attribute.config.maxSelections ?? null,
            },
          }),
        },
      );

      if (attributeResponse.ok) {
        attributesAdded++;
      } else {
        const errorData = (await attributeResponse.json()) as ApiErrorResponse;
        console.error(
          "[saveEvent] Failed to add attribute %s:",
          attribute.name,
          errorData,
        );
        attributeErrors.push({
          key: "attributeAddWarning",
          values: { name: attribute.name },
        });
      }
    } catch (error) {
      console.error(
        "[saveEvent] Error adding attribute %s:",
        attribute.name,
        error,
      );
      attributeErrors.push({
        key: "attributeAddError",
        values: { name: attribute.name },
      });
    }
  }

  if (attributeErrors.length > 0) {
    console.warn(
      `[saveEvent] Added ${attributesAdded.toString()}/${event.attributes.length.toString()} attributes`,
    );
    warnings.push(...attributeErrors);
  }

  if (warnings.length > 0) {
    console.warn(
      `[saveEvent] Event ${eventUuid} created with ${warnings.length.toString()} warnings`,
    );
  }

  return {
    id: eventUuid,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
