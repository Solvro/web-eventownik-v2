import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ParticipantTable } from "@/app/dashboard/events/[id]/participants/table/participants-table";
import { verifySession } from "@/lib/session";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";

export const metadata: Metadata = {
  title: "Uczestnicy",
};

export default async function DashboardEventParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const { id } = await params;

  const participantsData = getParticipants(id);
  const attributesData = getAttributes(id);
  const emailsData = getEmails(id);

  const [participants, attributes, emails] = await Promise.all([
    participantsData,
    attributesData,
    emailsData,
  ]);
  const blocks = await getBlocks(id, attributes ?? []);

  return (
    <div>
      {participants == null || attributes == null ? (
        <div>Nie udało się załadować danych o uczestnikach</div>
      ) : (
        <ParticipantTable
          participants={participants.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )}
          attributes={attributes}
          emails={emails}
          blocks={blocks}
          eventId={id}
        />
      )}
    </div>
  );
}
