import { setupServer } from "msw/node";

import { handlers } from "../../src/app/dashboard/events/[id]/participants/table/tests/mocks/handlers.js";

export const server = setupServer(...handlers);
