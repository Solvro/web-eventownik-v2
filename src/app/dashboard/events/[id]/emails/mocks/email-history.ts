import { faker } from "@faker-js/faker";

import type {
  EventEmail,
  EventEmailParticipantData,
  SingleEventEmail,
} from "@/types/emails";

function createParticipant(
  emailTemplate: EventEmail,
  index: number,
): EventEmailParticipantData {
  const sendAt: Date = faker.date.recent({ days: 7 });
  const status: EventEmailParticipantData["meta"]["pivot_status"] =
    faker.helpers.arrayElement(["sent", "pending", "failed"]);
  const email = faker.internet.email();
  const slug = faker.helpers.slugify(
    faker.person.fullName().toLocaleLowerCase(),
  );

  return {
    id: index + 1,
    email,
    slug,
    createdAt: sendAt.toISOString(),
    updatedAt: sendAt.toISOString(),
    meta: {
      pivot_status: status,
      pivot_email_id: emailTemplate.id,
      pivot_participant_id: index + 1,
      pivot_send_at: sendAt,
      pivot_send_by: "System",
    },
  };
}

function createMockEmailHistory(
  emailTemplate: EventEmail,
  count = 10,
): SingleEventEmail {
  const { meta: _meta, ...emailWithoutMeta } = emailTemplate;

  const participants: EventEmailParticipantData[] = Array.from({
    length: count,
  }).map((_, index) => createParticipant(emailTemplate, index));

  return {
    ...emailWithoutMeta,
    content: "Przykładowa treść wiadomości do podglądu historii wysyłek.",
    participants,
  };
}

export { createMockEmailHistory };
