import { HttpResponse, http } from "msw";

import { API_URL } from "@/lib/api";

import { deleteParticipantCaseData } from "./test-cases-data";

// TODO use MSW data?
let DELETE_PARTICIPANTS_MOCK = { ...deleteParticipantCaseData };

export const handlers = [
  http.put<{ eventId: string; participantId: string }>(
    `${API_URL}/events/:eventId/participants/:participantId`,
    () => {
      return HttpResponse.json();
    },
  ),
  http.delete<{ eventId: string; participantId: string }>(
    `${API_URL}/events/:eventId/participants/:participantId`,
    ({ params }) => {
      const { participantId } = params;
      DELETE_PARTICIPANTS_MOCK = {
        ...DELETE_PARTICIPANTS_MOCK,
        participants: DELETE_PARTICIPANTS_MOCK.participants.filter(
          (p) => p.id !== Number(participantId),
        ),
      };
      return HttpResponse.json();
    },
  ),
  http.delete<{ eventId: string }>(
    `${API_URL}/events/:eventId/participants`,
    async ({ request }) => {
      const { participantsToUnregisterIds } = (await request.json()) as {
        participantsToUnregisterIds: string[];
      };

      DELETE_PARTICIPANTS_MOCK = {
        ...DELETE_PARTICIPANTS_MOCK,
        participants: DELETE_PARTICIPANTS_MOCK.participants.filter(
          (p) => !participantsToUnregisterIds.includes(p.id.toString()),
        ),
      };
      return HttpResponse.json();
    },
  ),
  http.get<{ eventId: string }>(
    `${API_URL}/events/:eventId/participants/export`,
    () => {
      return HttpResponse.json();
    },
  ),
  http.post<{ eventId: string; emailId: string }>(
    `${API_URL}/events/:eventId/emails/send/:emailId`,
    () => {
      return HttpResponse.json();
    },
  ),
];
