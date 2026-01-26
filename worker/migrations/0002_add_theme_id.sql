-- Add theme_id to mosque_settings
ALTER TABLE mosque_settings ADD COLUMN theme_id TEXT DEFAULT 'emerald';

-- Update initial record
UPDATE mosque_settings SET theme_id = 'emerald' WHERE id = 1;

-- Log the event
INSERT INTO system_events (title, description, event_type)
VALUES ('Schema updated', 'Added theme_id support for display themes', 'info');
