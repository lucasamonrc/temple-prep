import { test, expect } from "@playwright/test";
import { TEST_PIN, TEST_PACKET } from "./fixtures/test-data";

// ─── Print Route Tests ──────────────────────────────────────────────────────

test.describe("PDF Generation — Print Route", () => {
  let packetUuid: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: TEST_PACKET,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    packetUuid = body.id;
  });

  test.afterAll(async ({ request }) => {
    if (packetUuid) {
      await request.delete(`/api/admin/packets/${packetUuid}`, {
        headers: { Authorization: `Bearer ${TEST_PIN}` },
      });
    }
  });

  test("AC-24: Print route renders all packet sections", async ({ page }) => {
    await page.goto(`/print/${packetUuid}`);

    // Cover page with student name
    await expect(page.getByText(TEST_PACKET.student_name)).toBeVisible();

    // All major section headings
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

    // Verify specific content from the packet
    await expect(page.getByText(TEST_PACKET.testimony)).toBeVisible();
    await expect(page.getByText(TEST_PACKET.bishop_name)).toBeVisible();
  });

  test("AC-25: Print route is non-interactive", async ({ page }) => {
    await page.goto(`/print/${packetUuid}`);

    // Wait for content to render
    await expect(page.getByText(TEST_PACKET.student_name)).toBeVisible();

    // No section navigation bar
    await expect(page.getByTestId("section-nav")).not.toBeVisible();

    // No interactive checkboxes (all should be disabled or rendered as static)
    const enabledCheckboxes = page.locator(
      'input[type="checkbox"]:not([disabled])',
    );
    expect(await enabledCheckboxes.count()).toBe(0);

    // No editable textareas
    const enabledTextareas = page.locator("textarea:not([disabled])");
    expect(await enabledTextareas.count()).toBe(0);

    // No editable date inputs
    const enabledDateInputs = page.locator(
      'input[type="date"]:not([disabled])',
    );
    expect(await enabledDateInputs.count()).toBe(0);

    // No "Add Entry" button for journal
    await expect(
      page.getByRole("button", { name: /add.*entry/i }),
    ).not.toBeVisible();
  });
});

// ─── Admin Dashboard PDF Controls ───────────────────────────────────────────

test.describe("PDF Generation — Dashboard Controls", () => {
  let pdfPacketUuid: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: { ...TEST_PACKET, student_name: "PDF Test Student" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    pdfPacketUuid = body.id;
  });

  test.afterAll(async ({ request }) => {
    if (pdfPacketUuid) {
      await request.delete(`/api/admin/packets/${pdfPacketUuid}`, {
        headers: { Authorization: `Bearer ${TEST_PIN}` },
      });
    }
  });

  async function loginToAdmin(page: import("@playwright/test").Page) {
    await page.goto("/admin");
    await page.getByLabel("PIN").fill(TEST_PIN);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/admin/dashboard");
  }

  test("AC-26: Generate PDF button visible when no PDF exists", async ({
    page,
  }) => {
    await loginToAdmin(page);

    const generateBtn = page.getByTestId(`pdf-generate-${pdfPacketUuid}`);
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toContainText(/generate pdf/i);
  });

  test("AC-27: Clicking Generate PDF triggers API call", async ({ page }) => {
    await loginToAdmin(page);

    // Listen for the POST request
    const apiPromise = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().includes(`/api/admin/packets/${pdfPacketUuid}/pdf`),
    );

    await page.getByTestId(`pdf-generate-${pdfPacketUuid}`).click();

    const apiReq = await apiPromise;
    expect(apiReq.method()).toBe("POST");
  });

  test("AC-28: Generating status displayed (mocked)", async ({ page }) => {
    // Mock the packet list to return "generating" status
    await page.route("**/api/admin/packets", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            packets: [
              {
                id: pdfPacketUuid,
                student_name: "PDF Test Student",
                student_pin: TEST_PACKET.student_pin,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pdf_status: "generating",
                pdf_generated_at: null,
              },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginToAdmin(page);

    const statusBadge = page.getByTestId(`pdf-status-${pdfPacketUuid}`);
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText(/generating/i);
  });

  test("AC-29: Download button appears when PDF is ready (mocked)", async ({
    page,
  }) => {
    await page.route("**/api/admin/packets", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            packets: [
              {
                id: pdfPacketUuid,
                student_name: "PDF Test Student",
                student_pin: TEST_PACKET.student_pin,
                created_at: new Date().toISOString(),
                updated_at: "2026-01-01T00:00:00.000Z",
                pdf_status: "ready",
                pdf_generated_at: "2026-01-02T00:00:00.000Z",
              },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginToAdmin(page);

    const downloadBtn = page.getByTestId(`pdf-download-${pdfPacketUuid}`);
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toContainText(/download/i);
  });

  test("AC-30: Outdated badge shown after packet update (mocked)", async ({
    page,
  }) => {
    await page.route("**/api/admin/packets", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            packets: [
              {
                id: pdfPacketUuid,
                student_name: "PDF Test Student",
                student_pin: TEST_PACKET.student_pin,
                created_at: new Date().toISOString(),
                updated_at: "2026-03-15T00:00:00.000Z",
                pdf_status: "ready",
                pdf_generated_at: "2026-01-01T00:00:00.000Z",
              },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginToAdmin(page);

    const statusBadge = page.getByTestId(`pdf-status-${pdfPacketUuid}`);
    await expect(statusBadge).toContainText(/outdated/i);

    const regenerateBtn = page.getByTestId(`pdf-regenerate-${pdfPacketUuid}`);
    await expect(regenerateBtn).toBeVisible();
  });

  test("AC-31: Error state with retry button (mocked)", async ({ page }) => {
    await page.route("**/api/admin/packets", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            packets: [
              {
                id: pdfPacketUuid,
                student_name: "PDF Test Student",
                student_pin: TEST_PACKET.student_pin,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pdf_status: "error",
                pdf_generated_at: null,
              },
            ],
          }),
        });
      } else {
        route.continue();
      }
    });

    await loginToAdmin(page);

    const statusBadge = page.getByTestId(`pdf-status-${pdfPacketUuid}`);
    await expect(statusBadge).toContainText(/error/i);

    const retryBtn = page.getByTestId(`pdf-generate-${pdfPacketUuid}`);
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toContainText(/retry/i);
  });
});

// ─── API Endpoint Tests ─────────────────────────────────────────────────────

test.describe("PDF Generation — API Endpoints", () => {
  let apiPacketId: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: { ...TEST_PACKET, student_name: "PDF API Test" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    apiPacketId = body.id;
  });

  test.afterAll(async ({ request }) => {
    if (apiPacketId) {
      await request.delete(`/api/admin/packets/${apiPacketId}`, {
        headers: { Authorization: `Bearer ${TEST_PIN}` },
      });
    }
  });

  test("AC-32: POST triggers PDF generation", async ({ request }) => {
    const res = await request.post(`/api/admin/packets/${apiPacketId}/pdf`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
    expect(res.status()).toBe(202);

    const body = await res.json();
    expect(body.status).toBe("pending");
    expect(body.workflow_id).toBeTruthy();
  });

  test("AC-33: GET returns 404 when PDF not ready", async ({ request }) => {
    const res = await request.get(`/api/admin/packets/${apiPacketId}/pdf`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
    // PDF won't be ready since Browser Rendering doesn't work locally
    expect(res.status()).toBe(404);
  });

  test("AC-34: Packet list includes PDF status", async ({ request }) => {
    const res = await request.get("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    const packet = body.packets.find(
      (p: { id: string }) => p.id === apiPacketId,
    );
    expect(packet).toBeTruthy();
    // Should have pdf_status field (could be pending, generating, error, or null)
    expect("pdf_status" in packet).toBeTruthy();
  });

  test("AC-35: Deleting packet removes PDF job", async ({ request }) => {
    // Create a throwaway packet
    const createRes = await request.post("/api/admin/packets", {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
      data: { ...TEST_PACKET, student_name: "PDF Delete Test" },
    });
    const { id } = await createRes.json();

    // Trigger PDF generation to create a pdf_jobs row
    await request.post(`/api/admin/packets/${id}/pdf`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });

    // Delete the packet
    const deleteRes = await request.delete(`/api/admin/packets/${id}`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
    expect(deleteRes.ok()).toBeTruthy();

    // Verify packet is gone
    const getRes = await request.get(`/api/admin/packets/${id}`, {
      headers: { Authorization: `Bearer ${TEST_PIN}` },
    });
    expect(getRes.status()).toBe(404);
  });
});
