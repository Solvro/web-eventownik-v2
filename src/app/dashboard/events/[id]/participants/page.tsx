import { redirect } from "next/navigation";

import { ParticipantTable } from "@/app/dashboard/events/[id]/participants/participants-table";
import { verifySession } from "@/lib/session";

import { getAttributes, getParticipants } from "./actions";
import { mockedAttributes, mockedParticipants } from "./mocked-data";

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
  const participantsData = getParticipants(id, session.bearerToken);
  const attributesData = getAttributes(id, session.bearerToken);

  const [participants, attributes] = await Promise.all([
    participantsData,
    attributesData,
  ]);
  // const participants = mockedParticipants;
  // const attributes = mockedAttributes;

  return (
    <div>
      {participants == null || attributes == null ? (
        <div>Nie udało się załadować danych o uczestnikach</div>
      ) : (
        <ParticipantTable participants={participants} attributes={attributes} />
      )}
    </div>
  );
}
