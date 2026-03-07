import { test, expect } from "@playwright/test";
import { TEST_PIN, TEST_PACKET } from "./fixtures/test-data";

// Admin tests must run in order since they build on each other
test.describe.configure({ mode: "serial" });

let createdPacketId: string;

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

  test("AC-03: Create Student Packet", async ({ page, request }) => {
    // Login
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/admin/dashboard");

    await page.getByRole("link", { name: /create/i }).click();
    await expect(page).toHaveURL("/admin/packets/new");

    await page.getByPlaceholder("e.g., John Smith").fill("Test AC03 Student");
    await page.getByPlaceholder("Bishop...").fill("Bishop Test");

    await page.getByRole("button", { name: /create packet/i }).click();

    // Should redirect back to dashboard
    await expect(page).toHaveURL("/admin/dashboard");

    // Packet should appear in the list
    await expect(page.getByText("Test AC03 Student").first()).toBeVisible();

    // Get the packet ID from the API for cleanup
    const listRes = await request.get("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
    const data = await listRes.json();
    const packet = data.packets.find(
      (p: { student_name: string }) => p.student_name === "Test AC03 Student",
    );
    createdPacketId = packet?.id;
  });

  test("AC-04: Edit Student Packet", async ({ page }) => {
    test.skip(!createdPacketId, "No packet created in AC-03");

    // Login first
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/admin/dashboard");

    // Navigate directly to the edit page for the created packet
    await page.goto(`/admin/packets/${createdPacketId}`);

    // Wait for form to load with existing data
    await expect(page.getByPlaceholder("e.g., John Smith")).toHaveValue(
      "Test AC03 Student",
      { timeout: 10000 },
    );

    const nameInput = page.getByPlaceholder("e.g., John Smith");
    await nameInput.clear();
    await nameInput.fill("Test AC04 Edited");

    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page).toHaveURL("/admin/dashboard");
    await expect(page.getByText("Test AC04 Edited").first()).toBeVisible();
  });

  test("AC-05: Delete Student Packet", async ({ page, request }) => {
    test.skip(!createdPacketId, "No packet created in AC-03");

    // Delete via API (more reliable than UI for test cleanup)
    await request.delete(`/api/admin/packets/${createdPacketId}`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });

    // Login and verify it's gone
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();

    // The deleted packet should not appear
    await expect(page.getByText("Test AC04 Edited")).not.toBeVisible();

    // Verify via student URL
    await page.goto(`/p/${createdPacketId}`);
    await expect(
      page.getByRole("heading", { name: "Packet Not Found" }),
    ).toBeVisible();
  });
});
