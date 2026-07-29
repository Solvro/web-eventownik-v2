import { setupServer } from "msw/node";

import { handlers } from "@/app/dashboard/events/[uuid]/participants/table/tests/mocks/handlers.js";

export const server = setupServer(...handlers);
