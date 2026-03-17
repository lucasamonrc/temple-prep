-- PDF generation job tracking
CREATE TABLE IF NOT EXISTS pdf_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id TEXT NOT NULL UNIQUE REFERENCES packets(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  r2_key TEXT,
  workflow_id TEXT,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pdf_jobs_packet_id ON pdf_jobs(packet_id);
CREATE INDEX IF NOT EXISTS idx_pdf_jobs_status ON pdf_jobs(status);
