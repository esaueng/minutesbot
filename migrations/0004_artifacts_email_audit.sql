CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  type TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE TABLE IF NOT EXISTS email_deliveries (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_email TEXT,
  event_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artifacts_meeting_id ON artifacts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_meeting_id ON email_deliveries(meeting_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
