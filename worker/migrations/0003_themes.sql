-- ============================================
-- Theme System Migration for Cloudflare D1
-- Version: 0003
-- ============================================

-- ============================================
-- Themes Table (Master list of themes)
-- ============================================
CREATE TABLE IF NOT EXISTS themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  preview_image_url TEXT,
  is_builtin INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Theme Settings Table (Visual configuration)
-- ============================================
CREATE TABLE IF NOT EXISTS theme_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id INTEGER NOT NULL,
  
  -- Colors
  primary_color TEXT DEFAULT '#1B5E20',
  secondary_color TEXT DEFAULT '#4CAF50',
  accent_color TEXT DEFAULT '#FFD700',
  text_color TEXT DEFAULT '#FFFFFF',
  text_secondary_color TEXT DEFAULT '#E0E0E0',
  
  -- Background
  bg_type TEXT DEFAULT 'gradient',  -- solid, gradient, image
  bg_color TEXT DEFAULT '#0D3B0D',
  bg_gradient TEXT DEFAULT 'linear-gradient(135deg, #1B5E20 0%, #0D3B0D 100%)',
  bg_image_url TEXT,
  bg_overlay_color TEXT DEFAULT 'rgba(0,0,0,0.3)',
  bg_overlay_opacity REAL DEFAULT 0.3,
  
  -- Typography
  font_family TEXT DEFAULT 'Inter',
  clock_font_size TEXT DEFAULT '8rem',
  clock_font_weight TEXT DEFAULT '700',
  header_font_size TEXT DEFAULT '2rem',
  prayer_font_size TEXT DEFAULT '1.5rem',
  
  -- Layout
  layout_type TEXT DEFAULT 'classic',  -- classic, modern, minimal, fullscreen
  show_header INTEGER DEFAULT 1,
  show_date INTEGER DEFAULT 1,
  show_hijri_date INTEGER DEFAULT 1,
  show_countdown INTEGER DEFAULT 1,
  show_quote INTEGER DEFAULT 1,
  show_prayer_bar INTEGER DEFAULT 1,
  
  -- Ornaments
  show_ornaments INTEGER DEFAULT 1,
  ornament_style TEXT DEFAULT 'islamic',  -- islamic, geometric, floral, none
  ornament_opacity REAL DEFAULT 0.8,
  
  -- Clock style
  clock_style TEXT DEFAULT 'digital',  -- digital, analog
  clock_separator TEXT DEFAULT ':',
  clock_show_seconds INTEGER DEFAULT 1,
  
  -- Animation
  clock_animation TEXT DEFAULT 'none',  -- none, pulse, glow
  transition_type TEXT DEFAULT 'fade',  -- fade, slide, zoom, crossfade
  transition_duration INTEGER DEFAULT 500,
  
  -- Prayer bar style
  prayer_bar_style TEXT DEFAULT 'horizontal',  -- horizontal, vertical, grid
  prayer_bar_position TEXT DEFAULT 'bottom',  -- top, bottom
  highlight_current_prayer INTEGER DEFAULT 1,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- ============================================
-- Theme Schedules Table (Auto-switch rules)
-- ============================================
CREATE TABLE IF NOT EXISTS theme_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id INTEGER NOT NULL,
  name TEXT,
  
  -- Schedule type
  schedule_type TEXT NOT NULL,  -- time, prayer, date_range
  
  -- Time-based schedule
  start_time TEXT,  -- HH:MM format
  end_time TEXT,
  
  -- Prayer-based schedule
  prayer_trigger TEXT,  -- subuh, dzuhur, ashar, maghrib, isya
  offset_minutes INTEGER DEFAULT 0,  -- negative = before, positive = after
  duration_minutes INTEGER DEFAULT 30,
  
  -- Date range schedule
  start_date TEXT,  -- YYYY-MM-DD
  end_date TEXT,
  
  -- Days of week (JSON array: [0,1,2,3,4,5,6] where 0=Sunday)
  days_of_week TEXT DEFAULT '[0,1,2,3,4,5,6]',
  
  -- Priority (higher overrides lower)
  priority INTEGER DEFAULT 5,
  
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- ============================================
-- Theme Assets Table (Images, ornaments)
-- ============================================
CREATE TABLE IF NOT EXISTS theme_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id INTEGER NOT NULL,
  
  asset_type TEXT NOT NULL,  -- background, ornament, icon, illustration
  file_url TEXT NOT NULL,  -- R2 URL
  file_name TEXT,
  file_size INTEGER,  -- in bytes
  mime_type TEXT,
  
  -- Positioning
  position TEXT DEFAULT 'center',  -- top-left, top-right, bottom-left, bottom-right, center, full
  position_x TEXT,  -- CSS value like '10%' or '50px'
  position_y TEXT,
  width TEXT,  -- CSS value
  height TEXT,
  
  z_index INTEGER DEFAULT 1,
  opacity REAL DEFAULT 1.0,
  
  -- Animation (optional)
  animation TEXT,  -- none, float, pulse, rotate
  
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- ============================================
-- Add default_theme_id to mosque_settings
-- ============================================
ALTER TABLE mosque_settings ADD COLUMN default_theme_id INTEGER REFERENCES themes(id);

-- ============================================
-- Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_settings_theme ON theme_settings(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_schedules_theme ON theme_schedules(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_schedules_active ON theme_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_assets_theme ON theme_assets(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_assets_type ON theme_assets(asset_type);

-- ============================================
-- Insert Built-in Themes
-- ============================================

-- Theme 1: Emerald Classic
INSERT INTO themes (name, slug, description, is_builtin, is_active)
VALUES ('Emerald Classic', 'emerald-classic', 'Tema hijau klasik dengan nuansa islami yang elegan', 1, 1);

INSERT INTO theme_settings (
  theme_id, primary_color, secondary_color, accent_color, text_color,
  bg_type, bg_gradient, layout_type, ornament_style, transition_type
) VALUES (
  1, '#1B5E20', '#2E7D32', '#FFD700', '#FFFFFF',
  'gradient', 'linear-gradient(135deg, #1B5E20 0%, #0D3B0D 50%, #1B5E20 100%)',
  'classic', 'islamic', 'fade'
);

-- Theme 2: Sunset Warm
INSERT INTO themes (name, slug, description, is_builtin, is_active)
VALUES ('Sunset Warm', 'sunset-warm', 'Tema hangat untuk waktu Maghrib dengan gradasi sunset', 1, 1);

INSERT INTO theme_settings (
  theme_id, primary_color, secondary_color, accent_color, text_color,
  bg_type, bg_gradient, layout_type, ornament_style, transition_type
) VALUES (
  2, '#E65100', '#FF8F00', '#FFE082', '#FFFFFF',
  'gradient', 'linear-gradient(180deg, #FF6F00 0%, #E65100 50%, #BF360C 100%)',
  'classic', 'islamic', 'fade'
);

-- Theme 3: Night Sky
INSERT INTO themes (name, slug, description, is_builtin, is_active)
VALUES ('Night Sky', 'night-sky', 'Tema malam dengan nuansa biru gelap dan bintang', 1, 1);

INSERT INTO theme_settings (
  theme_id, primary_color, secondary_color, accent_color, text_color,
  bg_type, bg_gradient, layout_type, ornament_style, clock_animation, transition_type
) VALUES (
  3, '#1A237E', '#303F9F', '#FFD54F', '#FFFFFF',
  'gradient', 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #415A77 100%)',
  'modern', 'geometric', 'glow', 'fade'
);

-- Theme 4: Minimalist White
INSERT INTO themes (name, slug, description, is_builtin, is_active)
VALUES ('Minimalist White', 'minimalist-white', 'Tema minimalis putih bersih untuk tampilan modern', 1, 1);

INSERT INTO theme_settings (
  theme_id, primary_color, secondary_color, accent_color, text_color, text_secondary_color,
  bg_type, bg_color, layout_type, show_ornaments, clock_style, transition_type
) VALUES (
  4, '#1B5E20', '#4CAF50', '#1B5E20', '#1A1A1A', '#666666',
  'solid', '#FAFAFA',
  'minimal', 0, 'digital', 'slide'
);

-- Theme 5: Ramadan Special
INSERT INTO themes (name, slug, description, is_builtin, is_active)
VALUES ('Ramadan Kareem', 'ramadan-kareem', 'Tema spesial Ramadan dengan ornamen bulan sabit dan lentera', 1, 1);

INSERT INTO theme_settings (
  theme_id, primary_color, secondary_color, accent_color, text_color,
  bg_type, bg_gradient, layout_type, ornament_style, show_ornaments, clock_animation, transition_type
) VALUES (
  5, '#1B5E20', '#FFD700', '#FFC107', '#FFFFFF',
  'gradient', 'linear-gradient(135deg, #1B5E20 0%, #0D3B0D 40%, #1B5E20 100%)',
  'classic', 'islamic', 1, 'glow', 'crossfade'
);

-- ============================================
-- Insert Default Schedule (Emerald as default)
-- ============================================
INSERT INTO theme_schedules (theme_id, name, schedule_type, start_time, end_time, priority, is_active)
VALUES (1, 'Default Theme', 'time', '00:00', '23:59', 1, 1);

-- Log event
INSERT INTO system_events (title, description, event_type)
VALUES ('Theme system initialized', 'Created 5 built-in themes with settings', 'success');
