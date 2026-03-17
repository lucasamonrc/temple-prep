import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import puppeteer from "@cloudflare/puppeteer";
import type { Env, PdfWorkflowParams } from "../types";

export class PdfGenerationWorkflow extends WorkflowEntrypoint<Env, PdfWorkflowParams> {
  async run(event: WorkflowEvent<PdfWorkflowParams>, step: WorkflowStep) {
    const { packetId, baseUrl } = event.payload;

    // Step 1: Mark the job as generating
    await step.do("update-status-generating", async () => {
      await this.env.DB.prepare(
        "UPDATE pdf_jobs SET status = 'generating' WHERE packet_id = ?",
      )
        .bind(packetId)
        .run();
    });

    // Step 2: Generate the PDF via Browser Rendering and upload to R2
    // Combined into one step to avoid serializing large binary data between steps
    const r2Key = await step.do(
      "generate-and-upload-pdf",
      { retries: { limit: 2, delay: "5 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      async () => {
        const browser = await puppeteer.launch(this.env.BROWSER);
        try {
          const page = await browser.newPage();

          // Set a desktop viewport for print rendering
          await page.setViewport({ width: 1280, height: 900 });

          // Navigate to the print-optimized route
          await page.goto(`${baseUrl}/print/${packetId}`, {
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          // Generate PDF with print-friendly settings
          const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
          });

          // Upload to R2
          const key = `pdfs/${packetId}.pdf`;
          await this.env.PDF_BUCKET.put(key, pdfBuffer, {
            httpMetadata: { contentType: "application/pdf" },
          });

          return key;
        } finally {
          await browser.close();
        }
      },
    );

    // Step 3: Mark the job as ready
    await step.do("update-status-ready", async () => {
      await this.env.DB.prepare(
        "UPDATE pdf_jobs SET status = 'ready', r2_key = ?, completed_at = datetime('now') WHERE packet_id = ?",
      )
        .bind(r2Key, packetId)
        .run();
    });

    return { packetId, r2Key, status: "ready" };
  }
}
