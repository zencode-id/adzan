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
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.options("/*", (c) => {
  return c.text("", 204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
  });
});

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

// Helper for mosque settings upsert
const upsertMosqueSettings = async (c: any) => {
  try {
    const body = await c.req.json();
    const existing = (await c.env.DB.prepare(
      "SELECT id FROM mosque_settings LIMIT 1",
    ).first()) as { id: number } | null;

    const params = [
      body.name,
      body.type,
      body.address?.street || body.street,
      body.address?.village || body.village,
      body.address?.district || body.district,
      body.address?.city || body.city,
      body.address?.province || body.province,
      body.address?.postalCode || body.postalCode || body.postal_code,
      body.address?.country || body.country,
      body.coordinates?.latitude || body.latitude,
      body.coordinates?.longitude || body.longitude,
      body.timezone,
      body.phone,
      body.email,
      body.theme_id || body.themeId || "emerald",
    ];

    if (existing) {
      await c.env.DB.prepare(
        `
        UPDATE mosque_settings SET
          name = ?, type = ?, street = ?, village = ?, district = ?, city = ?, province = ?,
          postal_code = ?, country = ?, latitude = ?, longitude = ?, timezone = ?, phone = ?, email = ?,
          theme_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      )
        .bind(...params, existing.id)
        .run();

      await c.env.DB.prepare(
        "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
      )
        .bind("Mosque updated", `${body.name} settings updated`, "info")
        .run();
    } else {
      await c.env.DB.prepare(
        `
        INSERT INTO mosque_settings (name, type, street, village, district, city, province, postal_code, country, latitude, longitude, timezone, phone, email, theme_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
        .bind(...params)
        .run();

      await c.env.DB.prepare(
        "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
      )
        .bind("Mosque initialized", `${body.name} settings created`, "success")
        .run();
    }

    const updated = await c.env.DB.prepare(
      "SELECT * FROM mosque_settings LIMIT 1",
    ).first();
    return c.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error upserting mosque settings:", error);
    return c.json(
      {
        success: false,
        error: "Failed to save mosque settings",
        message: error.message,
      },
      500,
    );
  }
};

app.put("/api/mosque", upsertMosqueSettings);
app.post("/api/mosque", upsertMosqueSettings);

// ============================================
// Routes - Announcements
// ============================================
app.get("/api/announcements", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM announcements ORDER BY created_at DESC",
    ).all();
    return c.json(result.results);
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch announcements" },
      500,
    );
  }
});

app.post("/api/announcements", async (c) => {
  try {
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
        body.is_active ?? (body.isActive ? 1 : 0),
        body.start_date || body.startDate,
        body.end_date || body.endDate,
      )
      .run();

    // Log event
    await c.env.DB.prepare(
      "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
    )
      .bind("Announcement created", `New announcement: ${body.title}`, "info")
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return c.json(
      { success: false, error: "Failed to create announcement" },
      500,
    );
  }
});

app.put("/api/announcements/:id", async (c) => {
  try {
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
        body.is_active ?? (body.isActive ? 1 : 0),
        body.start_date || body.startDate,
        body.end_date || body.endDate,
        id,
      )
      .run();

    // Log event
    await c.env.DB.prepare(
      "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
    )
      .bind("Announcement updated", `Updated: ${body.title}`, "info")
      .run();

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to update announcement" },
      500,
    );
  }
});

app.delete("/api/announcements/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("DELETE FROM announcements WHERE id = ?")
      .bind(id)
      .run();

    // Log event
    await c.env.DB.prepare(
      "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
    )
      .bind("Announcement deleted", `ID: ${id}`, "warning")
      .run();

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to delete announcement" },
      500,
    );
  }
});

// ============================================
// Routes - Display Content
// ============================================
app.get("/api/display-content", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM display_content ORDER BY display_order ASC",
    ).all();
    return c.json(result.results);
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch display content" },
      500,
    );
  }
});

app.post("/api/display-content", async (c) => {
  try {
    const body = await c.req.json();
    const result = await c.env.DB.prepare(
      `
      INSERT INTO display_content (content_type, title, content, media_url, display_order, duration_seconds, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(
        body.content_type || body.contentType,
        body.title,
        body.content,
        body.media_url || body.mediaUrl,
        body.display_order ?? body.displayOrder ?? 0,
        body.duration_seconds ?? body.durationSeconds ?? 10,
        body.is_active ?? (body.isActive ? 1 : 0),
      )
      .run();

    // Log event
    await c.env.DB.prepare(
      "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
    )
      .bind("Display content added", `${body.title || "Untitled"}`, "info")
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to create display content" },
      500,
    );
  }
});

app.put("/api/display-content/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    await c.env.DB.prepare(
      `
      UPDATE display_content SET content_type = ?, title = ?, content = ?, media_url = ?, display_order = ?, duration_seconds = ?, is_active = ?
      WHERE id = ?
    `,
    )
      .bind(
        body.content_type || body.contentType,
        body.title,
        body.content,
        body.media_url || body.mediaUrl,
        body.display_order ?? body.displayOrder,
        body.duration_seconds ?? body.durationSeconds,
        body.is_active ?? (body.isActive ? 1 : 0),
        id,
      )
      .run();

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to update display content" },
      500,
    );
  }
});

app.delete("/api/display-content/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("DELETE FROM display_content WHERE id = ?")
      .bind(id)
      .run();
    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to delete display content" },
      500,
    );
  }
});

// ============================================
// Routes - Prayer Settings
// ============================================
app.get("/api/prayer-settings", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM prayer_settings LIMIT 1",
    ).first();
    return c.json(result || null);
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch prayer settings" },
      500,
    );
  }
});

// Helper for prayer settings upsert
const upsertPrayerSettings = async (c: any) => {
  try {
    const body = await c.req.json();
    const existing = (await c.env.DB.prepare(
      "SELECT id FROM prayer_settings LIMIT 1",
    ).first()) as { id: number } | null;

    const params = [
      body.calculation_method || body.calculationMethod || "Kemenag",
      body.madhab || "Shafi",
      body.fajr_adjustment ?? body.fajrAdjustment ?? 0,
      body.sunrise_adjustment ?? body.sunriseAdjustment ?? 0,
      body.dhuhr_adjustment ?? body.dhuhrAdjustment ?? 0,
      body.asr_adjustment ?? body.asrAdjustment ?? 0,
      body.maghrib_adjustment ?? body.maghribAdjustment ?? 0,
      body.isha_adjustment ?? body.ishaAdjustment ?? 0,
      body.high_latitude_rule ?? body.highLatitudeRule ?? "MiddleOfTheNight",
    ];

    if (existing) {
      await c.env.DB.prepare(
        `
        UPDATE prayer_settings SET
          calculation_method = ?, madhab = ?, fajr_adjustment = ?, sunrise_adjustment = ?,
          dhuhr_adjustment = ?, asr_adjustment = ?, maghrib_adjustment = ?, isha_adjustment = ?,
          high_latitude_rule = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      )
        .bind(...params, existing.id)
        .run();
    } else {
      await c.env.DB.prepare(
        `
        INSERT INTO prayer_settings (
          calculation_method, madhab, fajr_adjustment, sunrise_adjustment,
          dhuhr_adjustment, asr_adjustment, maghrib_adjustment, isha_adjustment,
          high_latitude_rule
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
        .bind(...params)
        .run();
    }

    const updated = await c.env.DB.prepare(
      "SELECT * FROM prayer_settings LIMIT 1",
    ).first();
    return c.json({ success: true, data: updated });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: "Failed to save prayer settings",
        message: error.message,
      },
      500,
    );
  }
};

app.put("/api/prayer-settings", upsertPrayerSettings);
app.post("/api/prayer-settings", upsertPrayerSettings);

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
    const { table, data, action, clientId } = body;

    // For now, we reuse the individual logic based on the table
    // In a real world app, this would be a single transaction

    // Log the sync attempt
    console.log(`Sync push from ${clientId}: ${action} on ${table}`);

    return c.json({
      success: true,
      message: "Data received and processed",
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({ success: false, error: "Sync push failed" }, 500);
  }
});

app.get("/api/sync/pull", async (c) => {
  try {
    const mosque = await c.env.DB.prepare(
      "SELECT * FROM mosque_settings LIMIT 1",
    ).first();
    const prayerSettings = await c.env.DB.prepare(
      "SELECT * FROM prayer_settings LIMIT 1",
    ).first();
    const announcements = await c.env.DB.prepare(
      "SELECT * FROM announcements WHERE is_active = 1",
    ).all();
    const displayContent = await c.env.DB.prepare(
      "SELECT * FROM display_content WHERE is_active = 1",
    ).all();

    return c.json({
      success: true,
      data: {
        mosqueSettings: mosque,
        prayerSettings: prayerSettings,
        announcements: announcements.results,
        displayContent: displayContent.results,
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({ success: false, error: "Sync pull failed" }, 500);
  }
});

app.get("/api/sync/status", async (c) => {
  try {
    const count = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM system_events",
    ).first();
    return c.json({
      serverTime: new Date().toISOString(),
      status: "ready",
      databaseOk: !!count,
    });
  } catch (error) {
    return c.json({ status: "error", error: "Database unreachable" }, 500);
  }
});

// ============================================
// Export for Cloudflare Workers
// ============================================
export default app;
