-- Refactor Theme Identifiers to Unique Strings
-- Version: 0005

-- Drop old tables to recreate with new schema
DROP TABLE IF EXISTS theme_assets;
DROP TABLE IF EXISTS theme_schedules;
DROP TABLE IF EXISTS theme_settings;
DROP TABLE IF EXISTS themes;

-- Recreate Themes Table with TEXT ID
CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  preview_image_url TEXT,
  is_builtin INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Recreate Theme Settings Table
CREATE TABLE theme_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id TEXT NOT NULL,

  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  text_color TEXT,
  text_secondary_color TEXT,

  bg_type TEXT,
  bg_color TEXT,
  bg_gradient TEXT,
  bg_image_url TEXT,
  bg_overlay_color TEXT,
  bg_overlay_opacity REAL,

  font_family TEXT,
  clock_font_size TEXT,
  clock_font_weight TEXT,
  header_font_size TEXT,
  prayer_font_size TEXT,

  layout_type TEXT,
  show_header INTEGER,
  show_date INTEGER,
  show_hijri_date INTEGER,
  show_countdown INTEGER,
  show_quote INTEGER,
  show_prayer_bar INTEGER,

  show_ornaments INTEGER,
  ornament_style TEXT,
  ornament_opacity REAL,

  clock_style TEXT,
  clock_separator TEXT,
  clock_show_seconds INTEGER,

  clock_animation TEXT,
  transition_type TEXT,
  transition_duration INTEGER,

  prayer_bar_style TEXT,
  prayer_bar_position TEXT,
  highlight_current_prayer INTEGER,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- Recreate Theme Schedules Table
CREATE TABLE theme_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id TEXT NOT NULL,
  name TEXT,
  schedule_type TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  prayer_trigger TEXT,
  offset_minutes INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  start_date TEXT,
  end_date TEXT,
  days_of_week TEXT DEFAULT '[0,1,2,3,4,5,6]',
  priority INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- Recreate Theme Assets Table
CREATE TABLE theme_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  local_id TEXT,
  theme_id TEXT,
  theme_local_id TEXT,
  asset_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  position TEXT DEFAULT 'center',
  position_x TEXT,
  position_y TEXT,
  width TEXT,
  height TEXT,
  z_index INTEGER DEFAULT 0,
  opacity REAL DEFAULT 1.0,
  animation TEXT DEFAULT 'none',
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- Insert Built-in Themes with String IDs
INSERT INTO themes (id, name, slug, description, is_builtin, is_active)
VALUES
('emerald-classic', 'Emerald Classic', 'emerald-classic', 'Tema hijau klasik dengan nuansa islami yang elegan', 1, 1),
('sunset-warm', 'Sunset Warm', 'sunset-warm', 'Tema hangat untuk waktu Maghrib', 1, 1),
('night-sky', 'Night Sky', 'night-sky', 'Tema malam dengan nuansa biru gelap', 1, 1),
('minimalist-white', 'Minimalist White', 'minimalist-white', 'Tema minimalis putih bersih', 1, 1),
('ramadan-kareem', 'Ramadan Kareem', 'ramadan-kareem', 'Tema spesial Ramadan', 1, 1);

-- Update mosque_settings fallback if needed
UPDATE mosque_settings SET theme_id = 'emerald-classic' WHERE theme_id = 'emerald';
