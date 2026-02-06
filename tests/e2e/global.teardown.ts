/* eslint-disable no-console */
import { test as teardown } from "@playwright/test";
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

const testDataFile = path.join(process.cwd(), "test-results/test-user.json");

teardown("cleanup test data", async () => {
  if (!fs.existsSync(testDataFile)) {
    console.log("[teardown] No test user data found, skipping cleanup");
    return;
  }

  const testUser: TestUser = JSON.parse(
    fs.readFileSync(testDataFile, "utf8"),
  ) as TestUser;

  console.log("[teardown] Cleaning up events for user: %s", testUser.email);

  const eventsResponse = await fetch(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${testUser.token}`,
    },
  });

  if (eventsResponse.ok) {
    const events = (await eventsResponse.json()) as { id: number }[];

    for (const event of events) {
      console.log("[teardown] Deleting event ID: %s", event.id.toString());
      await fetch(`${API_URL}/events/${event.id.toString()}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${testUser.token}`,
        },
      });
    }

    console.log("[teardown] Deleted %s events", events.length.toString());
  }

  // Delete the test user account
  console.log("[teardown] Deleting test user account...");

  const profileResponse = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${testUser.token}`,
    },
  });

  if (profileResponse.ok) {
    const profile = (await profileResponse.json()) as { id: number };

    const deleteResponse = await fetch(
      `${API_URL}/admins/${profile.id.toString()}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${testUser.token}`,
        },
      },
    );

    if (deleteResponse.ok) {
      console.log("[teardown] Test user deleted successfully");
    } else {
      console.log(
        "[teardown] Failed to delete user: %s",
        await deleteResponse.text(),
      );
    }
  } else {
    console.log("[teardown] Could not fetch user profile, skipping deletion");
  }

  fs.unlinkSync(testDataFile);

  console.log("[teardown] Cleanup complete");
});
