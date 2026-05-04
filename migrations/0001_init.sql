CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS allowed_domains (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
