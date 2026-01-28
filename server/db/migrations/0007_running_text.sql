-- Running Text Settings Migration
-- Add running text configuration to theme_settings

ALTER TABLE theme_settings ADD COLUMN show_running_text INTEGER DEFAULT 1;
ALTER TABLE theme_settings ADD COLUMN running_text_speed INTEGER DEFAULT 50; -- pixels per second (30=slow, 50=normal, 80=fast)
ALTER TABLE theme_settings ADD COLUMN running_text_bg_color TEXT DEFAULT NULL; -- null = use primary color
ALTER TABLE theme_settings ADD COLUMN running_text_text_color TEXT DEFAULT NULL; -- null = use bg color
ALTER TABLE theme_settings ADD COLUMN running_text_font_size TEXT DEFAULT '1.25rem';
ALTER TABLE theme_settings ADD COLUMN running_text_font_family TEXT DEFAULT 'inherit'; -- inherit from theme or custom
ALTER TABLE theme_settings ADD COLUMN running_text_spacing REAL DEFAULT 0.75; -- spacing in rem (0.5=rapat, 0.75=normal, 1=renggang)
ALTER TABLE theme_settings ADD COLUMN running_text_separator TEXT DEFAULT '•'; -- separator character between items

-- Running Text Items Table (custom text items)
CREATE TABLE IF NOT EXISTS running_text_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  show_icon INTEGER DEFAULT 1,
  icon TEXT DEFAULT '📢',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default running text items
INSERT INTO running_text_items (content, display_order, icon) VALUES 
  ('Selamat datang di Masjid kami', 1, '🕌'),
  ('Jagalah kebersihan masjid', 2, '🧹'),
  ('Matikan HP saat sholat', 3, '📵'),
  ('Rapikan sandal di rak yang tersedia', 4, '👟');
