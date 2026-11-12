"use server";

import { revalidatePath } from "next/cache";

import type { DashboardKey } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import { generateFileFromDataUrl } from "@/lib/event";
import { isValidUuid } from "@/lib/is-valid-uuid";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";
import type { Event } from "@/types/event";

import type { AttributeChange, CoOrganizerChange } from "./change-types";

interface ErrorMessage {
  key: DashboardKey;
  values?: Record<string, string | number | Date>;
}

interface ErrorResponse {
  errors: { message: string | ErrorMessage }[];
}

interface BackendErrorResponse {
  message?: string | string[];
}

function getBackendErrorMessage(errorData: BackendErrorResponse) {
  const message = [errorData.message ?? []].flat().join("\n");
  return message === "" ? undefined : message;
}

interface UpdateResult {
  event?: Event;
  errors: {
    message: string | ErrorMessage;
    section: "event" | "coOrganizers" | "attributes";
  }[];
  processedChanges: {
    coOrganizers: number;
    attributes: number;
  };
}

export async function updateEvent(
  unmodifiedEvent: Event,
  unmodifiedAttributes: Attribute[],
  event: Event,
  coOrganizersChanges: CoOrganizerChange[],
  attributesChanges: AttributeChange[],
): Promise<Event | ErrorResponse> {
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

  let photoFile: File | null = null;
  if (
    event.photoUrl != null &&
    event.photoUrl !== "" &&
    event.photoUrl !== unmodifiedEvent.photoUrl
  ) {
    try {
      photoFile = generateFileFromDataUrl(event.photoUrl);
    } catch (error) {
      console.error("[updateEvent] Error processing photo:", error);
      result.errors.push({
        message: { key: "failedToProcessEventPhoto" },
        section: "event",
      });
      return { errors: result.errors };
    }
  }

  try {
    const validLinks = event.links
      .map((item) => ({
        url: item.url.trim(),
        type: item.type,
        label: (item.label ?? "").trim(),
      }))
      .filter((item) => item.url);

    // Sent as JSON, since multipart can't clear fields: `contactEmail` needs null and `links` needs []
    const response = await fetch(`${API_URL}/events/${event.uuid}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description ?? "",
        organizerName: event.organizerName ?? "",
        ...(event.slug !== unmodifiedEvent.slug && { slug: event.slug }),
        location: event.location ?? "",
        primaryColor: event.primaryColor ?? "#3672fd",
        participantsLimit: event.participantsLimit,
        contactEmail:
          event.contactEmail == null || event.contactEmail === ""
            ? null
            : event.contactEmail,
        isPublic: event.isPublic,
        links: validLinks,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as BackendErrorResponse;
      console.error("[updateEvent] Event update failed:", {
        status: response.status,
        error: errorData,
      });
      result.errors.push({
        message: getBackendErrorMessage(errorData) ?? {
          key: "failedToUpdateEvent",
        },
        section: "event",
      });
      return { errors: result.errors };
    }

    result.event = (await response.json()) as Event;

    if (photoFile !== null) {
      const formData = new FormData();
      formData.append("photo", photoFile);

      const photoResponse = await fetch(`${API_URL}/events/${event.uuid}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${bearerToken}` },
        body: formData,
      });

      if (!photoResponse.ok) {
        const errorData = (await photoResponse.json()) as BackendErrorResponse;
        console.error("[updateEvent] Event photo update failed:", {
          status: photoResponse.status,
          error: errorData,
        });
        result.errors.push({
          message: getBackendErrorMessage(errorData) ?? {
            key: "failedToProcessEventPhoto",
          },
          section: "event",
        });
        return { errors: result.errors };
      }

      result.event = (await photoResponse.json()) as Event;
    }
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
            const errorData = (await response.json()) as BackendErrorResponse;
            console.error(
              "[updateEvent] Failed to add co-organizer:",
              change.data,
              errorData,
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
                permissions: change.data.permissions.map((perm) => perm.id),
              }),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as BackendErrorResponse;
            console.error(
              "[updateEvent] Failed to update co-organizer:",
              change.data,
              errorData,
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
            const errorData = (await response.json()) as BackendErrorResponse;
            console.error(
              "[updateEvent] Failed to delete co-organizer:",
              change.data,
              errorData,
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

  // New attributes have temporary UUIDs, which block attributes can reference in `participantFields`.
  // Non-block attributes are created first, so the references can be replaced with the real UUIDs
  const createdAttributeUuids = new Map<string, string>();
  const withCreatedAttributeUuids = (
    data: AttributeChange["data"],
  ): AttributeChange["data"] =>
    data.config.participantFields == null
      ? data
      : {
          ...data,
          config: {
            ...data.config,
            participantFields: data.config.participantFields.map(
              (field) => createdAttributeUuids.get(field) ?? field,
            ),
          },
        };
  const changeOrder = (change: AttributeChange) =>
    change.type === "add" ? (change.data.type === "block" ? 1 : 0) : 2;
  const orderedAttributesChanges = attributesChanges.toSorted(
    (a, b) => changeOrder(a) - changeOrder(b),
  );

  for (const change of orderedAttributesChanges) {
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
              body: JSON.stringify(withCreatedAttributeUuids(change.data)),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as BackendErrorResponse;
            console.error(
              "[updateEvent] Failed to add attribute:",
              change.data,
            );
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
            continue;
          }
          const createdAttribute = (await response.json()) as Attribute;
          createdAttributeUuids.set(change.data.uuid, createdAttribute.uuid);
          result.processedChanges.attributes++;
          break;
        }
        case "update": {
          if (!isValidUuid(change.data.uuid)) {
            result.errors.push({
              message: {
                key: "invalidAttributeUuid",
                values: {
                  name: change.data.name,
                },
              },
              section: "attributes",
            });
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
              body: JSON.stringify(withCreatedAttributeUuids(change.data)),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as BackendErrorResponse;
            console.error(
              "[updateEvent] Failed to update attribute:",
              change.data,
              errorData,
            );
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
            continue;
          }
          result.processedChanges.attributes++;
          break;
        }
        case "delete": {
          if (
            !unmodifiedAttributes.some(
              (attribute) => attribute.uuid === change.data.uuid,
            )
          ) {
            continue;
          }

          if (!isValidUuid(change.data.uuid)) {
            result.errors.push({
              message: {
                key: "invalidAttributeUuid",
                values: {
                  name: change.data.name,
                },
              },
              section: "attributes",
            });
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
            const errorData = (await response.json()) as BackendErrorResponse;
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
      const errorData = (await response.json()) as BackendErrorResponse;
      console.error("[deleteEvent] API Error:", {
        status: response.status,
        error: errorData,
      });
      return {
        errors: [
          {
            message: getBackendErrorMessage(errorData) ?? {
              key: "failedToDeleteEvent",
            },
          },
        ],
      };
    }
  } catch (error) {
    console.error("[deleteEvent] Network Error:", error);
    return { errors: [{ message: { key: "networkError" } }] };
  }
  revalidatePath("/dashboard/events");
  return {}; // Return an empty object on success
}
