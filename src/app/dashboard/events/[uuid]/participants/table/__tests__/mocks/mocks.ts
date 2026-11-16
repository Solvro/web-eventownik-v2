import { HttpResponse, http } from "msw";

import { API_URL } from "@/lib/api";
import type { Participant } from "@/types/participant";

export function mockVerifySession() {
  return {
    verifySession: vi.fn(() => {
      return { bearerToken: "BEARERTOKEN" };
    }),
  };
}

export function mockParticipantGet(testCaseData: Participant[]) {
  return http.get<{ eventUuid: string; participantUuid: string }>(
    `${API_URL}/events/:eventUuid/participants/:participantUuid`,
    ({ params }) => {
      const { participantUuid } = params;
      const participant: Participant | undefined = testCaseData.find(
        (p) => p.uuid === participantUuid,
      );
      if (participant === undefined) {
        return HttpResponse.json(
          {
            message: `Participant with id = ${participantUuid} not found! Check test case data`,
          },
          { status: 404 },
        );
      }
      return HttpResponse.json(participant);
    },
  );
}

export function mockParticipantsGet(testCaseData: Participant[]) {
  return http.get<{ eventUuid: string }>(
    `${API_URL}/events/:eventUuid/participants`,
    () => {
      return HttpResponse.json(testCaseData);
    },
  );
}
