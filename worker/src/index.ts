import { Hono } from "hono";
import { cors } from "hono/cors";

// ============================================
// Types
// ============================================
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// Middleware
// ============================================
app.use("/*", cors());

// ============================================
// Routes - Home
// ============================================
app.get("/", (c) =>
  c.json({
    message: "🌙 Mosque Display API (Cloudflare Workers)",
    version: "1.0.0",
    environment: c.env.ENVIRONMENT,
    endpoints: [
      "/api/jadwal",
      "/api/mosque",
      "/api/announcements",
      "/api/display-content",
      "/api/prayer-settings",
      "/api/system-events",
      "/api/sync",
    ],
  }),
);

// ============================================
// Routes - Jadwal Sholat
// ============================================
app.get("/api/jadwal", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM jadwal ORDER BY tanggal ASC",
  ).all();
  return c.json(result.results);
});

app.get("/api/jadwal/today", async (c) => {
  const today = new Date().toISOString().split("T")[0];
  let result = await c.env.DB.prepare("SELECT * FROM jadwal WHERE tanggal = ?")
    .bind(today)
    .first();

  if (!result) {
    result = await c.env.DB.prepare(
      "SELECT * FROM jadwal ORDER BY tanggal ASC LIMIT 1",
    ).first();
  }

  return c.json(result || null);
});

// ============================================
// Routes - Mosque Settings
// ============================================
app.get("/api/mosque", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM mosque_settings LIMIT 1",
  ).first();
  return c.json(result || null);
});

app.put("/api/mosque", async (c) => {
  try {
    const body = await c.req.json();
    const existing = await c.env.DB.prepare(
      "SELECT id FROM mosque_settings LIMIT 1",
    ).first<{ id: number }>();

    if (existing) {
      await c.env.DB.prepare(
        `
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
      `,
      )
        .bind(
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
        )
        .run();

      // Log event
      await c.env.DB.prepare(
        `
        INSERT INTO system_events (title, description, event_type)
        VALUES (?, ?, ?)
      `,
      )
        .bind(
          "Mosque settings updated",
          `${body.name} settings have been updated`,
          "info",
        )
        .run();
    } else {
      await c.env.DB.prepare(
        `
        INSERT INTO mosque_settings (name, type, street, village, district, city, province, postal_code, country, latitude, longitude, timezone, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
        .bind(
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
        )
        .run();
    }

    const updated = await c.env.DB.prepare(
      "SELECT * FROM mosque_settings LIMIT 1",
    ).first();
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
// Routes - Announcements
// ============================================
app.get("/api/announcements", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM announcements ORDER BY created_at DESC",
  ).all();
  return c.json(result.results);
});

app.post("/api/announcements", async (c) => {
  const body = await c.req.json();
  const result = await c.env.DB.prepare(
    `
    INSERT INTO announcements (title, content, type, is_active, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  )
    .bind(
      body.title,
      body.content,
      body.type || "info",
      body.is_active ?? 1,
      body.start_date,
      body.end_date,
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/announcements/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(
    `
    UPDATE announcements SET title = ?, content = ?, type = ?, is_active = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `,
  )
    .bind(
      body.title,
      body.content,
      body.type,
      body.is_active,
      body.start_date,
      body.end_date,
      id,
    )
    .run();

  return c.json({ success: true });
});

app.delete("/api/announcements/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM announcements WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

// ============================================
// Routes - Display Content
// ============================================
app.get("/api/display-content", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM display_content ORDER BY display_order ASC",
  ).all();
  return c.json(result.results);
});

app.post("/api/display-content", async (c) => {
  const body = await c.req.json();
  const result = await c.env.DB.prepare(
    `
    INSERT INTO display_content (content_type, title, content, media_url, display_order, duration_seconds, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  )
    .bind(
      body.content_type,
      body.title,
      body.content,
      body.media_url,
      body.display_order || 0,
      body.duration_seconds || 10,
      body.is_active ?? 1,
    )
    .run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/display-content/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(
    `
    UPDATE display_content SET content_type = ?, title = ?, content = ?, media_url = ?, display_order = ?, duration_seconds = ?, is_active = ?
    WHERE id = ?
  `,
  )
    .bind(
      body.content_type,
      body.title,
      body.content,
      body.media_url,
      body.display_order,
      body.duration_seconds,
      body.is_active,
      id,
    )
    .run();

  return c.json({ success: true });
});

app.delete("/api/display-content/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM display_content WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

// ============================================
// Routes - Prayer Settings
// ============================================
app.get("/api/prayer-settings", async (c) => {
  const result = await c.env.DB.prepare(
    "SELECT * FROM prayer_settings LIMIT 1",
  ).first();
  return c.json(result || null);
});

app.put("/api/prayer-settings", async (c) => {
  const body = await c.req.json();
  const existing = await c.env.DB.prepare(
    "SELECT id FROM prayer_settings LIMIT 1",
  ).first<{ id: number }>();

  if (existing) {
    await c.env.DB.prepare(
      `
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
    `,
    )
      .bind(
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
      )
      .run();
  } else {
    await c.env.DB.prepare(
      `
      INSERT INTO prayer_settings (calculation_method, madhab, fajr_adjustment, sunrise_adjustment, dhuhr_adjustment, asr_adjustment, maghrib_adjustment, isha_adjustment, high_latitude_rule)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(
        body.calculation_method,
        body.madhab,
        body.fajr_adjustment || 0,
        body.sunrise_adjustment || 0,
        body.dhuhr_adjustment || 0,
        body.asr_adjustment || 0,
        body.maghrib_adjustment || 0,
        body.isha_adjustment || 0,
        body.high_latitude_rule || "MiddleOfTheNight",
      )
      .run();
  }

  const updated = await c.env.DB.prepare(
    "SELECT * FROM prayer_settings LIMIT 1",
  ).first();
  return c.json({ success: true, data: updated });
});

// ============================================
// Routes - System Events
// ============================================
app.get("/api/system-events", async (c) => {
  const limit = c.req.query("limit") || "20";
  const result = await c.env.DB.prepare(
    "SELECT * FROM system_events ORDER BY created_at DESC LIMIT ?",
  )
    .bind(parseInt(limit))
    .all();
  return c.json(result.results);
});

app.post("/api/system-events", async (c) => {
  const body = await c.req.json();
  const result = await c.env.DB.prepare(
    `
    INSERT INTO system_events (title, description, event_type)
    VALUES (?, ?, ?)
  `,
  )
    .bind(body.title, body.description, body.event_type || "info")
    .run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// ============================================
// Routes - Sync (for offline-first)
// ============================================
app.post("/api/sync/push", async (c) => {
  try {
    const body = await c.req.json();
    const { table, data, clientId } = body;

    // Handle push from client
    // This would merge client data with server data
    // For now, just acknowledge receipt

    return c.json({
      success: true,
      message: "Data received",
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({ success: false, error: "Sync push failed" }, 500);
  }
});

app.post("/api/sync/pull", async (c) => {
  try {
    const body = await c.req.json();
    const { lastSyncTime, clientId } = body;

    // Return all data updated since lastSyncTime
    const mosque = await c.env.DB.prepare(
      "SELECT * FROM mosque_settings LIMIT 1",
    ).first();
    const prayerSettings = await c.env.DB.prepare(
      "SELECT * FROM prayer_settings LIMIT 1",
    ).first();
    const announcements = await c.env.DB.prepare(
      "SELECT * FROM announcements",
    ).all();

    return c.json({
      success: true,
      data: {
        mosqueSettings: mosque,
        prayerSettings: prayerSettings,
        announcements: announcements.results,
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({ success: false, error: "Sync pull failed" }, 500);
  }
});

app.get("/api/sync/status", async (c) => {
  return c.json({
    serverTime: new Date().toISOString(),
    status: "ready",
  });
});

// ============================================
// Export for Cloudflare Workers
// ============================================
export default app;
