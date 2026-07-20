ALTER TABLE inquiries ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE inquiries ADD COLUMN notified_at TEXT;
ALTER TABLE inquiries ADD COLUMN notification_error TEXT;

CREATE INDEX IF NOT EXISTS inquiries_notification_status_idx
  ON inquiries (notification_status, created_at DESC);
