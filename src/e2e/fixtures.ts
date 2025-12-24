/* eslint-disable no-empty-pattern */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { test as baseTest, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const accounts = [
  { username: "user1@e2e.test", password: "e2etests" },
  { username: "user2@e2e.test", password: "e2etests" },
  { username: "user3@e2e.test", password: "e2etests" },
  { username: "user4@e2e.test", password: "e2etests" },
];

function acquireAccount(id: number) {
  return accounts[id]; // index based on worker ID
}

export * from "@playwright/test";
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: async ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({
        storageState: undefined,
        baseURL: "http://localhost:3000",
      });

      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.
      const account = acquireAccount(id);

      // Perform authentication steps.
      await page.goto("/auth/login");
      await page.getByRole("textbox", { name: "E-mail" }).click();
      await page
        .getByRole("textbox", { name: "E-mail" })
        .fill(account.username);
      await page.getByRole("textbox", { name: "Hasło" }).click();
      await page.getByRole("textbox", { name: "Hasło" }).fill(account.password);
      await page.getByRole("button", { name: "Kontynuuj" }).click();
      await page.waitForURL("/dashboard");
      await expect(
        page.getByRole("heading", { name: "Panel organizatora" }),
      ).toBeVisible();

      // Save the authentication state to a file.
      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
});
