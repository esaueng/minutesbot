CREATE TABLE IF NOT EXISTS summaries (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  r2_key TEXT,
  summary_json TEXT NOT NULL,
  model TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE INDEX IF NOT EXISTS idx_summaries_meeting_id ON summaries(meeting_id);
