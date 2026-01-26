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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

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
        INSERT INTO mosque_settings (name, type, street, village, district, city, province, postal_code, country, latitude, longitude, timezone, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
// 11. Start Server
// ============================================
const port = 3000;
console.log(`\n🕌 Mosque Display API`);
console.log(`   Server running on http://localhost:${port}`);
console.log(`   Press Ctrl+C to stop\n`);

serve({
  fetch: app.fetch,
  port,
});
