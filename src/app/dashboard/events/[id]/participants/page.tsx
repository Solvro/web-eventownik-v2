import { redirect } from "next/navigation";

import { ParticipantTable } from "@/app/dashboard/events/[id]/participants/table/participants-table";
import { verifySession } from "@/lib/session";

import { getAttributes, getEmails, getParticipants } from "./actions";

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
          eventId={id}
        />
      )}
    </div>
  );
}
