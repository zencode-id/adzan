-- Migration 0004: Fix theme_assets schema
-- Add theme_local_id to theme_assets table to match worker code expectations

ALTER TABLE theme_assets ADD COLUMN theme_local_id TEXT;
ALTER TABLE theme_assets ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Create index for theme_local_id for better query performance
CREATE INDEX IF NOT EXISTS idx_theme_assets_local_id ON theme_assets(theme_local_id);

-- Log event
INSERT INTO system_events (title, description, event_type)
VALUES ('Schema updated', 'Added theme_local_id to theme_assets', 'info');
