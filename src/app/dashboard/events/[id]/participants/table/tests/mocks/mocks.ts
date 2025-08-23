import { HttpResponse, http } from "msw";

import { API_URL } from "@/lib/api";
import type { SessionPayload } from "@/types/auth.js";
import type { Participant } from "@/types/participant";

export function mockVerifySession() {
  return {
    verifySession: vi.fn(() => {
      return { bearerToken: "BEARERTOKEN" } as SessionPayload;
    }),
  };
}

export function mockParticipantGet(testCaseData: Participant[]) {
  return http.get<{ eventId: string; participantId: string }>(
    `${API_URL}/events/:eventId/participants/:participantId`,
    ({ params }) => {
      const { participantId } = params;
      const participant: Participant | undefined = testCaseData.find(
        (p) => p.id === Number(participantId),
      );
      if (participant === undefined) {
        return HttpResponse.json(
          {
            message: `Participant with id = ${participantId} not found! Check test case data`,
          },
          { status: 404 },
        );
      }
      return HttpResponse.json(participant);
    },
  );
}
