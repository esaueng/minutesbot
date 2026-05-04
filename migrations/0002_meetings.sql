CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  calendar_uid TEXT,
  subject TEXT,
  organizer_email TEXT,
  organizer_name TEXT,
  teams_join_url TEXT,
  start_time TEXT,
  end_time TEXT,
  status TEXT NOT NULL,
  attendee_bot_id TEXT,
  attendee_bot_state TEXT,
  attendee_transcription_state TEXT,
  attendee_recording_state TEXT,
  attendee_last_event_at TEXT,
  transcript_status TEXT,
  summary_status TEXT,
  latest_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT,
  domain TEXT,
  summary_eligible INTEGER NOT NULL DEFAULT 0,
  exclusion_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE INDEX IF NOT EXISTS idx_meetings_calendar_uid ON meetings(calendar_uid);
CREATE INDEX IF NOT EXISTS idx_attendees_meeting_id ON attendees(meeting_id);
