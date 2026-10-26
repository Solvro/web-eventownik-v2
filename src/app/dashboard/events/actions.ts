"use server";

import { formatDate } from "date-fns";
import { getLocale } from "next-intl/server";

import type { ErrorMessage } from "@/app/dashboard/(create-event)/actions";
import { saveEvent } from "@/app/dashboard/(create-event)/actions";
import { getSingleEventEmail } from "@/app/dashboard/events/[uuid]/emails/data-access";
import { getSingleEventForm } from "@/app/dashboard/events/[uuid]/forms/data-access";
import { API_URL, fetchAllPages } from "@/lib/api";
import { getUser } from "@/lib/dal";
import { verifySession } from "@/lib/session";
import { COPY_SUFFIX_REGEX, getNextCopyName } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventOrganizer } from "@/types/co-organizer";
import type { EventEmail } from "@/types/emails";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

/**
 * A block attribute's expected value in an "attribute changed" trigger holds block UUIDs,
 * which the backend compares as JSON, so they have to point at the copied blocks
 */
function remapBlockUuid(value: unknown, blockUuidMap: Map<string, string>) {
  return typeof value === "string" ? (blockUuidMap.get(value) ?? value) : value;
}

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

  const myEvents =
    (await fetchAllPages<Event>(
      `${API_URL}/events?name=${encodeURIComponent(event.name.replace(COPY_SUFFIX_REGEX, ""))}`,
      { headers },
    )) ?? [];
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

  // `saveEvent` creates the copy as a draft, like every new event
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
    organizer: event.organizerName ?? undefined,
    photoUrl: photoDataUrl,
    primaryColor: event.primaryColor ?? "#3672fd",
    // Same fallback as the event settings, the limit is required in the UI
    participantsNumber: event.participantsLimit ?? 100,
    socialMediaLinks: event.links
      .filter((link) => link.type === "general")
      .map((link) => ({
        label: link.label ?? undefined,
        url: link.url,
        type: link.type,
      })),
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
  const organizers =
    (await fetchAllPages<EventOrganizer>(
      `${API_URL}/events/${eventUuid}/organizers`,
      { headers },
    )) ?? [];
  for (const organizer of organizers) {
    // The user duplicating the event is already its owner
    if (organizer.uuid === user?.uuid) {
      continue;
    }
    const response = await fetch(
      `${API_URL}/events/${newEventUuid}/organizers`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: organizer.email,
          permissions: organizer.permissions.map(
            ({ permission }) => permission,
          ),
        }),
      },
    );
    if (!response.ok) {
      warnings.push({
        key: "coOrganizerAddWarning",
        values: { email: organizer.email },
      });
      console.error(
        `[duplicateEvent] Failed to add co-organizer ${organizer.email}:`,
        await response.text(),
      );
    }
  }

  // attributes
  const attributeUuidMap = new Map<string, string>();
  const blockUuidMap = new Map<string, string>();
  const attributes = await fetchAllPages<Attribute>(
    `${API_URL}/events/${eventUuid}/attributes?sort=order:asc`,
    { headers },
  );

  if (attributes === null) {
    warnings.push({ key: "attributesFetchWarning" });
  }

  for (const attribute of attributes ?? []) {
    // `participantFields` point at other attributes, so they're copied once every attribute has a new UUID
    const { participantFields: _participantFields, ...config } =
      attribute.config;
    const response = await fetch(
      `${API_URL}/events/${newEventUuid}/attributes`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: attribute.name,
          type: attribute.type,
          showInList: attribute.showInList,
          order: attribute.order,
          config,
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
        blockUuidMap.set(oldRoot.uuid, newRoot.uuid);
        const copyChildren = async (
          oldParent: Block,
          newParentUuid: string,
        ) => {
          for (const child of oldParent.children) {
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
                  order: child.order,
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
            blockUuidMap.set(child.uuid, newBlock.uuid);
            await copyChildren(child, newBlock.uuid);
          }
        };
        await copyChildren(oldRoot, newRoot.uuid);
      }
    }
  }

  // The backend accepts any UUID in `participantFields`, so fields of attributes that weren't copied are dropped,
  // instead of pointing at the original event
  for (const attribute of attributes ?? []) {
    const newAttributeUuid = attributeUuidMap.get(attribute.uuid);
    const { participantFields } = attribute.config;
    if (
      newAttributeUuid === undefined ||
      participantFields == null ||
      participantFields.length === 0
    ) {
      continue;
    }
    const response = await fetch(
      `${API_URL}/events/${newEventUuid}/attributes/${newAttributeUuid}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          config: {
            ...attribute.config,
            participantFields: participantFields.flatMap((field) => {
              if (field === "email") {
                return [field];
              }
              const newField = attributeUuidMap.get(field);
              return newField === undefined ? [] : [newField];
            }),
          },
        }),
      },
    );
    if (!response.ok) {
      warnings.push({
        key: "participantFieldsCopyWarning",
        values: { name: attribute.name },
      });
      console.warn(
        `[duplicateEvent] Failed to copy participant fields of ${attribute.name}:`,
        await response.text(),
      );
    }
  }

  // forms
  const formUuidMap = new Map<string, string>();
  const forms = await fetchAllPages<EventForm>(
    `${API_URL}/events/${eventUuid}/forms?sort=order:asc,createdAt:asc`,
    { headers },
  );

  if (forms === null) {
    warnings.push({ key: "formsFetchWarning" });
  }

  for (const formFromList of forms ?? []) {
    // The list doesn't include the form definitions
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
        isEditable: form.isEditable,
        isFirstForm: form.uuid === event.registerFormUuid,
        openCondition: form.openCondition,
        ...(form.order !== null && { order: form.order }),
        attributes: form.formDefinitions.flatMap((definition) => {
          const newAttributeUuid = attributeUuidMap.get(
            definition.attribute.uuid,
          );
          return newAttributeUuid === undefined
            ? []
            : [
                {
                  attributeUuid: newAttributeUuid,
                  isRequired: definition.isRequired,
                  order: definition.order,
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
  const emails = await fetchAllPages<EventEmail>(
    `${API_URL}/events/${eventUuid}/emails?sort=order:asc`,
    { headers },
  );

  if (emails === null) {
    warnings.push({ key: "emailsFetchWarning" });
  }

  for (const emailFromList of emails ?? []) {
    // The list doesn't include the content
    const email = await getSingleEventEmail(eventUuid, emailFromList.id);
    if (email === null) {
      warnings.push({
        key: "emailCopyWarning",
        values: { name: emailFromList.name },
      });
      continue;
    }

    // The backend rejects a form or attribute from another event, so templates whose target wasn't copied are skipped
    const { formUuid, attributeUuid, expectedValue } =
      email.triggerConfig ?? {};
    const newFormUuid =
      formUuid === undefined ? undefined : formUuidMap.get(formUuid);
    const newAttributeUuid =
      attributeUuid === undefined
        ? undefined
        : attributeUuidMap.get(attributeUuid);
    const triggerConfig =
      email.trigger === "FORM_FILLED"
        ? newFormUuid === undefined
          ? null
          : { formUuid: newFormUuid }
        : email.trigger === "ATTRIBUTE_CHANGED"
          ? newAttributeUuid === undefined
            ? null
            : {
                attributeUuid: newAttributeUuid,
                expectedValue: Array.isArray(expectedValue)
                  ? expectedValue.map((value) =>
                      remapBlockUuid(value, blockUuidMap),
                    )
                  : remapBlockUuid(expectedValue, blockUuidMap),
              }
          : {};
    if (triggerConfig === null) {
      warnings.push({ key: "emailCopyWarning", values: { name: email.name } });
      continue;
    }

    const response = await fetch(`${API_URL}/events/${newEventUuid}/emails`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: email.name,
        content: email.content,
        trigger: email.trigger,
        triggerConfig,
        ...(email.schema !== null && { schema: email.schema }),
        ...(email.order !== null && { order: email.order }),
      }),
    });
    if (!response.ok) {
      warnings.push({ key: "emailCopyWarning", values: { name: email.name } });
      console.warn(
        `[duplicateEvent] Failed to copy email ${email.name}:`,
        await response.text(),
      );
    }
  }

  return {
    success: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
