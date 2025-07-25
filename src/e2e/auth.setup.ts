import { expect, test as setup } from "@playwright/test";
import path from "node:path";

const authFile = path.join(
  import.meta.dirname,
  "../../../playwright/.auth/user.json",
);

setup("authenticate", async ({ page }) => {
  // Perform authentication steps.
  await page.goto("/auth/login");
  await page.getByRole("textbox", { name: "E-mail" }).click();
  await page.getByRole("textbox", { name: "E-mail" }).fill("e2e@test.com");
  await page.getByRole("textbox", { name: "Hasło" }).click();
  await page.getByRole("textbox", { name: "Hasło" }).fill("e2etests");
  await page.getByRole("button", { name: "Kontynuuj" }).click();
  await page.waitForURL("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Panel organizatora" }),
  ).toBeVisible();

  // Save the authentication state to a file.
  await page.context().storageState({ path: authFile });
});
