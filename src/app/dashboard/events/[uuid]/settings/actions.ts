"use server";

import { revalidatePath } from "next/cache";

import type { DashboardKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { attributePayload } from "@/lib/api-v3";
import { generateFileFromDataUrl } from "@/lib/event";
import { verifySession } from "@/lib/session";
import type { V3Event } from "@/types/v3";

import type { AttributeChange, CoOrganizerChange } from "./change-types";

interface ErrorMessage {
  key: DashboardKey;
  values?: Record<string, string | number | Date>;
}

interface ErrorResponse {
  errors: { message: ErrorMessage }[];
}

interface UpdateResult {
  event?: V3Event;
  errors: {
    message: ErrorMessage;
    section: "event" | "coOrganizers" | "attributes";
  }[];
  processedChanges: {
    coOrganizers: number;
    attributes: number;
  };
}

export async function updateEvent(
  unmodifiedEvent: V3Event,
  event: V3Event,
  coOrganizersChanges: CoOrganizerChange[],
  attributesChanges: AttributeChange[],
): Promise<V3Event | ErrorResponse> {
  const session = await verifySession();
  if (session?.bearerToken == null) {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  const result: UpdateResult = {
    errors: [],
    processedChanges: {
      coOrganizers: 0,
      attributes: 0,
    },
  };

  try {
    const payload = {
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      organizerName: event.organizerName,
      slug: event.slug,
      location: event.location,
      primaryColor: event.primaryColor,
      participantsLimit: event.participantsLimit,
      isPublic: event.isPublic,
      contactEmail: event.contactEmail === "" ? null : event.contactEmail,
      links: event.links
        .filter((link) => link.url.trim() !== "")
        .map((link) => ({
          url: link.url.trim(),
          label: link.label.trim(),
          type: link.type,
        })),
      ...(event.photoUrl === null || event.photoUrl === ""
        ? { photoUrl: null }
        : {}),
    };
    if (
      event.photoUrl !== null &&
      event.photoUrl !== "" &&
      event.photoUrl !== unmodifiedEvent.photoUrl
    ) {
      const photoData = new FormData();
      photoData.append("photo", generateFileFromDataUrl(event.photoUrl));
      const upload = await fetch(`${API_URL}/events/${event.uuid}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${bearerToken}` },
        body: photoData,
      });
      if (!upload.ok) {
        return { errors: [{ message: { key: "failedToProcessEventPhoto" } }] };
      }
    }

    const response = await fetch(`${API_URL}/events/${event.uuid}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      console.error("[updateEvent] Event update failed:", {
        status: response.status,
        error: errorData,
      });
      result.errors.push({
        message: { key: "failedToUpdateEvent" },
        section: "event",
      });
      return { errors: result.errors };
    }

    result.event = (await response.json()) as V3Event;
  } catch (error) {
    console.error("[updateEvent] Network error updating event:", error);
    result.errors.push({
      message: { key: "networkErrorWhileUpdatingEvent" },
      section: "event",
    });
    return { errors: result.errors };
  }

  for (const change of coOrganizersChanges) {
    try {
      switch (change.type) {
        case "add": {
          const response = await fetch(
            `${API_URL}/events/${event.uuid}/organizers`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: change.data.email,
                permissions: ["MANAGE_ALL"],
              }),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to add co-organizer:",
              change.data,
            );
            result.errors.push({
              message: {
                key: "failedToAddCoOrganizer",
                values: {
                  email: change.data.email,
                  errorData: JSON.stringify(errorData),
                },
              },
              section: "coOrganizers",
            });
            continue;
          }
          result.processedChanges.coOrganizers++;
          break;
        }
        case "update": {
          if (change.data.id === null) {
            continue;
          }

          const response = await fetch(
            `${API_URL}/events/${event.uuid}/organizers/${change.data.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                permissions: change.data.permissions,
              }),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to update co-organizer:",
              change.data,
            );
            result.errors.push({
              message: {
                key: "failedToUpdateCoOrganizer",
                values: {
                  email: change.data.email,
                  errorData: JSON.stringify(errorData),
                },
              },
              section: "coOrganizers",
            });
            continue;
          }
          result.processedChanges.coOrganizers++;
          break;
        }
        case "delete": {
          if (change.data.id == null) {
            continue;
          }

          const response = await fetch(
            `${API_URL}/events/${event.uuid}/organizers/${change.data.id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${bearerToken}` },
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to delete co-organizer:",
              change.data,
            );
            result.errors.push({
              message: {
                key: "failedToDeleteCoOrganizer",
                values: {
                  email: change.data.email,
                  errorData: JSON.stringify(errorData),
                },
              },
              section: "coOrganizers",
            });
            continue;
          }
          result.processedChanges.coOrganizers++;
          break;
        }
      }
    } catch (error) {
      console.error(
        "[updateEvent] Error processing co-organizer change:",
        error,
      );
      result.errors.push({
        message: {
          key: "failedToProcessCoOrganizer",
          values: {
            email: change.data.email,
            errorData: error instanceof Error ? error.message : "unknownError",
          },
        },
        section: "coOrganizers",
      });
    }
  }

  const attributeReferences = new Map<string, string>();
  const orderedAttributeChanges = attributesChanges.toSorted(
    (a, b) => Number(a.data.type === "block") - Number(b.data.type === "block"),
  );
  for (const change of orderedAttributeChanges) {
    try {
      switch (change.type) {
        case "add": {
          const response = await fetch(
            `${API_URL}/events/${event.uuid}/attributes`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
              // NOTE: This payload should probably be inferred entirely from the `change.data` object,
              // so that manual changes after adding new attribute field in `attribute-item` are not required here
              body: JSON.stringify(
                attributePayload({ ...change.data }, attributeReferences),
              ),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to add attribute:",
              change.data,
            );

            if (
              change.data.isSensitiveData &&
              (change.data.reason == null || change.data.reason.trim() === "")
            ) {
              result.errors.push({
                message: {
                  key: "sensitiveAttributeMissingPurpose",
                  values: {
                    name: change.data.name,
                  },
                },
                section: "attributes",
              });
            } else {
              result.errors.push({
                message: {
                  key: "failedToAddAttribute",
                  values: {
                    name: change.data.name,
                    errorData: JSON.stringify(errorData),
                  },
                },
                section: "attributes",
              });
            }
            continue;
          }
          const created = (await response.json()) as { uuid: string };
          if (change.data.slug != null) {
            attributeReferences.set(change.data.slug, created.uuid);
          }
          result.processedChanges.attributes++;
          break;
        }
        case "update": {
          if (change.data.uuid == null) {
            continue;
          }

          const response = await fetch(
            `${API_URL}/events/${event.uuid}/attributes/${change.data.uuid}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
              // NOTE: Duplicate of the note comment above
              body: JSON.stringify(
                attributePayload({ ...change.data }, attributeReferences),
              ),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to update attribute:",
              change.data,
              errorData,
            );

            if (
              change.data.isSensitiveData &&
              (change.data.reason == null || change.data.reason.trim() === "")
            ) {
              result.errors.push({
                message: {
                  key: "sensitiveAttributeMissingPurpose",
                  values: {
                    name: change.data.name,
                  },
                },
                section: "attributes",
              });
            } else {
              result.errors.push({
                message: {
                  key: "failedToUpdateAttribute",
                  values: {
                    name: change.data.name,
                    errorData: JSON.stringify(errorData),
                  },
                },
                section: "attributes",
              });
            }
            continue;
          }
          result.processedChanges.attributes++;
          break;
        }
        case "delete": {
          if (change.data.uuid == null) {
            continue;
          }

          const response = await fetch(
            `${API_URL}/events/${event.uuid}/attributes/${change.data.uuid}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${bearerToken}` },
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to delete attribute:",
              change.data,
            );
            result.errors.push({
              message: {
                key: "failedToDeleteAttribute",
                values: {
                  name: change.data.name,
                  errorData: JSON.stringify(errorData),
                },
              },
              section: "attributes",
            });
            continue;
          }
          result.processedChanges.attributes++;
          break;
        }
      }
    } catch (error) {
      console.error("[updateEvent] Error processing attribute change:", error);
      result.errors.push({
        message: {
          key: "failedToProcessAttribute",
          values: {
            name: change.data.name,
            errorData: error instanceof Error ? error.message : "unknownError",
          },
        },
        section: "attributes",
      });
    }
  }

  revalidatePath(`/dashboard/events/${event.uuid}/settings`);

  // Return errors if any, otherwise return the updated event
  if (result.errors.length > 0) {
    return { errors: result.errors };
  }

  return result.event;
}

export async function deleteEvent(
  eventUuid: string,
): Promise<object | ErrorResponse> {
  const session = await verifySession();
  if (session?.bearerToken == null) {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  try {
    const response = await fetch(`${API_URL}/events/${eventUuid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      console.error("[deleteEvent] API Error:", {
        status: response.status,
        error: errorData,
      });
      return { errors: [{ message: { key: "networkError" } }] };
    }
  } catch (error) {
    console.error("[deleteEvent] Network Error:", error);
    return { errors: [{ message: { key: "networkError" } }] };
  }
  revalidatePath("/dashboard/events");
  return {}; // Return an empty object on success
}
