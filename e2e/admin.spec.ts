import { test, expect } from "@playwright/test";
import { TEST_PIN, TEST_PACKET } from "./fixtures/test-data";

test.describe("Admin Portal", () => {
  test("AC-01: Admin Login - correct PIN redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/admin/dashboard");
  });

  test("AC-02: Admin Login - incorrect PIN shows error", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("PIN").fill("0000");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Invalid PIN")).toBeVisible();
    await expect(page).toHaveURL("/admin");
  });

  test.describe("Authenticated", () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto("/admin");
      await page.getByLabel("PIN").fill(TEST_PIN);
      await page.getByRole("button", { name: "Sign In" }).click();
      await expect(page).toHaveURL("/admin/dashboard");
    });

    test("AC-03: Create Student Packet", async ({ page }) => {
      await page.getByRole("link", { name: /create/i }).click();
      await expect(page).toHaveURL("/admin/packets/new");

      await page.getByLabel(/student name/i).fill(TEST_PACKET.student_name);
      await page.getByLabel(/bishop name/i).fill(TEST_PACKET.bishop_name);
      await page
        .getByLabel(/bishop phone/i)
        .fill(TEST_PACKET.bishop_phone);

      await page.getByRole("button", { name: /save/i }).click();

      // Should redirect back to dashboard
      await expect(page).toHaveURL("/admin/dashboard");
      // Packet should appear in the list
      await expect(
        page.getByText(TEST_PACKET.student_name),
      ).toBeVisible();
    });

    test("AC-04: Edit Student Packet", async ({ page }) => {
      // Assumes a packet already exists from AC-03
      await page.getByRole("link", { name: /edit/i }).first().click();

      const nameInput = page.getByLabel(/student name/i);
      await nameInput.clear();
      await nameInput.fill("Jane Doe");

      await page.getByRole("button", { name: /save/i }).click();
      await expect(page).toHaveURL("/admin/dashboard");
      await expect(page.getByText("Jane Doe")).toBeVisible();
    });

    test("AC-05: Delete Student Packet", async ({ page }) => {
      const packetName = page.getByText(TEST_PACKET.student_name).first();
      if (await packetName.isVisible()) {
        await page.getByRole("button", { name: /delete/i }).first().click();
        // Confirm deletion
        await page.getByRole("button", { name: /confirm/i }).click();
        await expect(packetName).not.toBeVisible();
      }
    });
  });
});
