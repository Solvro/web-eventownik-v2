import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAttributes, getBlocks, getParticipant } from "../actions";
import { ParticipantFormContent } from "../table/components/dialogs/participant-dialog";

interface ParticipantPageProps {
  params: Promise<{ uuid: string; participantUuid: string }>;
}

export async function generateMetadata({
  params,
}: ParticipantPageProps): Promise<Metadata> {
  const { uuid, participantUuid } = await params;
  const t = await getTranslations("Table");
  const participant = await getParticipant(uuid, participantUuid);

  return { title: participant?.email ?? t("editParticipantTitle") };
}

export default async function ParticipantPage({
  params,
}: ParticipantPageProps) {
  const { uuid, participantUuid } = await params;
  const t = await getTranslations("Table");

  const [participant, attributes] = await Promise.all([
    getParticipant(uuid, participantUuid),
    getAttributes(uuid),
  ]);
  if (participant == null) {
    notFound();
  }
  const blocks = await getBlocks(uuid, attributes ?? []);

  return (
    <div className="flex w-full flex-col gap-6">
      <Link
        href={`/dashboard/events/${uuid}/participants`}
        className="flex items-center gap-2 underline"
      >
        <ArrowLeft className="size-4" /> {t("backToParticipants")}
      </Link>
      <h1 className="text-2xl font-bold">{t("editParticipantTitle")}</h1>
      <ParticipantFormContent
        eventUuid={uuid}
        blocks={blocks}
        participantUuid={participantUuid}
        className="max-w-4xl"
      />
    </div>
  );
}
