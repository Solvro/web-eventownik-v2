import { createEventViaApi, eventExistsViaApi } from "../../api-helpers";
import { expect, test } from "../../fixtures";

test("should delete an existing event", async ({
  page,
  apiRequest,
  authToken,
}) => {
  const event = await createEventViaApi(apiRequest, authToken);

  await page.goto(`/dashboard/events/${event.id.toString()}/settings`);

  await page.getByRole("button", { name: "Usuń wydarzenie" }).click();

  // Wait for modal confirmation button to appear
  const confirmButton = page.getByRole("button", { name: "Usuń" }).last();
  await confirmButton.waitFor({ state: "visible" });
  await confirmButton.click();

  await expect(
    page.getByText("Usunięto wydarzenie", { exact: true }),
  ).toBeVisible();

  const isEventPresent = await eventExistsViaApi(
    apiRequest,
    authToken,
    event.id,
  );
  expect(isEventPresent).toBe(false);
});
