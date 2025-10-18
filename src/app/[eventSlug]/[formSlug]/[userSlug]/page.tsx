import { User } from "lucide-react";
import type { Metadata } from "next";
import React from "react";

import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { getEventBlockAttributeBlocks } from "@/app/[eventSlug]/utils";
import { EventInfoDiv } from "@/components/event-info-div";
import { API_URL } from "@/lib/api";
import type { FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { Event } from "@/types/event";
import type { Form } from "@/types/form";
import type { PublicParticipant } from "@/types/participant";

import { EventNotFound } from "../../event-not-found";
import { FormGenerator } from "./form-generator";

interface FormPageProps {
  params: Promise<{ eventSlug: string; formSlug: string; userSlug: string }>;
}

async function getEvent(eventSlug: string) {
  const eventResponse = await fetch(`${API_URL}/events/${eventSlug}/public`, {
    method: "GET",
  });
  if (!eventResponse.ok) {
    const error = (await eventResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  const event = (await eventResponse.json()) as Event;
  return event;
}

async function getForm(eventSlug: string, formSlug: string) {
  const formResponse = await fetch(
    `${API_URL}/events/${eventSlug}/forms/${formSlug}`,
    {
      method: "GET",
    },
  );
  if (!formResponse.ok) {
    const error = (await formResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  const form = (await formResponse.json()) as Form;
  return form;
}

async function getUserData(
  formAttributes: FormAttribute[],
  eventSlug: string,
  userSlug: string,
) {
  const attributesUrl = new URL(
    `${API_URL}/events/${eventSlug}/participants/${userSlug}`,
  );

  for (const attribute of formAttributes) {
    attributesUrl.searchParams.append("attributes[]", attribute.id.toString());
  }

  const userDataResponse = await fetch(attributesUrl, {
    method: "GET",
  });

  if (!userDataResponse.ok) {
    const error = (await userDataResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  return (await userDataResponse.json()) as PublicParticipant;
}

export async function generateMetadata({
  params,
}: FormPageProps): Promise<Metadata> {
  const { eventSlug, formSlug } = await params;

  const form = await getForm(eventSlug, formSlug);

  return {
    title: form === null ? "Formularz" : form.name,
  };
}

export default async function FormPage({ params }: FormPageProps) {
  const { eventSlug, formSlug, userSlug } = await params;

  const event = await getEvent(eventSlug);
  if (event === null) {
    return <EventNotFound whatNotFound="event" />;
  }

  const form = await getForm(eventSlug, formSlug);
  if (form === null) {
    return <EventNotFound whatNotFound="form" />;
  }

  const userData = await getUserData(form.attributes, event.slug, userSlug);
  if (userData === null) {
    return <EventNotFound whatNotFound="user" />;
  }

  const blockAttributesInForm = form.attributes.filter(
    (attribute) => attribute.type === "block",
  );

  const eventBlocks = await Promise.all(
    blockAttributesInForm.map(async (attribute) =>
      getEventBlockAttributeBlocks(event.slug, attribute.id.toString()),
    ),
  );

  if (eventBlocks.includes(null)) {
    return <EventNotFound whatNotFound="blocks" />;
  }

  return (
    <EventPageLayout event={event} description={form.description}>
      <h2 className="text-center text-3xl font-bold md:text-4xl">
        {form.name}
      </h2>
      <EventInfoDiv className="bg-accent mt-2 font-medium shadow">
        <User className="size-4" strokeWidth={2.5} />
        {userData.email}
      </EventInfoDiv>
      <FormGenerator
        attributes={form.attributes}
        userData={userData}
        originalEventBlocks={eventBlocks as unknown as PublicBlock[]}
        formId={form.id.toString()}
        eventSlug={eventSlug}
        userSlug={userSlug}
      />
    </EventPageLayout>
  );
}
