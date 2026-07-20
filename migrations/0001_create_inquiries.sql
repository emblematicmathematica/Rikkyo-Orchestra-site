CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  form_type TEXT NOT NULL CHECK (form_type IN ('support', 'performance', 'tickets')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  support_type TEXT,
  event_name TEXT,
  desired_date TEXT,
  venue TEXT,
  ensemble TEXT,
  ticket_topic TEXT,
  concert_name TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed'))
);

CREATE INDEX IF NOT EXISTS inquiries_created_at_idx
  ON inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS inquiries_status_idx
  ON inquiries (status, created_at DESC);
