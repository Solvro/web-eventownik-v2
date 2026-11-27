import { redirect } from "next/navigation";

import { getMobileMe } from "@/lib/mobile/session";

import { OnboardingForm } from "./onboarding-form";

export default async function MobileOnboardingPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const result = await getMobileMe(eventSlug);
  if (result.status === "unauthenticated") {
    redirect(`/${eventSlug}/app/login`);
  }
  if (result.status === "ok" && result.me.profile !== null) {
    redirect(`/${eventSlug}/app`);
  }
  return <OnboardingForm />;
}
