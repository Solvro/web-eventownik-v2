import { test as baseTest, request } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { API_URL } from "./api-helpers";

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  token?: string;
}

const testDataFile = path.join(process.cwd(), "test-results/test-user.json");

function getTestUser(): TestUser {
  return JSON.parse(fs.readFileSync(testDataFile, "utf8")) as TestUser;
}

export { expect } from "@playwright/test";

export const test = baseTest.extend<{
  testUser: TestUser;
  authToken: string;
  apiRequest: APIRequestContext;
}>({
  // eslint-disable-next-line no-empty-pattern
  testUser: async ({}, run) => {
    const testUser = getTestUser();
    await run(testUser);
  },

  // eslint-disable-next-line no-empty-pattern
  authToken: async ({}, run) => {
    const testUser = getTestUser();
    if (testUser.token == null || testUser.token === "") {
      throw new Error("No auth token found in test user data");
    }
    await run(testUser.token);
  },

  // eslint-disable-next-line no-empty-pattern
  apiRequest: async ({}, run) => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });
    await run(apiContext);
    await apiContext.dispose();
  },
});
