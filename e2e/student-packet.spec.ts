import { test, expect } from "@playwright/test";
import { TEST_PIN, TEST_PACKET } from "./fixtures/test-data";

let packetUuid: string;

test.describe("Student Packet Page", () => {
  // Create a packet via API before all tests
  test.beforeAll(async ({ request }) => {
    const createRes = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: TEST_PACKET,
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

  test("AC-07: Student page loads with all sections", async ({ page }) => {
    await page.goto(`/p/${packetUuid}`);

    // Cover page with student name
    await expect(page.getByText(TEST_PACKET.student_name)).toBeVisible();

    // Key sections should be present (use headings to avoid ambiguity)
    await expect(
      page.getByRole("heading", { name: "Congratulations" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /instructor/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /path to the temple/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Your Temple Escort" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /heart and mind/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /approach the lord/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /temple experience/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /checklist/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /contacts/i }),
    ).toBeVisible();
  });

  test("AC-08: Invalid UUID shows not-found message", async ({ page }) => {
    await page.goto("/p/nonexistent-uuid-12345");
    await expect(
      page.getByRole("heading", { name: "Packet Not Found" }),
    ).toBeVisible();
  });

  test("AC-09: Goal setting - set date and mark complete", async ({
    page,
  }) => {
    await page.goto(`/p/${packetUuid}`);

    // Find the bishop interview goal row and set a date
    const bishopRow = page.getByTestId("goal-bishop_interview");
    await bishopRow.locator('input[type="date"]').fill("2026-04-15");
    await bishopRow.locator('input[type="date"]').blur();

    // Mark as complete
    await bishopRow.locator('input[type="checkbox"]').check();

    // Wait for save
    await page.waitForTimeout(500);

    // Reload and verify persistence
    await page.reload();
    const reloadedRow = page.getByTestId("goal-bishop_interview");
    await expect(reloadedRow.locator('input[type="date"]')).toHaveValue(
      "2026-04-15",
    );
    await expect(reloadedRow.locator('input[type="checkbox"]')).toBeChecked();
  });

  test("AC-10: Escort information persists", async ({ page }) => {
    await page.goto(`/p/${packetUuid}`);

    await page.getByLabel(/escort name/i).fill("Brother Johnson");
    await page.getByLabel(/escort phone/i).fill("(512) 555-9999");
    await page.getByLabel(/escort phone/i).blur();

    // Wait for debounced auto-save
    await page.waitForTimeout(1500);

    await page.reload();
    await expect(page.getByLabel(/escort name/i)).toHaveValue(
      "Brother Johnson",
    );
    await expect(page.getByLabel(/escort phone/i)).toHaveValue(
      "(512) 555-9999",
    );
  });

  test("AC-11: Reflection questions auto-save", async ({ page }) => {
    await page.goto(`/p/${packetUuid}`);

    const textarea = page.getByTestId("reflection-ask_lord");
    await textarea.fill("I want to ask about my family's future.");

    // Wait for debounced auto-save
    await page.waitForTimeout(1500);

    await page.reload();
    await expect(page.getByTestId("reflection-ask_lord")).toHaveValue(
      "I want to ask about my family's future.",
    );
  });

  test("AC-12: Temple journal entry creation and persistence", async ({
    page,
  }) => {
    await page.goto(`/p/${packetUuid}`);

    await page.getByRole("button", { name: /add.*entry/i }).click();
    await page
      .getByTestId("journal-content")
      .first()
      .fill("My first temple experience was beautiful and sacred.");

    await page.getByRole("button", { name: /^save$/i }).click();

    // Wait for save
    await page.waitForTimeout(500);

    await page.reload();
    await expect(
      page.getByText("My first temple experience was beautiful and sacred."),
    ).toBeVisible();
  });

  test("AC-13: To-do checklist - check items and verify progress", async ({
    page,
  }) => {
    await page.goto(`/p/${packetUuid}`);

    // Check off 3 todo items using their labels
    const checkboxes = page
      .locator("[data-testid^='todo-']")
      .locator('input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    // Wait for saves
    await page.waitForTimeout(500);

    // Verify progress indicator
    await expect(page.getByTestId("todo-progress")).toContainText("3");

    // Reload and verify persistence
    await page.reload();
    const reloadedCheckboxes = page
      .locator("[data-testid^='todo-']")
      .locator('input[type="checkbox"]');
    await expect(reloadedCheckboxes.nth(0)).toBeChecked();
    await expect(reloadedCheckboxes.nth(1)).toBeChecked();
    await expect(reloadedCheckboxes.nth(2)).toBeChecked();
  });

  test("AC-14: Spiritual resources - talks and scriptures with QR codes", async ({
    page,
  }) => {
    await page.goto(`/p/${packetUuid}`);

    // Verify talks
    await expect(
      page.getByText("The Temple and Your Spiritual Foundation"),
    ).toBeVisible();
    await expect(
      page.getByText("Accessing God's Power through Covenants"),
    ).toBeVisible();

    // Verify scriptures using links (more specific than general text)
    await expect(
      page.getByRole("link", { name: /Doctrine & Covenants 97:15/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Psalm 24:3/ }),
    ).toBeVisible();

    // Verify QR codes are rendered (svg elements)
    const qrCodes = page.locator("[data-testid^='qr-']");
    await expect(qrCodes.first()).toBeVisible();
    expect(await qrCodes.count()).toBeGreaterThanOrEqual(10); // 5 talks + 7 scriptures = 12
  });

  test("AC-15: Contacts section with tappable phone links", async ({
    page,
  }) => {
    await page.goto(`/p/${packetUuid}`);

    await expect(page.getByText(TEST_PACKET.bishop_name)).toBeVisible();
    // Phone should be a tel: link
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
  });
});

test.describe("Student Packet - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("AC-16: Mobile responsiveness - no horizontal scroll", async ({
    page,
    request,
  }) => {
    // Create a packet for this test
    const createRes = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: TEST_PACKET,
    });
    const { id } = await createRes.json();

    await page.goto(`/p/${id}`);

    // Wait for content to load
    await expect(page.getByText(TEST_PACKET.student_name)).toBeVisible();

    // Check that body doesn't overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // 1px tolerance

    // Cleanup
    await request.delete(`/api/admin/packets/${id}`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
  });
});
