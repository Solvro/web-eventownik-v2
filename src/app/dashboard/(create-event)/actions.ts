"use server";

import { formatISO } from "date-fns";

import type { DashboardKey } from "@/i18n/utils";
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
  const response = await fetch(`${API_URL}/public/events/${slug}`);
  return response.ok;
}

export interface ErrorMessage {
  key: DashboardKey;
  values?: Record<string, string | number | Date>;
}

interface SaveEventResult {
  uuid?: string;
  isSlugTaken?: boolean;
  errors?: {
    message: ErrorMessage | string;
  }[];
  warnings?: ErrorMessage[];
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
  formData.append("organizerName", event.organizer ?? "");
  if (typeof event.contactEmail === "string" && event.contactEmail !== "") {
    formData.append("contactEmail", event.contactEmail);
  }
  formData.append("slug", event.slug);
  formData.append("startDate", formatISO(event.startDate));
  formData.append("endDate", formatISO(event.endDate));
  formData.append("location", event.location ?? "");
  formData.append("primaryColor", event.primaryColor);
  formData.append("participantsLimit", event.participantsNumber.toString());
  // New events start as drafts, the organizer publishes them in the event settings
  formData.append("isPublic", "false");

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

    const rawMessages = Array.isArray(errorData.message)
      ? errorData.message
      : typeof errorData.message === "string" && errorData.message.trim() !== ""
        ? [errorData.message]
        : ["Failed to create event"];

    const errors: NonNullable<SaveEventResult["errors"]> = rawMessages.map(
      (message) => ({
        message,
      }),
    );

    console.error(
      `[saveEvent] Failed to create event: ${rawMessages[0] ?? "Unknown error"}`,
    );
    // The backend responds with 409 only when the slug is already taken. The slug step can't
    // catch every case, since drafts are hidden from the public endpoint it uses
    return { errors, isSlugTaken: response.status === 409 };
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
            permissions: ["MANAGE_ALL"],
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

  // New attributes have temporary UUIDs, which block attributes reference in `participantFields`.
  // Block attributes are created last, so the references can be replaced with the real UUIDs
  const createdAttributeUuids = new Map<string, string>();
  const attributesInCreationOrder = [
    ...event.attributes.filter((attribute) => attribute.type !== "block"),
    ...event.attributes.filter((attribute) => attribute.type === "block"),
  ];

  for (const attribute of attributesInCreationOrder) {
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
              ...(attribute.type === "block"
                ? {
                    participantFields: (
                      attribute.config.participantFields ?? []
                    ).flatMap((field) => {
                      if (field === "email") {
                        return [field];
                      }
                      const createdUuid = createdAttributeUuids.get(field);
                      return createdUuid === undefined ? [] : [createdUuid];
                    }),
                  }
                : {
                    options:
                      (attribute.config.options ?? []).length > 0
                        ? attribute.config.options
                        : null,
                  }),
              ...(attribute.type === "block" && {
                maxSelections: attribute.config.maxSelections ?? 1,
              }),
            },
          }),
        },
      );

      if (attributeResponse.ok) {
        const createdAttribute = (await attributeResponse.json()) as {
          uuid: string;
        };
        createdAttributeUuids.set(attribute.uuid, createdAttribute.uuid);
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
    uuid: eventUuid,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
