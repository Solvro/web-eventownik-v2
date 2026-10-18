/* eslint-disable no-console */
import { test as setup } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import { API_URL } from "./api-helpers";

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  token: string;
}

const authFile = path.join(process.cwd(), "test-results/.auth/user.json");
const testDataFile = path.join(process.cwd(), "test-results/test-user.json");

setup("create test user", async ({ page }) => {
  const timestamp = Date.now();
  const testUser: TestUser = {
    email: `e2e-test-${timestamp.toString()}@test.local`,
    password: "e2etestpassword123",
    firstName: "E2E",
    lastName: "Test",
    token: "",
  };

  console.log("[setup] Creating test user: %s", testUser.email);

  await page.goto("/auth/register");
  await page.getByPlaceholder("E-mail").fill(testUser.email);
  await page.getByPlaceholder("Hasło").fill(testUser.password);
  await page.getByPlaceholder("Imię").fill(testUser.firstName);
  await page.getByPlaceholder("Nazwisko").fill(testUser.lastName);
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Kontynuuj" }).click();
  await page.waitForURL("/dashboard/*");

  console.log("[setup] User registered via UI, obtaining token via API");

  // get token via login API (registration uses server action, can't intercept)
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Login API failed: ${await loginResponse.text()}`);
  }

  const loginData = (await loginResponse.json()) as { token: string };
  testUser.token = loginData.token;

  console.log("[setup] Token obtained successfully");

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
  fs.writeFileSync(testDataFile, JSON.stringify(testUser, null, 2));

  console.log("[setup] Auth state saved to: %s", authFile);
});
