-- Migration: Add adzan_settings table
-- Created: 2026-01-28

CREATE TABLE IF NOT EXISTS adzan_settings (
  id INTEGER PRIMARY KEY,
  enabled INTEGER DEFAULT 1,
  volume INTEGER DEFAULT 80,
  use_subuh_adzan INTEGER DEFAULT 1,
  tarhim_enabled INTEGER DEFAULT 1,
  tarhim_minutes_before_imsak INTEGER DEFAULT 0,
  caution_enabled INTEGER DEFAULT 1,
  caution_seconds_before_adzan INTEGER DEFAULT 60,
  caution_seconds_before_imsak INTEGER DEFAULT 60,
  enabled_imsak INTEGER DEFAULT 0,
  enabled_subuh INTEGER DEFAULT 1,
  enabled_dzuhur INTEGER DEFAULT 1,
  enabled_ashar INTEGER DEFAULT 1,
  enabled_maghrib INTEGER DEFAULT 1,
  enabled_isya INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default row
INSERT INTO adzan_settings (id) VALUES (1);
