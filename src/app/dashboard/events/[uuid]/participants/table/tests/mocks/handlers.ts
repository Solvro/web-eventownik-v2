import { HttpResponse, http } from "msw";

import { API_URL } from "@/lib/api";

import { deleteParticipantCaseData } from "./test-cases-data";

// TODO use MSW data?
let DELETE_PARTICIPANTS_MOCK = { ...deleteParticipantCaseData };

export const handlers = [
  http.patch<{ eventUuid: string; participantUuid: string }>(
    `${API_URL}/events/:eventUuid/participants/:participantUuid`,
    () => {
      return HttpResponse.json();
    },
  ),
  http.delete<{ eventUuid: string; participantUuid: string }>(
    `${API_URL}/events/:eventUuid/participants/:participantUuid`,
    ({ params }) => {
      const { participantUuid } = params;
      DELETE_PARTICIPANTS_MOCK = {
        ...DELETE_PARTICIPANTS_MOCK,
        participants: DELETE_PARTICIPANTS_MOCK.participants.filter(
          (p) => p.uuid !== participantUuid,
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
          (p) => !participantsToUnregisterIds.includes(p.uuid),
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
