import { test, expect } from "@playwright/test";
import { TEST_PIN } from "./fixtures/test-data";

const LOOKUP_STUDENT = {
  student_name: "Lookup Testuser",
  student_pin: "7890",
};

let packetUuid: string;

test.describe("Student Lookup Page", () => {
  // Create a packet via API before all tests
  test.beforeAll(async ({ request }) => {
    const createRes = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: LOOKUP_STUDENT,
    });
    expect(createRes.ok()).toBeTruthy();
    const body = await createRes.json();
    packetUuid = body.id;
  });

  // Clean up after all tests
  test.afterAll(async ({ request }) => {
    if (packetUuid) {
      await request.delete(`/api/admin/packets/${packetUuid}`, {
        headers: { Authorization: `Bearer ${TEST_PIN}` },
      });
    }
  });

  test("AC-18: Correct credentials redirect to packet", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("lookup-first-name").fill("Lookup");
    await page.getByTestId("lookup-last-name").fill("Testuser");
    await page.getByTestId("lookup-pin").fill(LOOKUP_STUDENT.student_pin);
    await page.getByTestId("lookup-submit").click();

    // Should redirect to a student packet page
    await expect(page).toHaveURL(/\/p\/[0-9a-f-]+/);

    // Verify the student name is visible on the packet
    await expect(page.getByText(LOOKUP_STUDENT.student_name)).toBeVisible({ timeout: 10000 });
  });

  test("AC-19: Wrong PIN shows error", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("lookup-first-name").fill("Lookup");
    await page.getByTestId("lookup-last-name").fill("Testuser");
    await page.getByTestId("lookup-pin").fill("9999");
    await page.getByTestId("lookup-submit").click();

    await expect(page.getByTestId("lookup-error")).toBeVisible();
    await expect(page.getByTestId("lookup-error")).toContainText(
      "No packet found",
    );
    await expect(page).toHaveURL("/");
  });

  test("AC-20: Wrong name shows error", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("lookup-first-name").fill("Jane");
    await page.getByTestId("lookup-last-name").fill("Nobody");
    await page.getByTestId("lookup-pin").fill(LOOKUP_STUDENT.student_pin);
    await page.getByTestId("lookup-submit").click();

    await expect(page.getByTestId("lookup-error")).toBeVisible();
    await expect(page.getByTestId("lookup-error")).toContainText(
      "No packet found",
    );
  });

  test("AC-21: Case-insensitive name matching", async ({ page }) => {
    await page.goto("/");

    // Use all lowercase
    await page.getByTestId("lookup-first-name").fill("lookup");
    await page.getByTestId("lookup-last-name").fill("testuser");
    await page.getByTestId("lookup-pin").fill(LOOKUP_STUDENT.student_pin);
    await page.getByTestId("lookup-submit").click();

    // Should still redirect to a packet page
    await expect(page).toHaveURL(/\/p\/[0-9a-f-]+/);
  });

  test("AC-22: Admin - PIN field visible in packet form", async ({ page }) => {
    // Login
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/admin/dashboard");

    // Navigate to edit form for the packet created in beforeAll
    await page.goto(`/admin/packets/${packetUuid}`);

    // Wait for form to load with existing data
    await expect(page.getByPlaceholder("e.g., John Smith")).toHaveValue(
      LOOKUP_STUDENT.student_name,
      { timeout: 10000 },
    );

    // Verify PIN input exists and is populated
    const pinInput = page.getByTestId("student-pin-input");
    await expect(pinInput).toBeVisible();
    await expect(pinInput).toHaveValue(LOOKUP_STUDENT.student_pin);
  });

  test("AC-23: Admin - PIN visible on dashboard", async ({ page }) => {
    // Login
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/admin/dashboard");

    // At least one packet PIN should be visible
    const pinDisplay = page.getByTestId("packet-pin").first();
    await expect(pinDisplay).toBeVisible();
    // Should contain "PIN:" prefix and a numeric value
    await expect(pinDisplay).toContainText(/PIN:\s*\d{4,6}/);
  });
});
