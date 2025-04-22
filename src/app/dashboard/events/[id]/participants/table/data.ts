import type { FlattenedParticipant, Participant } from "@/types/participant";

export function flattenParticipants(participants: Participant[]) {
  return participants.map((participant) => {
    return flattenParticipant(participant);
  });
}

export function flattenParticipant(participant: Participant) {
  const flatParticipant = {
    id: participant.id,
    email: participant.email,
    slug: participant.slug,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
    mode: "view",
  } as FlattenedParticipant;

  for (const attribute of participant.attributes) {
    //New key in flatParticipant must match in definition of columns,
    //so if you use id there than in columns also use id in accessor
    //(not slug for example)
    flatParticipant[attribute.id] = attribute.value;
  }
  return flatParticipant;
}
