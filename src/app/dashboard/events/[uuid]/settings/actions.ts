"use server";

import { revalidatePath } from "next/cache";

import type { DashboardKey } from "@/i18n/translate-or-fallback";
import { API_URL } from "@/lib/api";
import { generateFileFromDataUrl } from "@/lib/event";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

import type { AttributeChange, CoOrganizerChange } from "./change-types";

interface ErrorMessage {
  key: DashboardKey;
  values?: Record<string, string | number | Date>;
}

interface ErrorResponse {
  errors: { message: ErrorMessage }[];
}

interface UpdateResult {
  event?: Event;
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
  unmodifiedEvent: Event,
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

  try {
    const formData = new FormData();

    // Basic fields
    formData.append("name", event.name);
    formData.append("startDate", event.startDate);
    formData.append("endDate", event.endDate);
    formData.append("description", event.description ?? "");
    formData.append("organizer", event.organizer ?? "");
    if (event.slug !== unmodifiedEvent.slug) {
      formData.append("slug", event.slug);
    }
    formData.append("location", event.location ?? "");
    formData.append("primaryColor", event.primaryColor ?? "#3672fd");
    formData.append(
      "participantsCount",
      (event.participantsCount ?? 0).toString(),
    );
    formData.append("contactEmail", event.contactEmail ?? "");

    // Links
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
    const validLinks = event.links
      .map((item) => ({
        ...item,
        url: item.url.trim(),
        label: item.label.trim(),
      }))
      .filter((item) => item.url);
    if (validLinks.length > 0) {
      for (const [index, item] of validLinks.entries()) {
        addLinkToFormData(item.url, item.type, item.label, index.toString());
      }
    }

    // Handle photo upload
    if (
      event.photoUrl != null &&
      event.photoUrl !== "" &&
      event.photoUrl !== unmodifiedEvent.photoUrl
    ) {
      try {
        const photoFile = generateFileFromDataUrl(event.photoUrl);
        formData.append("photo", photoFile);
      } catch (error) {
        console.error("[updateEvent] Error processing photo:", error);
        result.errors.push({
          message: { key: "failedToProcessEventPhoto" },
          section: "event",
        });
        return { errors: result.errors };
      }
    }

    const response = await fetch(`${API_URL}/events/${event.uuid}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${bearerToken}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      console.error("[updateEvent] Event update failed:", {
        status: response.status,
        error: errorData,
      });
      result.errors.push({
        message: errorData.errors[0]?.message ?? "failedToUpdateEvent",
        section: "event",
      });
      return { errors: result.errors };
    }

    result.event = (await response.json()) as Event;
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
                permissionsIds: [1],
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
                permissionsIds: change.data.permissions.map((perm) => perm.id),
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

  for (const change of attributesChanges) {
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
              body: JSON.stringify(change.data),
            },
          );

          if (!response.ok) {
            const errorData = (await response.json()) as ErrorResponse;
            console.error(
              "[updateEvent] Failed to add attribute:",
              change.data,
            );

            if (
              change.data.config.isSensitiveData &&
              (change.data.config.reason == null ||
                change.data.config.reason.trim() === "")
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
          result.processedChanges.attributes++;
          break;
        }
        case "update": {
          if (!isValidUuid(change.data.uuid)) {
            result.errors.push({
              message: "Invalid attribute identifier",
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
              body: JSON.stringify(change.data),
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
              change.data.config.isSensitiveData &&
              (change.data.config.reason == null ||
                change.data.config.reason.trim() === "")
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
          if (!isValidUuid(change.data.uuid)) {
            result.errors.push({
              message: "Invalid attribute identifier",
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
      return { errors: errorData.errors };
    }
  } catch (error) {
    console.error("[deleteEvent] Network Error:", error);
    return { errors: [{ message: { key: "networkError" } }] };
  }
  revalidatePath("/dashboard/events");
  return {}; // Return an empty object on success
}
