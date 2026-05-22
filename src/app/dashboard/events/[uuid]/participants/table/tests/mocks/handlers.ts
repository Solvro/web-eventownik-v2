import { HttpResponse, http } from "msw";

import { API_URL } from "@/lib/api";

import { deleteParticipantCaseData } from "./test-cases-data";

// TODO use MSW data?
let DELETE_PARTICIPANTS_MOCK = { ...deleteParticipantCaseData };

export const handlers = [
  http.patch<{ eventUuid: string; participantId: string }>(
    `${API_URL}/events/:eventUuid/participants/:participantId`,
    () => {
      return HttpResponse.json();
    },
  ),
  http.delete<{ eventUuid: string; participantId: string }>(
    `${API_URL}/events/:eventUuid/participants/:participantId`,
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
  http.delete<{ eventUuid: string }>(
    `${API_URL}/events/:eventUuid/participants`,
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
  http.get<{ eventUuid: string }>(
    `${API_URL}/events/:eventUuid/participants/export`,
    () => {
      return HttpResponse.json();
    },
  ),
  http.post<{ eventUuid: string; emailId: string }>(
    `${API_URL}/events/:eventUuid/emails/send/:emailId`,
    () => {
      return HttpResponse.json();
    },
  ),
];
