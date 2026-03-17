import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { adminAuth } from "../middleware/auth";
import { packets, pdfJobs } from "../db/schema";
import type { AppBindings } from "../types";

const pdf = new Hono<AppBindings>();

// All PDF routes require admin auth
pdf.use("/*", adminAuth);

// Trigger PDF generation
pdf.post("/packets/:id/pdf", async (c) => {
  const db = c.get("db");
  const packetId = c.req.param("id");

  // Verify the packet exists
  const [packet] = await db
    .select({ id: packets.id, student_name: packets.student_name })
    .from(packets)
    .where(eq(packets.id, packetId));

  if (!packet) {
    return c.json({ error: "Packet not found" }, 404);
  }

  // Check if there's already a generating job
  const [existingJob] = await db
    .select()
    .from(pdfJobs)
    .where(eq(pdfJobs.packet_id, packetId));

  if (existingJob?.status === "generating" || existingJob?.status === "pending") {
    return c.json({ error: "PDF generation already in progress", status: existingJob.status }, 409);
  }

  // Derive the base URL from the incoming request
  const origin = new URL(c.req.url).origin;

  // Upsert the pdf_jobs row
  if (existingJob) {
    await db
      .update(pdfJobs)
      .set({
        status: "pending",
        error_message: null,
        completed_at: null,
        workflow_id: null,
      })
      .where(eq(pdfJobs.packet_id, packetId));
  } else {
    await db.insert(pdfJobs).values({
      packet_id: packetId,
      status: "pending",
    });
  }

  // Start the Workflow
  const instance = await c.env.PDF_WORKFLOW.create({
    params: { packetId, baseUrl: origin },
  });

  // Store the workflow instance ID
  await db
    .update(pdfJobs)
    .set({ workflow_id: instance.id })
    .where(eq(pdfJobs.packet_id, packetId));

  return c.json({ status: "pending", workflow_id: instance.id }, 202);
});

// Download the generated PDF
pdf.get("/packets/:id/pdf", async (c) => {
  const db = c.get("db");
  const packetId = c.req.param("id");

  // Get the PDF job
  const [job] = await db
    .select()
    .from(pdfJobs)
    .where(eq(pdfJobs.packet_id, packetId));

  if (!job || job.status !== "ready" || !job.r2_key) {
    return c.json({ error: "PDF not available" }, 404);
  }

  // Get the packet for the filename
  const [packet] = await db
    .select({ student_name: packets.student_name })
    .from(packets)
    .where(eq(packets.id, packetId));

  // Fetch from R2
  const object = await c.env.PDF_BUCKET.get(job.r2_key);
  if (!object) {
    return c.json({ error: "PDF file not found in storage" }, 404);
  }

  // Create a sanitized filename
  const safeName = (packet?.student_name ?? "student")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}-temple-prep.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
});

export { pdf };
