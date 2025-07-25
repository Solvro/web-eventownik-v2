import { HttpResponse, http } from "msw";

import { API_URL } from "@/lib/api";
import type { Participant } from "@/types/participant";

import { editParticipantDetailsTestCaseData } from "./test-cases-data";

export const handlers = [
  http.put<{ eventId: string; participantId: string }>(
    `${API_URL}/events/:eventId/participants/:participantId`,
    () => {
      return HttpResponse.json();
    },
  ),
  http.get<{ eventId: string; participantId: string }>(
    `${API_URL}/events/:eventId/participants/:participantId`,
    ({ params }) => {
      const { participantId } = params;
      const participant: Participant | undefined =
        editParticipantDetailsTestCaseData.participants.find(
          (p) => p.id === +participantId,
        );
      if (participant === undefined) {
        throw new Error(
          `Participant with id = ${participantId} not found! Check test case data`,
        );
      }
      return HttpResponse.json(participant);
    },
  ),
];
