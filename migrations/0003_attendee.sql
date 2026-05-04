CREATE TABLE IF NOT EXISTS attendee_connections (
  id TEXT PRIMARY KEY,
  base_url TEXT NOT NULL,
  api_key_ref TEXT NOT NULL,
  webhook_secret_ref TEXT,
  api_key_configured INTEGER NOT NULL DEFAULT 0,
  webhook_secret_configured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_tested',
  last_tested_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendee_webhook_events (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  meeting_id TEXT,
  attendee_bot_id TEXT,
  trigger TEXT NOT NULL,
  event_type TEXT,
  event_sub_type TEXT,
  payload TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE TABLE IF NOT EXISTS transcript_segments (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  attendee_bot_id TEXT,
  speaker_name TEXT,
  speaker_uuid TEXT,
  speaker_user_uuid TEXT,
  timestamp_ms INTEGER,
  duration_ms INTEGER,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_meeting_id ON attendee_webhook_events(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);
