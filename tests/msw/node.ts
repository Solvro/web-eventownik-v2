import { setupServer } from "msw/node";

import { handlers } from "@/app/dashboard/events/[id]/participants/table/__tests__/mocks/handlers";

export const server = setupServer(...handlers);
