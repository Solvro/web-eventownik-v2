"use server";

import { formatDate } from "date-fns";

import { isSlugTaken, saveEvent } from "@/app/dashboard/(create-event)/actions";
import { createEventEmail } from "@/app/dashboard/events/[uuid]/emails/actions";
import {
  getEventEmails,
  getSingleEventEmail,
} from "@/app/dashboard/events/[uuid]/emails/data-access";
import {
  getEventAttributes,
  getEventForms,
  getSingleEventForm,
} from "@/app/dashboard/events/[uuid]/forms/data-access";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { getUser } from "@/lib/dal";
import { verifySession } from "@/lib/session";
import { getNextCopyName } from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

export async function duplicateEvent(eventUuid: string) {
  const session = await verifySession();
  if (session == null) {
    return { success: false };
  }
  const headers = {
    Authorization: `Bearer ${session.bearerToken}`,
    "Content-Type": "application/json",
  };
  let hasErrors = false;

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

  const eventsResponse = await fetch(`${API_URL}/events`, { headers });
  const myEvents = eventsResponse.ok
    ? ((await eventsResponse.json()) as { data: Event[] }).data
    : [];
  const newName = getNextCopyName(
    event.name,
    myEvents.map((myEvent) => myEvent.name),
  );

  const baseSlug = event.slug.replace(/-copy-\d+$/, "");
  let slugNumber = 1;
  while (await isSlugTaken(`${baseSlug}-copy-${slugNumber.toString()}`)) {
    slugNumber++;
  }

  let photoDataUrl = "";
  if (event.photoUrl != null && event.photoUrl !== "") {
    const photoResponse = await fetch(`${PHOTO_URL}/${event.photoUrl}`);
    if (photoResponse.ok) {
      const contentType =
        photoResponse.headers.get("content-type") ?? "image/jpeg";
      const base64 = Buffer.from(await photoResponse.arrayBuffer()).toString(
        "base64",
      );
      photoDataUrl = `data:${contentType};base64,${base64}`;
    } else {
      hasErrors = true;
      console.error(`[duplicateEvent] Failed to fetch photo of ${eventUuid}`);
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
    slug: `${baseSlug}-kopia-${slugNumber.toString()}`,
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
  const organizersResponse = await fetch(
    `${API_URL}/events/${eventUuid}/organizers`,
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
      hasErrors = true;
      console.error(
        `[duplicateEvent] Failed to add co-organizer ${coorganizer.email}:`,
        await response.text(),
      );
    }
  }

  // attributes
  const attributeUuidMap = new Map<string, string>();
  const attributes = (await getEventAttributes(eventUuid)).toSorted(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

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
      hasErrors = true;
      console.error(
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
              hasErrors = true;
              console.error(
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
  const forms = (await getEventForms(eventUuid)).toSorted(
    (a, b) => a.order - b.order,
  );

  for (const formFromList of forms) {
    const form = await getSingleEventForm(eventUuid, formFromList.uuid);
    if (form === null) {
      hasErrors = true;
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
      hasErrors = true;
      console.error(
        `[duplicateEvent] Failed to copy form ${form.name}:`,
        await response.text(),
      );
      continue;
    }
    const newForm = (await response.json()) as { uuid: string };
    formUuidMap.set(form.uuid, newForm.uuid);
  }

  // emails
  const emails = (await getEventEmails(eventUuid)) ?? [];

  for (const emailFromList of emails.toSorted((a, b) => a.order - b.order)) {
    const email = await getSingleEventEmail(eventUuid, emailFromList.uuid);
    if (email === null) {
      hasErrors = true;
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
      hasErrors = true;
    }
  }

  return { success: !hasErrors };
}
