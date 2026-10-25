/* eslint-disable unicorn/no-empty-file -- the whole file is commented out until PR 8 */
"use server";

// TODO(v3): Event duplication is disabled until it's rewritten for the v3 API, and the
// "Duplicate event" button in `event-card.tsx` is hidden until then.
// See `.claude/tasks/v3-pass/plan.md` (PR 8) and `.claude/notes/tiles-clone-leftovers.md`.
/*
import { formatDate } from "date-fns";
import { getLocale } from "next-intl/server";

import type { ErrorMessage } from "@/app/dashboard/(create-event)/actions";
import { saveEvent } from "@/app/dashboard/(create-event)/actions";
import { createEventEmail } from "@/app/dashboard/events/[uuid]/emails/actions";
import { getSingleEventEmail } from "@/app/dashboard/events/[uuid]/emails/data-access";
import { getSingleEventForm } from "@/app/dashboard/events/[uuid]/forms/data-access";
import { API_URL } from "@/lib/api";
import { getUser } from "@/lib/dal";
import { verifySession } from "@/lib/session";
import { COPY_SUFFIX_REGEX, getNextCopyName } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

export async function duplicateEvent(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return { success: false };
  }
  const headers = {
    Authorization: `Bearer ${session.bearerToken}`,
    "Content-Type": "application/json",
  };
  const warnings: ErrorMessage[] = [];

  // event
  const eventResponse = await fetch(`${API_URL}/events/${eventUuid}`, {
    headers,
  });
  if (!eventResponse.ok) {
    console.error(
      `[duplicateEvent] Failed to fetch event ${eventUuid}:`,
      await eventResponse.text(),
    );
    return { success: false };
  }
  const event = (await eventResponse.json()) as Event;

  const eventsResponse = await fetch(
    `${API_URL}/events?name=${encodeURIComponent(event.name.replace(COPY_SUFFIX_REGEX, ""))}&take=100`,
    { headers },
  );
  if (!eventsResponse.ok) {
    console.warn(
      `[duplicateEvent] Failed to fetch existing event names for ${eventUuid}, the copy number may repeat:`,
      await eventsResponse.text(),
    );
  }
  const myEvents = eventsResponse.ok
    ? ((await eventsResponse.json()) as { data: Event[] }).data
    : [];
  const newName = getNextCopyName(
    event.name,
    myEvents.map((myEvent) => myEvent.name),
    (await getLocale()) === "en",
  );

  const baseSlug = event.slug.replace(/-copy-[\da-z]+$/, "");

  let photoDataUrl = "";
  // A photo that can't be copied must not block the copy of the event itself
  if (event.photoUrl != null && event.photoUrl !== "") {
    try {
      const photoResponse = await fetch(event.photoUrl);
      const contentType =
        photoResponse.headers.get("content-type") ?? "image/jpeg";
      if (photoResponse.ok && contentType.startsWith("image/")) {
        const base64 = Buffer.from(await photoResponse.arrayBuffer()).toString(
          "base64",
        );
        photoDataUrl = `data:${contentType};base64,${base64}`;
      } else {
        warnings.push({ key: "eventPhotoCopyWarning" });
        console.error(
          `[duplicateEvent] Failed to fetch photo of ${eventUuid}: status ${photoResponse.status.toString()}, content type ${contentType}`,
        );
      }
    } catch (error) {
      warnings.push({ key: "eventPhotoCopyWarning" });
      console.error(
        `[duplicateEvent] Failed to fetch photo of ${eventUuid}:`,
        error,
      );
    }
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const result = await saveEvent({
    name: newName,
    description: event.description ?? undefined,
    startDate,
    startTime: formatDate(startDate, "HH:mm"),
    endDate,
    endTime: formatDate(endDate, "HH:mm"),
    location: event.location ?? undefined,
    organizer: event.organizer ?? undefined,
    photoUrl: photoDataUrl,
    primaryColor: event.primaryColor ?? "#3672fd",
    participantsNumber: event.participantsCount ?? 1,
    socialMediaLinks: event.links
      .filter((link) => link.type === "general")
      .map((link) => ({ label: link.label, url: link.url, type: link.type })),
    slug: `${baseSlug}-copy-${Date.now().toString(36)}`,
    contactEmail: event.contactEmail ?? undefined,
    coorganizers: [],
    attributes: [],
    termsLink: event.links.find((link) => link.type === "policy")?.url,
  });

  if (result.uuid === undefined) {
    console.error(
      `[duplicateEvent] Failed to create copy of ${eventUuid}:`,
      result.errors,
    );
    return { success: false };
  }
  const newEventUuid = result.uuid;

  // coorganizers
  const user = await getUser();
  //TODO: pagination issue (applies to all GET fetches in this file)
  const organizersResponse = await fetch(
    `${API_URL}/events/${eventUuid}/organizers?take=100`,
    { headers },
  );
  const coorganizers = organizersResponse.ok
    ? ((await organizersResponse.json()) as { data: CoOrganizer[] }).data
    : [];
  for (const coorganizer of coorganizers) {
    if (coorganizer.email === user?.email) {
      continue;
    }
    const response = await fetch(
      `${API_URL}/events/${newEventUuid}/organizers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: coorganizer.email,
          permissionsIds: coorganizer.permissions.map(
            (permission) => permission.id,
          ),
        }),
      },
    );
    if (!response.ok) {
      warnings.push({
        key: "coOrganizerAddWarning",
        values: { email: coorganizer.email },
      });
      console.error(
        `[duplicateEvent] Failed to add co-organizer ${coorganizer.email}:`,
        await response.text(),
      );
    }
  }

  // attributes
  const attributeUuidMap = new Map<string, string>();
  const attributeResponse = await fetch(
    `${API_URL}/events/${eventUuid}/attributes?take=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!attributeResponse.ok) {
    warnings.push({ key: "attributesFetchWarning" });
    console.warn(
      `[duplicateEvent] Failed to fetch available attributes when attempting to duplicate event ${eventUuid}:`,
      attributeResponse,
    );
  }

  const attributes = attributeResponse.ok
    ? ((await attributeResponse.json()) as { data: EventAttribute[] }).data
    : [];

  for (const attribute of attributes) {
    const response = await fetch(
      `${API_URL}/events/${newEventUuid}/attributes`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: attribute.name,
          type: attribute.type,
          slug: attribute.slug,
          showInList: attribute.showInList,
          order: attribute.order,
          options:
            (attribute.options ?? []).length > 0
              ? attribute.options
              : undefined,
          isSensitiveData: attribute.isSensitiveData,
          reason: attribute.reason,
          isMultiple: attribute.isMultiple,
          maxSelections: attribute.maxSelections,
        }),
      },
    );
    if (!response.ok) {
      warnings.push({
        key: "attributeAddWarning",
        values: { name: attribute.name },
      });
      console.warn(
        `[duplicateEvent] Failed to copy attribute ${attribute.name}:`,
        await response.text(),
      );
      continue;
    }
    const newAttribute = (await response.json()) as { uuid: string };
    attributeUuidMap.set(attribute.uuid, newAttribute.uuid);

    if (attribute.type === "block") {
      const [oldTreeResponse, newTreeResponse] = await Promise.all([
        fetch(
          `${API_URL}/events/${eventUuid}/attributes/${attribute.uuid}/blocks`,
          { headers },
        ),
        fetch(
          `${API_URL}/events/${newEventUuid}/attributes/${newAttribute.uuid}/blocks`,
          { headers },
        ),
      ]);
      const oldRoot = oldTreeResponse.ok
        ? ((await oldTreeResponse.json()) as Block | [])
        : [];
      const newRoot = newTreeResponse.ok
        ? ((await newTreeResponse.json()) as Block | [])
        : [];

      if (!Array.isArray(oldRoot) && !Array.isArray(newRoot)) {
        const copyChildren = async (
          oldParent: Block,
          newParentUuid: string,
        ) => {
          for (const child of oldParent.children.toSorted(
            (a, b) => a.order - b.order,
          )) {
            const blockResponse = await fetch(
              `${API_URL}/events/${newEventUuid}/attributes/${newAttribute.uuid}/blocks`,
              {
                method: "POST",
                headers,
                body: JSON.stringify({
                  parentUuid: newParentUuid,
                  name: child.name,
                  description: child.description,
                  capacity: child.capacity,
                }),
              },
            );
            if (!blockResponse.ok) {
              warnings.push({
                key: "blockCopyWarning",
                values: { name: child.name },
              });
              console.warn(
                `[duplicateEvent] Failed to copy block ${child.name}:`,
                await blockResponse.text(),
              );
              continue;
            }
            const newBlock = (await blockResponse.json()) as { uuid: string };
            await copyChildren(child, newBlock.uuid);
          }
        };
        await copyChildren(oldRoot, newRoot.uuid);
      }
    }
  }

  // forms
  const formUuidMap = new Map<string, string>();
  const formsResponse = await fetch(
    `${API_URL}/events/${eventUuid}/forms?take=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.bearerToken}`,
      },
    },
  );

  if (!formsResponse.ok) {
    warnings.push({ key: "formsFetchWarning" });
    console.warn(
      `[duplicateEvent] Failed to fetch forms for event ${eventUuid}:`,
      formsResponse,
    );
  }

  const forms = formsResponse.ok
    ? ((await formsResponse.json()) as { data: EventForm[] }).data
    : [];

  // The list is newest first, so copy the oldest first to keep the original order
  for (const formFromList of forms.toReversed()) {
    const form = await getSingleEventForm(eventUuid, formFromList.uuid);
    if (form === null) {
      warnings.push({
        key: "formCopyWarning",
        values: { name: formFromList.name },
      });
      continue;
    }
    const response = await fetch(`${API_URL}/events/${newEventUuid}/forms`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        openDate: form.openDate,
        closeDate: form.closeDate,
        isOpen: form.isOpen,
        isFirstForm: form.isFirstForm,
        openCondition: form.openCondition,
        attributes: form.attributes.flatMap((attribute) => {
          const newAttributeUuid = attributeUuidMap.get(attribute.uuid);
          return newAttributeUuid === undefined
            ? []
            : [
                {
                  uuid: newAttributeUuid,
                  isRequired: attribute.isRequired,
                  isEditable: attribute.isEditable,
                  order: attribute.order,
                },
              ];
        }),
      }),
    });
    if (!response.ok) {
      warnings.push({ key: "formCopyWarning", values: { name: form.name } });
      console.warn(
        `[duplicateEvent] Failed to copy form ${form.name}:`,
        await response.text(),
      );
      continue;
    }
    const newForm = (await response.json()) as { uuid: string };
    formUuidMap.set(form.uuid, newForm.uuid);
  }

  // emails
  const emailsResponse = await fetch(
    `${API_URL}/events/${eventUuid}/emails?take=100`,
    { headers },
  );

  if (!emailsResponse.ok) {
    warnings.push({ key: "emailsFetchWarning" });
    console.warn(
      `[duplicateEvent] Failed to fetch emails for event ${eventUuid}:`,
      await emailsResponse.text(),
    );
  }

  const emails = emailsResponse.ok
    ? (
        (await emailsResponse.json()) as {
          data: { id: string; name: string }[];
        }
      ).data
    : [];

  // The list is newest first, so copy the oldest first to keep the original order
  for (const emailFromList of emails.toReversed()) {
    const email = await getSingleEventEmail(eventUuid, emailFromList.id);
    if (email === null) {
      warnings.push({
        key: "emailCopyWarning",
        values: { name: emailFromList.name },
      });
      continue;
    }
    const emailResult = await createEventEmail({
      eventUuid: newEventUuid,
      emailTemplate: {
        name: email.name,
        content: email.content,
        schema: email.schema,
        trigger: email.trigger,
        triggerValue:
          email.triggerValue === null
            ? null
            : (formUuidMap.get(email.triggerValue) ??
              attributeUuidMap.get(email.triggerValue) ??
              email.triggerValue),
        triggerValue2: email.triggerValue2,
      },
    });
    if (!emailResult.success) {
      warnings.push({ key: "emailCopyWarning", values: { name: email.name } });
    }
  }

  return {
    success: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
*/
