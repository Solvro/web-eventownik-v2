import { User } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getPublicEvent, getPublicForm } from "@/app/[eventSlug]/data-access";
import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import { getEventBlockAttributeBlocks } from "@/app/[eventSlug]/utils";
import { EventInfoDiv } from "@/components/event-info-div";
import { FormClosedView } from "@/components/form-closed-view";
import { API_URL } from "@/lib/api";
import { BackendError, getBackend } from "@/lib/backend";
import { isFormOpen } from "@/lib/event-form-utils";
import { formControls } from "@/lib/form-controls";
import type { FormControlAttribute } from "@/types/attributes";
import type { V3PublicParticipant } from "@/types/v3";

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

async function getUserData(
  formAttributes: FormControlAttribute[],
  eventSlug: string,
  userSlug: string,
  formUuid: string,
) {
  const attributesUrl = new URL(
    `${API_URL}/public/events/${encodeURIComponent(eventSlug)}/participants/${encodeURIComponent(userSlug)}`,
  );
  attributesUrl.searchParams.set("formUuid", formUuid);

  for (const attribute of formAttributes) {
    attributesUrl.searchParams.append("attributes", attribute.uuid);
  }

  try {
    return { data: await getBackend<V3PublicParticipant>(attributesUrl) };
  } catch (error) {
    return { status: error instanceof BackendError ? error.status : 503 };
  }
}

export async function generateMetadata({
  params,
}: FormPageProps): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  const { eventSlug, formSlug } = await params;

  const form = await getPublicForm(eventSlug, formSlug);

  return {
    title: form.data === undefined ? t("form") : form.data.name,
  };
}

export default async function FormPage({ params }: FormPageProps) {
  const { eventSlug, formSlug, userSlug } = await params;

  const eventResult = await getPublicEvent(eventSlug);
  if (eventResult.data === undefined) {
    return <EventNotFound whatNotFound="event" status={eventResult.status} />;
  }

  const event = eventResult.data;
  const formResult = await getPublicForm(eventSlug, formSlug);
  if (formResult.data === undefined) {
    return <EventNotFound whatNotFound="form" status={formResult.status} />;
  }

  const form = formResult.data;
  const attributes = formControls(form);
  if (!isFormOpen(form)) {
    return <FormClosedView event={event} form={form} isRegistration={false} />;
  }

  const userData = await getUserData(
    attributes,
    event.slug,
    userSlug,
    form.uuid,
  );
  if (userData.data === undefined) {
    return <EventNotFound whatNotFound="user" status={userData.status} />;
  }

  const blockAttributesInForm = attributes.filter(
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
      description={form.description ?? ""}
      variant="form"
    >
      <h2 className="text-center text-3xl font-bold md:text-4xl">
        {form.name}
      </h2>

      <EventInfoDiv className="bg-accent mt-2 font-medium shadow">
        <User className="size-4" strokeWidth={2.5} />
        {userData.data.email}
      </EventInfoDiv>

      <FormGenerator
        form={form}
        userData={userData.data}
        originalEventBlocks={eventBlocks.filter((block) => block !== null)}
        formUuid={form.uuid}
        eventSlug={eventSlug}
        userSlug={userSlug}
        editMode={true}
      />
    </EventPageLayout>
  );
}
