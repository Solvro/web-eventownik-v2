import { User } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { getEventBlockAttributeBlocks } from "@/app/[eventSlug]/utils";
import { EventInfoDiv } from "@/components/event-info-div";
import { FormClosedView } from "@/components/form-closed-view";
import { API_URL } from "@/lib/api";
import { isFormOpen } from "@/lib/event-form-utils";
import type { FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";
import type { PublicParticipant } from "@/types/participant";

import { EventNotFound } from "../../event-not-found";
import { FormGenerator } from "../../form-generator";

interface FormPageProps {
  params: Promise<{
    eventSlug: string;
    formSlug: string;
    userSlug: string;
    locale: string;
  }>;
}

async function getEvent(eventSlug: string) {
  const eventResponse = await fetch(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}`,
    {
      method: "GET",
    },
  );
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
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/forms/${encodeURIComponent(formSlug)}`,
    {
      method: "GET",
    },
  );
  if (!formResponse.ok) {
    const error = (await formResponse.json()) as unknown;
    console.error(error);
    return null;
  }
  const form = (await formResponse.json()) as EventForm;
  return form;
}

async function getUserData(
  formAttributes: FormAttribute[],
  eventSlug: string,
  userSlug: string,
) {
  const attributesUrl = new URL(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/participants/${encodeURIComponent(userSlug)}`,
  );

  for (const attribute of formAttributes) {
    attributesUrl.searchParams.append("attributes[]", attribute.uuid);
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
  const t = await getTranslations("Dashboard");
  const { eventSlug, formSlug } = await params;

  const form = await getForm(eventSlug, formSlug);

  return {
    title: form === null ? t("form") : form.name,
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

  if (!isFormOpen(form)) {
    return <FormClosedView event={event} form={form} isRegistration={false} />;
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
      getEventBlockAttributeBlocks(event.slug, attribute.uuid),
    ),
  );

  if (eventBlocks.includes(null)) {
    return <EventNotFound whatNotFound="blocks" />;
  }

  return (
    <EventPageLayout
      event={event}
      description={form.description}
      variant="form"
    >
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
        formUuid={form.uuid}
        eventSlug={eventSlug}
        userSlug={userSlug}
        editMode={true}
      />
    </EventPageLayout>
  );
}
