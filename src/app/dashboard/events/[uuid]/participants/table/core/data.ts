import type { FlattenedParticipant, Participant } from "@/types/participant";

export function flattenParticipants(participants: Participant[]) {
  return participants.map((participant) => {
    return flattenParticipant(participant);
  });
}

export function flattenParticipant(
  participant: Participant,
  wasExpanded = false,
) {
  const flattenedParticipant: FlattenedParticipant = {
    uuid: participant.uuid,
    email: participant.email,
    createdAt: participant.createdAt,
    mode: "view",
    wasExpanded,
  };

  for (const attribute of participant.attributes) {
    //New key in flatParticipant must match in definition of columns,
    //so if you use id there than in columns also use id in accessor
    //(not slug for example)
    // TODO there we can add converting value from string to whatever we want
    flattenedParticipant[attribute.uuid] = Array.isArray(attribute.value)
      ? JSON.stringify(attribute.value)
      : typeof attribute.value === "object" && attribute.value !== null
        ? JSON.stringify(attribute.value)
        : attribute.value;
  }
  return flattenedParticipant;
}
