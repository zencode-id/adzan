import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import Database from "better-sqlite3";

const app = new Hono();
const db = new Database("ramadan.db");

// ============================================
// 1. Setup Database & Tables
// ============================================

// Tabel Jadwal Sholat
db.exec(`
  CREATE TABLE IF NOT EXISTS jadwal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT,
    imsak TEXT,
    subuh TEXT,
    dzuhur TEXT,
    ashar TEXT,
    maghrib TEXT,
    isya TEXT
  )
`);

// Tabel Pengaturan Masjid/Musholla
db.exec(`
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
    theme_id TEXT DEFAULT 'emerald-classic',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Pastikan kolom theme_id ada (untuk db lama)
try {
  db.exec("ALTER TABLE mosque_settings ADD COLUMN theme_id TEXT DEFAULT 'emerald-classic'");
} catch (e) {
  // Kolom mungkin sudah ada
}

// Tabel Pengumuman
db.exec(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'info',
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabel Konten Display
db.exec(`
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
  )
`);

// Tabel Pengaturan Kalkulasi Waktu Sholat
db.exec(`
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
  )
`);

// Tabel Themes
db.exec(`
  CREATE TABLE IF NOT EXISTS themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    preview_image_url TEXT,
    is_builtin INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabel Theme Settings
db.exec(`
  CREATE TABLE IF NOT EXISTS theme_settings (
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
    FOREIGN KEY (theme_id) REFERENCES themes(id)
  )
`);

// Tabel Theme Schedules
db.exec(`
  CREATE TABLE IF NOT EXISTS theme_schedules (
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
    FOREIGN KEY (theme_id) REFERENCES themes(id)
  )
`);

// Tabel System Events/Logs
db.exec(`
  CREATE TABLE IF NOT EXISTS system_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'info',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ============================================
// 2. Seeder (Data default jika kosong)
// ============================================

// Seeder Jadwal
const cekJadwal = db.prepare("SELECT count(*) as count FROM jadwal").get() as {
  count: number;
};
if (cekJadwal.count === 0) {
  const insert = db.prepare(`
    INSERT INTO jadwal (tanggal, imsak, subuh, dzuhur, ashar, maghrib, isya)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const jadwalData = [
    ["2026-02-18", "04:15", "04:25", "11:55", "15:10", "18:05", "19:15"],
    ["2026-02-19", "04:15", "04:25", "11:55", "15:09", "18:05", "19:14"],
    ["2026-02-20", "04:16", "04:26", "11:54", "15:08", "18:04", "19:14"],
    ["2026-02-21", "04:16", "04:26", "11:54", "15:07", "18:04", "19:13"],
    ["2026-02-22", "04:17", "04:27", "11:53", "15:06", "18:03", "19:13"],
  ];

  for (const row of jadwalData) {
    insert.run(...row);
  }
  console.log("✅ Data jadwal dummy berhasil dimasukkan!");
}

// Seeder Mosque Settings
const cekMosque = db
  .prepare("SELECT count(*) as count FROM mosque_settings")
  .get() as {
  count: number;
};
if (cekMosque.count === 0) {
  const insertMosque = db.prepare(`
    INSERT INTO mosque_settings (name, type, street, village, district, city, province, postal_code, country, latitude, longitude, timezone, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMosque.run(
    "Masjid Al-Ikhlas",
    "masjid",
    "Jl. Raya Kebayoran Lama No. 123",
    "Kelurahan Kebayoran Lama Utara",
    "Kecamatan Kebayoran Lama",
    "Jakarta Selatan",
    "DKI Jakarta",
    "12210",
    "Indonesia",
    "-6.2442",
    "106.7822",
    "Asia/Jakarta (WIB - UTC+7)",
    "+62 21 1234 5678",
    "info@masjidalikhlash.id",
  );
  console.log("✅ Data masjid default berhasil dimasukkan!");
}

// Seeder Prayer Settings
const cekPrayer = db
  .prepare("SELECT count(*) as count FROM prayer_settings")
  .get() as {
  count: number;
};
if (cekPrayer.count === 0) {
  const insertPrayer = db.prepare(`
    INSERT INTO prayer_settings (calculation_method, madhab)
    VALUES (?, ?)
  `);
  insertPrayer.run("Kemenag", "Shafi");
  console.log("✅ Pengaturan kalkulasi sholat default berhasil dimasukkan!");
}

// Add initial system event
const cekEvents = db
  .prepare("SELECT count(*) as count FROM system_events")
  .get() as {
  count: number;
};
if (cekEvents.count === 0) {
  const insertEvent = db.prepare(`
    INSERT INTO system_events (title, description, event_type)
    VALUES (?, ?, ?)
  `);
  insertEvent.run(
    "System initialized",
    "Database created and seeded with default data",
    "success",
  );
  console.log("✅ Event sistem awal berhasil dimasukkan!");
}

// Seeder Announcements
const cekAnnouncements = db.prepare("SELECT count(*) as count FROM announcements").get() as { count: number };
if (cekAnnouncements.count === 0) {
  const insertAnn = db.prepare(`
    INSERT INTO announcements (title, content, type, is_active)
    VALUES (?, ?, ?, ?)
  `);
  insertAnn.run("Selamat Datang", "Terima kasih telah berkunjung ke Masjid Al-Ikhlas", "info", 1);
  insertAnn.run("Waktu Sholat", "Harap matikan handphone saat sholat berjamaah berlangsung", "warning", 1);
  console.log("✅ Data pengumuman default berhasil dimasukkan!");
}

// Seeder Display Content
const cekDisplay = db.prepare("SELECT count(*) as count FROM display_content").get() as { count: number };
if (cekDisplay.count === 0) {
  const insertContent = db.prepare(`
    INSERT INTO display_content (content_type, title, content, duration_seconds, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertContent.run("image", "Banner Ramadan", "Selamat Menunaikan Ibadah Puasa", 15, 1);
  insertContent.run("text", "Hadits Hari Ini", "Kebersihan adalah sebagian dari iman", 10, 1);
  console.log("✅ Data konten display default berhasil dimasukkan!");
}

// Seeder Themes
const cekThemes = db.prepare("SELECT count(*) as count FROM themes").get() as { count: number };
if (cekThemes.count === 0) {
  const insertTheme = db.prepare(`
    INSERT INTO themes (id, name, slug, description, is_builtin, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertTheme.run('emerald-classic', 'Emerald Classic', 'emerald-classic', 'Tema hijau klasik dengan nuansa islami yang elegan', 1, 1);
  insertTheme.run('sunset-warm', 'Sunset Warm', 'sunset-warm', 'Tema hangat untuk waktu Maghrib', 1, 1);
  insertTheme.run('night-sky', 'Night Sky', 'night-sky', 'Tema malam dengan nuansa biru gelap', 1, 1);
  insertTheme.run('minimalist-white', 'Minimalist White', 'minimalist-white', 'Tema minimalis putih bersih', 1, 1);
  insertTheme.run('ramadan-kareem', 'Ramadan Kareem', 'ramadan-kareem', 'Tema spesial Ramadan', 1, 1);

  console.log("✅ Data tema default berhasil dimasukkan!");
}

// Seeder Theme Settings
const cekThemeSettings = db.prepare("SELECT count(*) as count FROM theme_settings").get() as { count: number };
if (cekThemeSettings.count === 0) {
  const insertSetting = db.prepare(`
    INSERT INTO theme_settings (theme_id, primary_color, secondary_color, accent_color, text_color, bg_type, bg_gradient, layout_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSetting.run('emerald-classic', '#1B5E20', '#2E7D32', '#FFD700', '#FFFFFF', 'gradient', 'linear-gradient(135deg, #1B5E20 0%, #0D3B0D 50%, #1B5E20 100%)', 'classic');
  insertSetting.run('sunset-warm', '#E65100', '#FF8F00', '#FFE082', '#FFFFFF', 'gradient', 'linear-gradient(180deg, #FF6F00 0%, #E65100 50%, #BF360C 100%)', 'classic');
  insertSetting.run('night-sky', '#1A237E', '#303F9F', '#FFD54F', '#FFFFFF', 'gradient', 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 50%, #415A77 100%)', 'modern');

  console.log("✅ Data pengaturan tema default berhasil dimasukkan!");
}

// ============================================
// 3. Middleware
// ============================================
app.use("/*", cors());

// ============================================
// 4. Routes - Home
// ============================================
app.get("/", (c) =>
  c.json({
    message: "🌙 Mosque Display API Ready!",
    version: "1.0.0",
    endpoints: [
      "/api/jadwal",
      "/api/mosque",
      "/api/announcements",
      "/api/display-content",
      "/api/prayer-settings",
      "/api/system-events",
    ],
  }),
);

// ============================================
// 5. Routes - Jadwal Sholat
// ============================================
app.get("/api/jadwal", (c) => {
  const stmt = db.prepare("SELECT * FROM jadwal ORDER BY tanggal ASC");
  const data = stmt.all();
  return c.json(data);
});

app.get("/api/jadwal/today", (c) => {
  const today = new Date().toISOString().split("T")[0];
  const stmt = db.prepare("SELECT * FROM jadwal WHERE tanggal = ?");
  let data = stmt.get(today);

  if (!data) {
    const fallbackStmt = db.prepare(
      "SELECT * FROM jadwal ORDER BY tanggal ASC LIMIT 1",
    );
    data = fallbackStmt.get();
  }

  return c.json(data || null);
});

// ============================================
// 6. Routes - Mosque Settings
// ============================================

// Get mosque settings
app.get("/api/mosque", (c) => {
  const stmt = db.prepare("SELECT * FROM mosque_settings LIMIT 1");
  const data = stmt.get();
  return c.json(data || null);
});

// Update mosque settings
app.put("/api/mosque", async (c) => {
  try {
    const body = await c.req.json();

    // Check if exists
    const existing = db
      .prepare("SELECT id FROM mosque_settings LIMIT 1")
      .get() as { id: number } | undefined;

    if (existing) {
      // Update existing
      const updateStmt = db.prepare(`
        UPDATE mosque_settings SET
          name = ?,
          type = ?,
          street = ?,
          village = ?,
          district = ?,
          city = ?,
          province = ?,
          postal_code = ?,
          country = ?,
          latitude = ?,
          longitude = ?,
          timezone = ?,
          phone = ?,
          email = ?,
          theme_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      updateStmt.run(
        body.name,
        body.type,
        body.address?.street || body.street,
        body.address?.village || body.village,
        body.address?.district || body.district,
        body.address?.city || body.city,
        body.address?.province || body.province,
        body.address?.postalCode || body.postal_code,
        body.address?.country || body.country,
        body.coordinates?.latitude || body.latitude,
        body.coordinates?.longitude || body.longitude,
        body.timezone,
        body.phone,
        body.email,
        body.theme_id || body.themeId || "emerald",
        existing.id,
      );

      // Log event
      const logEvent = db.prepare(`
        INSERT INTO system_events (title, description, event_type)
        VALUES (?, ?, ?)
      `);
      logEvent.run(
        "Mosque settings updated",
        `${body.name} settings have been updated`,
        "info",
      );
    } else {
      // Insert new
      const insertStmt = db.prepare(`
        INSERT INTO mosque_settings (name, type, street, village, district, city, province, postal_code, country, latitude, longitude, timezone, phone, email, theme_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        body.name,
        body.type,
        body.address?.street || body.street,
        body.address?.village || body.village,
        body.address?.district || body.district,
        body.address?.city || body.city,
        body.address?.province || body.province,
        body.address?.postalCode || body.postal_code,
        body.address?.country || body.country,
        body.coordinates?.latitude || body.latitude,
        body.coordinates?.longitude || body.longitude,
        body.timezone,
        body.phone,
        body.email,
        body.theme_id || body.themeId || "emerald",
      );
    }

    const updated = db.prepare("SELECT * FROM mosque_settings LIMIT 1").get();
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating mosque:", error);
    return c.json(
      { success: false, error: "Failed to update mosque settings" },
      500,
    );
  }
});

// ============================================
// 7. Routes - Announcements
// ============================================
app.get("/api/announcements", (c) => {
  const stmt = db.prepare(
    "SELECT * FROM announcements ORDER BY created_at DESC",
  );
  return c.json(stmt.all());
});

app.post("/api/announcements", async (c) => {
  const body = await c.req.json();
  const stmt = db.prepare(`
    INSERT INTO announcements (title, content, type, is_active, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    body.title,
    body.content,
    body.type || "info",
    body.is_active ?? 1,
    body.start_date,
    body.end_date,
  );
  return c.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/announcements/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const stmt = db.prepare(`
    UPDATE announcements SET title = ?, content = ?, type = ?, is_active = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `);
  stmt.run(
    body.title,
    body.content,
    body.type,
    body.is_active,
    body.start_date,
    body.end_date,
    id,
  );
  return c.json({ success: true });
});

app.delete("/api/announcements/:id", (c) => {
  const id = c.req.param("id");
  db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
  return c.json({ success: true });
});

// ============================================
// 8. Routes - Display Content
// ============================================
app.get("/api/display-content", (c) => {
  const stmt = db.prepare(
    "SELECT * FROM display_content ORDER BY display_order ASC",
  );
  return c.json(stmt.all());
});

app.post("/api/display-content", async (c) => {
  const body = await c.req.json();
  const stmt = db.prepare(`
    INSERT INTO display_content (content_type, title, content, media_url, display_order, duration_seconds, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    body.content_type,
    body.title,
    body.content,
    body.media_url,
    body.display_order || 0,
    body.duration_seconds || 10,
    body.is_active ?? 1,
  );
  return c.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/display-content/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const stmt = db.prepare(`
    UPDATE display_content SET content_type = ?, title = ?, content = ?, media_url = ?, display_order = ?, duration_seconds = ?, is_active = ?
    WHERE id = ?
  `);
  stmt.run(
    body.content_type,
    body.title,
    body.content,
    body.media_url,
    body.display_order,
    body.duration_seconds,
    body.is_active,
    id,
  );
  return c.json({ success: true });
});

app.delete("/api/display-content/:id", (c) => {
  const id = c.req.param("id");
  db.prepare("DELETE FROM display_content WHERE id = ?").run(id);
  return c.json({ success: true });
});

// ============================================
// 9. Routes - Prayer Settings
// ============================================
app.get("/api/prayer-settings", (c) => {
  const stmt = db.prepare("SELECT * FROM prayer_settings LIMIT 1");
  return c.json(stmt.get() || null);
});

app.put("/api/prayer-settings", async (c) => {
  const body = await c.req.json();
  const existing = db
    .prepare("SELECT id FROM prayer_settings LIMIT 1")
    .get() as { id: number } | undefined;

  if (existing) {
    const stmt = db.prepare(`
      UPDATE prayer_settings SET
        calculation_method = ?,
        madhab = ?,
        fajr_adjustment = ?,
        sunrise_adjustment = ?,
        dhuhr_adjustment = ?,
        asr_adjustment = ?,
        maghrib_adjustment = ?,
        isha_adjustment = ?,
        high_latitude_rule = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      body.calculation_method,
      body.madhab,
      body.fajr_adjustment || 0,
      body.sunrise_adjustment || 0,
      body.dhuhr_adjustment || 0,
      body.asr_adjustment || 0,
      body.maghrib_adjustment || 0,
      body.isha_adjustment || 0,
      body.high_latitude_rule || "MiddleOfTheNight",
      existing.id,
    );
  } else {
    const stmt = db.prepare(`
      INSERT INTO prayer_settings (calculation_method, madhab, fajr_adjustment, sunrise_adjustment, dhuhr_adjustment, asr_adjustment, maghrib_adjustment, isha_adjustment, high_latitude_rule)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      body.calculation_method,
      body.madhab,
      body.fajr_adjustment || 0,
      body.sunrise_adjustment || 0,
      body.dhuhr_adjustment || 0,
      body.asr_adjustment || 0,
      body.maghrib_adjustment || 0,
      body.isha_adjustment || 0,
      body.high_latitude_rule || "MiddleOfTheNight",
    );
  }

  const updated = db.prepare("SELECT * FROM prayer_settings LIMIT 1").get();
  return c.json({ success: true, data: updated });
});

// ============================================
// 10. Routes - System Events
// ============================================
app.get("/api/system-events", (c) => {
  const limit = c.req.query("limit") || "20";
  const stmt = db.prepare(
    `SELECT * FROM system_events ORDER BY created_at DESC LIMIT ?`,
  );
  return c.json(stmt.all(parseInt(limit)));
});

app.post("/api/system-events", async (c) => {
  const body = await c.req.json();
  const stmt = db.prepare(`
    INSERT INTO system_events (title, description, event_type)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(
    body.title,
    body.description,
    body.event_type || "info",
  );
  return c.json({ success: true, id: result.lastInsertRowid });
});

// ============================================
// 11. Routes - Theme Settings
// ============================================

// Add theme_id column to mosque_settings if not exists
try {
  db.exec(
    `ALTER TABLE mosque_settings ADD COLUMN theme_id TEXT DEFAULT 'emerald'`,
  );
} catch {
  // Column already exists
}

// Create theme_assets table
db.exec(`
  CREATE TABLE IF NOT EXISTS theme_assets (
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
    opacity REAL DEFAULT 1,
    animation TEXT DEFAULT 'none',
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Update mosque theme
app.patch("/api/mosque/theme", async (c) => {
  try {
    const body = await c.req.json();
    const { themeId } = body;

    if (!themeId) {
      return c.json({ success: false, error: "themeId is required" }, 400);
    }

    const existing = db
      .prepare("SELECT id FROM mosque_settings LIMIT 1")
      .get() as { id: number } | undefined;

    if (existing) {
      db.prepare(
        `
        UPDATE mosque_settings SET theme_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      ).run(themeId, existing.id);

      // Log event
      db.prepare(
        `
        INSERT INTO system_events (title, description, event_type)
        VALUES (?, ?, ?)
      `,
      ).run("Theme updated", `Display theme changed to ${themeId}`, "info");

      return c.json({ success: true });
    }

    return c.json({ success: false, error: "Mosque settings not found" }, 404);
  } catch (error) {
    console.error("Error updating theme:", error);
    return c.json({ success: false, error: "Failed to update theme" }, 500);
  }
});

// ============================================
// 11.1 Routes - Themes
// ============================================

// Get all themes
app.get("/api/themes", (c) => {
  try {
    const stmt = db.prepare("SELECT * FROM themes ORDER BY created_at ASC");
    return c.json(stmt.all());
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch themes" }, 500);
  }
});

// Get theme settings
app.get("/api/theme-settings", (c) => {
  try {
    const themeId = c.req.query("themeId");
    let query = "SELECT * FROM theme_settings";
    const params: any[] = [];

    if (themeId) {
      query += " WHERE theme_id = ?";
      params.push(themeId);
    }

    const stmt = db.prepare(query);
    return c.json(stmt.all(...params));
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch theme settings" }, 500);
  }
});

// Get theme schedules
app.get("/api/theme-schedules", (c) => {
  try {
    const themeId = c.req.query("themeId");
    const activeOnly = c.req.query("activeOnly");

    let query = "SELECT * FROM theme_schedules WHERE 1=1";
    const params: any[] = [];

    if (themeId) {
      query += " AND theme_id = ?";
      params.push(themeId);
    }
    if (activeOnly === "true") {
      query += " AND is_active = 1";
    }

    query += " ORDER BY priority DESC";

    const stmt = db.prepare(query);
    return c.json(stmt.all(...params));
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch theme schedules" }, 500);
  }
});

// ============================================

// 12. Routes - Theme Assets
// ============================================

// Get all theme assets
app.get("/api/theme-assets", (c) => {
  const themeId = c.req.query("themeId");
  const assetType = c.req.query("assetType");

  let query = "SELECT * FROM theme_assets WHERE 1=1";
  const params: string[] = [];

  if (themeId) {
    query += " AND (theme_id = ? OR theme_local_id = ?)";
    params.push(themeId, themeId);
  }
  if (assetType) {
    query += " AND asset_type = ?";
    params.push(assetType);
  }

  query += " ORDER BY display_order ASC";

  const stmt = db.prepare(query);
  return c.json(stmt.all(...params));
});

// Create theme asset
app.post("/api/theme-assets", async (c) => {
  try {
    const body = await c.req.json();
    const stmt = db.prepare(`
      INSERT INTO theme_assets (
        local_id, theme_id, theme_local_id, asset_type, file_url, file_name,
        file_size, mime_type, position, position_x, position_y, width, height,
        z_index, opacity, animation, is_active, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.localId || crypto.randomUUID(),
      body.themeId,
      body.themeLocalId,
      body.assetType,
      body.fileUrl,
      body.fileName,
      body.fileSize,
      body.mimeType,
      body.position || "center",
      body.positionX,
      body.positionY,
      body.width,
      body.height,
      body.zIndex || 0,
      body.opacity ?? 1,
      body.animation || "none",
      body.isActive ?? 1,
      body.displayOrder || 0,
    );

    return c.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error("Error creating theme asset:", error);
    return c.json(
      { success: false, error: "Failed to create theme asset" },
      500,
    );
  }
});

// Update theme asset
app.put("/api/theme-assets/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const stmt = db.prepare(`
    UPDATE theme_assets SET
      position = ?, position_x = ?, position_y = ?, width = ?, height = ?,
      z_index = ?, opacity = ?, animation = ?, is_active = ?, display_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    body.position,
    body.positionX,
    body.positionY,
    body.width,
    body.height,
    body.zIndex,
    body.opacity,
    body.animation,
    body.isActive,
    body.displayOrder,
    id,
  );

  return c.json({ success: true });
});

// Delete theme asset
app.delete("/api/theme-assets/:id", (c) => {
  const id = c.req.param("id");
  db.prepare("DELETE FROM theme_assets WHERE id = ?").run(id);
  return c.json({ success: true });
});

// ============================================
// 13. Routes - File Upload (Local Development)
// ============================================
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
  statSync,
} from "fs";
import { join, extname } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const UPLOAD_DIR = join(process.cwd(), "uploads", "theme-assets");

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Upload file
app.post("/api/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;
    const assetType = formData.get("assetType") as string | null;
    const themeId = formData.get("themeId") as string | null;
    const themeLocalId = formData.get("themeLocalId") as string | null;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: "Invalid file type" }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json(
        { success: false, error: "File too large (max 10MB)" },
        400,
      );
    }

    // Generate unique filename
    const ext = extname(file.name) || `.${file.type.split("/")[1]}`;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${assetType || "asset"}_${timestamp}_${random}${ext}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const writeStream = createWriteStream(filePath);
    await pipeline(Readable.from(buffer), writeStream);

    // Generate URL (for local dev, use relative path)
    const baseUrl = process.env.API_URL || `http://localhost:3000`;
    const fileUrl = `${baseUrl}/uploads/theme-assets/${fileName}`;

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO theme_assets (
        local_id, theme_id, theme_local_id, asset_type, file_url,
        file_name, file_size, mime_type, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const localId = crypto.randomUUID();
    const result = stmt.run(
      localId,
      themeId ? parseInt(themeId) : null,
      themeLocalId,
      assetType || "background",
      fileUrl,
      file.name,
      file.size,
      file.type,
      1,
    );

    return c.json({
      success: true,
      url: fileUrl,
      key: fileName,
      id: result.lastInsertRowid,
      localId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ success: false, error: "Upload failed" }, 500);
  }
});

// List uploaded files
app.get("/api/upload", (c) => {
  try {
    const folder = c.req.query("folder");
    const assetType = c.req.query("assetType");

    let query = "SELECT * FROM theme_assets WHERE 1=1";
    const params: string[] = [];

    if (assetType) {
      query += " AND asset_type = ?";
      params.push(assetType);
    }

    const stmt = db.prepare(query);
    const assets = stmt.all(...params) as any[];

    return c.json({
      files: assets.map((asset) => ({
        key: (asset.file_url as string).split("/").pop(),
        url: asset.file_url,
        size: asset.file_size,
        lastModified: asset.created_at,
      })),
    });
  } catch (error) {
    console.error("List error:", error);
    return c.json({ files: [] });
  }
});

// Delete uploaded file
app.delete("/api/upload/:key", (c) => {
  try {
    const key = decodeURIComponent(c.req.param("key"));
    const filePath = join(UPLOAD_DIR, key);

    // Delete from filesystem
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    // Delete from database
    db.prepare("DELETE FROM theme_assets WHERE file_url LIKE ?").run(
      `%${key}%`,
    );

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json({ success: false, error: "Delete failed" }, 500);
  }
});

// Serve uploaded files (static)
app.get("/uploads/*", async (c) => {
  try {
    const path = c.req.path.replace("/uploads/", "");
    const filePath = join(process.cwd(), "uploads", path);

    if (!existsSync(filePath)) {
      return c.json({ error: "File not found" }, 404);
    }

    const ext = extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const stream = createReadStream(filePath);

    // Convert Node.js stream to Response
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Serve error:", error);
    return c.json({ error: "Failed to serve file" }, 500);
  }
});

// ============================================
// 14. Start Server
// ============================================
const port = 3000;
console.log(`\n🕌 Mosque Display API`);
console.log(`   Server running on http://localhost:${port}`);
console.log(`   Press Ctrl+C to stop\n`);

serve({
  fetch: app.fetch,
  port,
});
