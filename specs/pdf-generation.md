# PDF Generation Feature Spec

## Overview

Instructors can generate a PDF snapshot of any student packet from the admin dashboard. PDF generation happens asynchronously in the background using Cloudflare Workflows, Browser Rendering, and R2 storage. The instructor is notified in-app when the PDF is ready to download.

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| PDF Generation | Cloudflare Browser Rendering (headless Chromium) |
| Storage | Cloudflare R2 bucket |
| Background Processing | Cloudflare Workflows |
| Notification | Polling from dashboard (every 3 seconds) |
| Content | Full packet snapshot (all 13 sections, current state) |
| Access | Admin only |
| Regeneration | Explicit re-generate button + "Outdated" indicator |
| Render Target | New `/print/:uuid` route (print-optimized) |
| Print Route Data | Fetches from existing public `/api/packets/:uuid` |
| Schema | New `pdf_jobs` table (FK to packets, CASCADE delete) |
| Dashboard UI | Status badge + action buttons on existing packet cards |

## New Cloudflare Bindings

- `BROWSER` — Browser Rendering (headless Chromium)
- `PDF_BUCKET` — R2 bucket for storing generated PDFs
- `PDF_WORKFLOW` — Workflow binding

## Database: `pdf_jobs` Table

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Autoincrement |
| packet_id | TEXT UNIQUE FK | References packets(id) ON DELETE CASCADE |
| status | TEXT NOT NULL | 'pending', 'generating', 'ready', 'error' |
| r2_key | TEXT | e.g. 'pdfs/{packet_id}.pdf' |
| workflow_id | TEXT | Cloudflare Workflow instance ID |
| error_message | TEXT | Error details on failure |
| created_at | TEXT | Default datetime('now') |
| completed_at | TEXT | Set when status becomes 'ready' |

One row per packet (UNIQUE on packet_id). "Outdated" is derived client-side by comparing `packets.updated_at > pdf_jobs.completed_at`.

## Workflow Steps

1. Upsert `pdf_jobs` row with status `'generating'`
2. Launch Browser Rendering → navigate to `/print/:uuid`
3. Wait for page render → call `page.pdf()` with print options
4. Upload PDF bytes to R2 with key `pdfs/{packet_id}.pdf`
5. Update `pdf_jobs` → status `'ready'`, set `completed_at`
6. On error → status `'error'`, set `error_message`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/packets/:id/pdf` | Bearer | Trigger PDF generation (start workflow). Returns 202. |
| GET | `/api/admin/packets/:id/pdf` | Bearer | Download generated PDF (stream from R2). Returns 404 if not ready. |

Existing `GET /api/admin/packets` is updated to LEFT JOIN pdf_jobs and include `pdf_status` and `pdf_generated_at` per packet.

## Frontend

### New Route: `/print/:uuid`

Print-optimized, read-only rendering of the full packet:
- All 13 sections rendered with current data
- No section navigation bar
- No interactive elements (checkboxes, textareas, date inputs all disabled/static)
- CSS page breaks between major sections
- Uses the existing `StudentPacketView` component with `readOnly` + `printMode` props

### Dashboard Changes

Each packet card gains:
- **Status badge** (`data-testid="pdf-status-{id}"`): None / Generating... / Ready / Outdated / Error
- **Action button**: Generate PDF / Download PDF / Regenerate / Retry (`data-testid="pdf-generate-{id}"` or `pdf-download-{id}"` or `pdf-regenerate-{id}"`)

### Polling

When any packet has `pending` or `generating` status, the dashboard polls `GET /api/admin/packets` every 3 seconds. Polling stops when no packets are in a pending state.

## Acceptance Criteria

### Print Route

- **AC-24**: `/print/:uuid` renders all 13 packet sections with correct data
- **AC-25**: Print route has no interactive elements, no nav bar

### Admin Dashboard — PDF Controls

- **AC-26**: "Generate PDF" button visible when no PDF exists
- **AC-27**: Clicking "Generate PDF" triggers POST to `/api/admin/packets/:id/pdf`
- **AC-28**: "Generating..." badge shown while in progress
- **AC-29**: "Download PDF" button appears when status is `ready`
- **AC-30**: "Outdated" badge + "Regenerate" button when packet updated after PDF generated
- **AC-31**: "Error" badge + "Retry" button on failure

### API Endpoints

- **AC-32**: POST creates pdf_job, returns 202 with `{ status, workflow_id }`
- **AC-33**: GET returns 404 when not ready, streams PDF when ready
- **AC-34**: Packet list includes `pdf_status` and `pdf_generated_at`

### Cleanup

- **AC-35**: Deleting a packet cascades to pdf_jobs and cleans up R2
