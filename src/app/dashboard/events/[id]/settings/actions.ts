"use server";

import type { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";

import { API_URL } from "@/lib/api";
import { generateFileFromDataUrl } from "@/lib/event";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

import type { AttributeChange, CoOrganizerChange } from "./change-types";

interface ErrorResponse {
  errors: { message: string }[];
}

interface UpdateResult {
  event?: Event;
  errors: {
    message: string;
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
  t: ReturnType<typeof useTranslations<"Dashboard">>,
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
    formData.append("termsLink", event.termsLink ?? "");
    for (const link of event.socialMediaLinks ?? []) {
      if (link.trim() === "") {
        continue;
      }
      formData.append("socialMediaLinks[]", link);
    }
    if (
      event.socialMediaLinks === null ||
      event.socialMediaLinks.map((link) => link.trim()).length === 0
    ) {
      formData.append("socialMediaLinks", "");
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
          message: t("failedToProcessEventPhoto"),
          section: "event",
        });
        return { errors: result.errors };
      }
    }

    const response = await fetch(`${API_URL}/events/${event.id.toString()}`, {
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
        message: errorData.errors[0]?.message ?? t("failedToUpdateEvent"),
        section: "event",
      });
      return { errors: result.errors };
    }

    result.event = (await response.json()) as Event;
  } catch (error) {
    console.error("[updateEvent] Network error updating event:", error);
    result.errors.push({
      message: t("networkErrorWhileUpdatingEvent"),
      section: "event",
    });
    return { errors: result.errors };
  }

  for (const change of coOrganizersChanges) {
    try {
      switch (change.type) {
        case "add": {
          const response = await fetch(
            `${API_URL}/events/${event.id.toString()}/organizers`,
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
              message: t("failedToAddCoOrganizer", {
                email: change.data.email,
                errorData: JSON.stringify(errorData),
              }),
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
            `${API_URL}/events/${String(event.id)}/organizers/${change.data.id}`,
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
              message: t("failedToUpdateCoOrganizer", {
                email: change.data.email,
                errorData: JSON.stringify(errorData),
              }),
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
            `${API_URL}/events/${String(event.id)}/organizers/${change.data.id}`,
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
              message: t("failedToDeleteCoOrganizer", {
                email: change.data.email,
                errorData: JSON.stringify(errorData),
              }),
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
        message: t("failedToProcessCoOrganizer", {
          email: change.data.email,
          errorData: error instanceof Error ? error.message : t("unknownError"),
        }),
        section: "coOrganizers",
      });
    }
  }

  for (const change of attributesChanges) {
    try {
      switch (change.type) {
        case "add": {
          const response = await fetch(
            `${API_URL}/events/${String(event.id)}/attributes`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
              // NOTE: This payload should probably be inferred entirely from the `change.data` object,
              // so that manual changes after adding new attribute field in `attribute-item` are not required here
              body: JSON.stringify({
                name: change.data.name,
                type: change.data.type,
                slug: change.data.slug,
                showInList: change.data.showInList,
                order: change.data.order,
                options:
                  (change.data.options ?? []).length > 0
                    ? change.data.options
                    : undefined,
                isSensitiveData: change.data.isSensitiveData,
                reason: change.data.reason,
                isMultiple: change.data.isMultiple,
                maxSelections: change.data.maxSelections,
              }),
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
                message: t("sensitiveAttributeMissingPurpose", {
                  name: change.data.name,
                }),
                section: "attributes",
              });
            } else {
              result.errors.push({
                message: t("failedToAddAttribute", {
                  name: change.data.name,
                  errorData: JSON.stringify(errorData),
                }),
                section: "attributes",
              });
            }
            continue;
          }
          result.processedChanges.attributes++;
          break;
        }
        case "update": {
          if (change.data.id == null || change.data.id < 0) {
            continue;
          }

          const response = await fetch(
            `${API_URL}/events/${String(event.id)}/attributes/${String(change.data.id)}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${bearerToken}`,
                "Content-Type": "application/json",
              },
              // NOTE: Duplicate of the note comment above
              body: JSON.stringify({
                name: change.data.name,
                type: change.data.type,
                slug: change.data.slug,
                showInList: change.data.showInList,
                order: change.data.order,
                options:
                  (change.data.options ?? []).length > 0
                    ? change.data.options
                    : undefined,
                isSensitiveData: change.data.isSensitiveData,
                reason: change.data.reason,
                isMultiple: change.data.isMultiple,
                maxSelections: change.data.maxSelections,
              }),
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
                message: t("sensitiveAttributeMissingPurpose", {
                  name: change.data.name,
                }),
                section: "attributes",
              });
            } else {
              result.errors.push({
                message: t("failedToUpdateAttribute", {
                  name: change.data.name,
                  errorData: JSON.stringify(errorData),
                }),
                section: "attributes",
              });
            }
            continue;
          }
          result.processedChanges.attributes++;
          break;
        }
        case "delete": {
          if (change.data.id == null || change.data.id < 0) {
            continue;
          }

          const response = await fetch(
            `${API_URL}/events/${String(event.id)}/attributes/${String(change.data.id)}`,
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
              message: t("failedToDeleteAttribute", {
                name: change.data.name,
                errorData: JSON.stringify(errorData),
              }),
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
        message: t("failedToDeleteAttribute", {
          name: change.data.name,
          errorData: error instanceof Error ? error.message : t("unknownError"),
        }),
        section: "attributes",
      });
    }
  }

  revalidatePath(`/dashboard/events/${String(event.id)}/settings`);

  // Return errors if any, otherwise return the updated event
  if (result.errors.length > 0) {
    return { errors: result.errors };
  }

  return result.event;
}

export async function deleteEvent(
  eventId: number,
): Promise<object | ErrorResponse> {
  const session = await verifySession();
  if (session?.bearerToken == null) {
    throw new Error("Invalid session");
  }
  const { bearerToken } = session;

  try {
    const response = await fetch(`${API_URL}/events/${eventId.toString()}`, {
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
    return { errors: [{ message: "networkError" }] };
  }
  revalidatePath("/dashboard/events");
  return {}; // Return an empty object on success
}
