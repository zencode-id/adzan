-- Mosque Display Database Schema for Cloudflare D1
-- Initial migration

-- ============================================
-- Jadwal Sholat Table
-- ============================================
CREATE TABLE IF NOT EXISTS jadwal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT,
  imsak TEXT,
  subuh TEXT,
  dzuhur TEXT,
  ashar TEXT,
  maghrib TEXT,
  isya TEXT
);

-- ============================================
-- Mosque Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS mosque_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'masjid',
  street TEXT,
  village TEXT,
  district TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Indonesia',
  latitude TEXT,
  longitude TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta (WIB - UTC+7)',
  phone TEXT,
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Announcements Table
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info',
  is_active INTEGER DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Display Content Table
-- ============================================
CREATE TABLE IF NOT EXISTS display_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  media_url TEXT,
  display_order INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 10,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Prayer Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS prayer_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculation_method TEXT DEFAULT 'Kemenag',
  madhab TEXT DEFAULT 'Shafi',
  fajr_adjustment INTEGER DEFAULT 0,
  sunrise_adjustment INTEGER DEFAULT 0,
  dhuhr_adjustment INTEGER DEFAULT 0,
  asr_adjustment INTEGER DEFAULT 0,
  maghrib_adjustment INTEGER DEFAULT 0,
  isha_adjustment INTEGER DEFAULT 0,
  high_latitude_rule TEXT DEFAULT 'MiddleOfTheNight',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- System Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS system_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'info',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Sync Metadata Table (for offline-first)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  client_id TEXT NOT NULL,
  last_synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  UNIQUE(table_name, record_id, client_id)
);

-- ============================================
-- Initial Seed Data
-- ============================================
INSERT INTO mosque_settings (name, type, street, city, province, country, latitude, longitude, timezone)
VALUES (
  'Masjid Al-Ikhlas',
  'masjid',
  'Jl. Raya Kebayoran Lama No. 123',
  'Jakarta Selatan',
  'DKI Jakarta',
  'Indonesia',
  '-6.2442',
  '106.7822',
  'Asia/Jakarta (WIB - UTC+7)'
);

INSERT INTO prayer_settings (calculation_method, madhab)
VALUES ('Kemenag', 'Shafi');

INSERT INTO system_events (title, description, event_type)
VALUES ('System initialized', 'D1 database created and seeded', 'success');
