"use server";

import { formatISO } from "date-fns";

import type { DashboardKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { generateFileFromDataUrl } from "@/lib/event";
import { verifySession } from "@/lib/session";

import type { Event } from "./state";

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
  formData.append("organizer", event.organizer ?? "");
  formData.append("contactEmail", event.contactEmail ?? "");
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
    const error = (await response.json()) as {
      message: string[] | string;
      error: string;
      statusCode: number;
    };
    const messages = Array.isArray(error.message)
      ? error.message
      : [error.message || "Unknown error"];

    console.error(
      `[saveEvent] Failed to create event: ${messages[0] ?? "Unknown error"}`,
    );
    return { errors: messages.map((message) => ({ message })) };
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
        const errorData = (await coorganizerResponse.json()) as {
          errors: { message: string }[];
        };
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
            slug: attribute.slug,
            showInList: attribute.showInList,
            options:
              (attribute.options ?? []).length > 0
                ? attribute.options
                : undefined,
            order: attribute.order,
            isSensitiveData: false,
            reason: null,
          }),
        },
      );

      if (attributeResponse.ok) {
        attributesAdded++;
      } else {
        const errorData = (await attributeResponse.json()) as {
          errors: { message: string }[];
        };
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
