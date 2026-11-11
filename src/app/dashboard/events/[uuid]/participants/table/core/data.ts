import type {
  FlattenedParticipant,
  Participant,
  ParticipantAttributeValueType,
} from "@/types/participant";

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
    flattenedParticipant[attribute.uuid] = Array.isArray(attribute.value)
      ? attribute.value.join(",")
      : (attribute.value as ParticipantAttributeValueType);
  }
  return flattenedParticipant;
}
