import { Hono } from "hono";
import { cors } from "hono/cors";

// ============================================
// Types
// ============================================
type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  R2_PUBLIC_URL: string;
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
  return c.body(null, 204, {
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
      "/api/themes",
      "/api/theme-settings",
      "/api/theme-schedules",
      "/api/theme-assets",
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
      body.theme_id || body.themeId || "emerald-classic",
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

// Update mosque theme
app.patch("/api/mosque/theme", async (c) => {
  try {
    const body = await c.req.json();
    const { themeId } = body;

    if (!themeId) {
      return c.json({ success: false, error: "themeId is required" }, 400);
    }

    const existing = (await c.env.DB.prepare(
      "SELECT id FROM mosque_settings LIMIT 1",
    ).first()) as { id: number } | null;

    if (existing) {
      await c.env.DB.prepare(
        `
        UPDATE mosque_settings SET theme_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      )
        .bind(themeId, existing.id)
        .run();

      // Log event
      await c.env.DB.prepare(
        "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
      )
        .bind("Theme updated", `Display theme changed to ${themeId}`, "info")
        .run();

      return c.json({ success: true });
    }

    return c.json({ success: false, error: "Mosque settings not found" }, 404);
  } catch (error: any) {
    console.error("Error updating theme:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update theme",
        message: error.message,
      },
      500,
    );
  }
});

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
// Routes - Display Content
// ============================================
app.get("/api/display-content", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM display_content ORDER BY display_order ASC",
    ).all();
    return c.json(result.results);
  } catch (error: any) {
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
      `INSERT INTO display_content (content_type, title, content, media_url, display_order, duration_seconds, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        body.content_type || "text",
        body.title || "",
        body.content || "",
        body.media_url || "",
        body.display_order || 0,
        body.duration_seconds || 10,
        body.is_active !== false ? 1 : 0,
      )
      .run();

    // Log event
    await c.env.DB.prepare(
      `INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)`,
    )
      .bind(
        "Konten display ditambahkan",
        `Ditambahkan: ${body.title}`,
        "success",
      )
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error: any) {
    console.error("Error creating display content:", error);
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
      `UPDATE display_content SET
        content_type = ?,
        title = ?,
        content = ?,
        media_url = ?,
        display_order = ?,
        duration_seconds = ?,
        is_active = ?
      WHERE id = ?`,
    )
      .bind(
        body.content_type,
        body.title,
        body.content || "",
        body.media_url || "",
        body.display_order || 0,
        body.duration_seconds || 10,
        body.is_active ? 1 : 0,
        id,
      )
      .run();

    // Log event
    await c.env.DB.prepare(
      `INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)`,
    )
      .bind("Konten display diperbarui", `Diubah: ${body.title}`, "info")
      .run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to update display content" },
      500,
    );
  }
});

app.delete("/api/display-content/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Get title before delete for logging
    const item = await c.env.DB.prepare(
      "SELECT title FROM display_content WHERE id = ?",
    )
      .bind(id)
      .first();

    await c.env.DB.prepare("DELETE FROM display_content WHERE id = ?")
      .bind(id)
      .run();

    // Log event
    await c.env.DB.prepare(
      `INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)`,
    )
      .bind(
        "Konten display dihapus",
        `Dihapus: ${item?.title || "Unknown"}`,
        "warning",
      )
      .run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to delete display content" },
      500,
    );
  }
});

// Bulk update order
app.put("/api/display-content/reorder", async (c) => {
  try {
    const body = await c.req.json();
    const items = body.items as { id: number; display_order: number }[];

    for (const item of items) {
      await c.env.DB.prepare(
        "UPDATE display_content SET display_order = ? WHERE id = ?",
      )
        .bind(item.display_order, item.id)
        .run();
    }

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to reorder display content" },
      500,
    );
  }
});
// Routes - Adzan Settings
// ============================================
app.get("/api/adzan-settings", async (c) => {
  try {
    const row = await c.env.DB.prepare(
      "SELECT * FROM adzan_settings LIMIT 1",
    ).first();

    if (!row) {
      return c.json(null);
    }

    // Convert to camelCase for frontend
    return c.json({
      enabled: !!row.enabled,
      volume: row.volume,
      useSubuhAdzan: !!row.use_subuh_adzan,
      tarhimEnabled: !!row.tarhim_enabled,
      tarhimMinutesBeforeImsak: row.tarhim_minutes_before_imsak,
      cautionEnabled: !!row.caution_enabled,
      cautionSecondsBeforeAdzan: row.caution_seconds_before_adzan,
      cautionSecondsBeforeImsak: row.caution_seconds_before_imsak,
      enabledPrayers: {
        imsak: !!row.enabled_imsak,
        subuh: !!row.enabled_subuh,
        dzuhur: !!row.enabled_dzuhur,
        ashar: !!row.enabled_ashar,
        maghrib: !!row.enabled_maghrib,
        isya: !!row.enabled_isya,
      },
    });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to fetch adzan settings" },
      500,
    );
  }
});

app.put("/api/adzan-settings", async (c) => {
  try {
    const body = await c.req.json();

    // Check if row exists
    const existing = await c.env.DB.prepare(
      "SELECT id FROM adzan_settings LIMIT 1",
    ).first();

    if (!existing) {
      // Insert new row
      await c.env.DB.prepare(
        `INSERT INTO adzan_settings (
          enabled, volume, use_subuh_adzan, tarhim_enabled, tarhim_minutes_before_imsak,
          caution_enabled, caution_seconds_before_adzan, caution_seconds_before_imsak,
          enabled_imsak, enabled_subuh, enabled_dzuhur, enabled_ashar, enabled_maghrib, enabled_isya
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          body.enabled ? 1 : 0,
          body.volume || 80,
          body.useSubuhAdzan ? 1 : 0,
          body.tarhimEnabled ? 1 : 0,
          body.tarhimMinutesBeforeImsak || 0,
          body.cautionEnabled ? 1 : 0,
          body.cautionSecondsBeforeAdzan || 60,
          body.cautionSecondsBeforeImsak || 60,
          body.enabledPrayers?.imsak ? 1 : 0,
          body.enabledPrayers?.subuh ? 1 : 0,
          body.enabledPrayers?.dzuhur ? 1 : 0,
          body.enabledPrayers?.ashar ? 1 : 0,
          body.enabledPrayers?.maghrib ? 1 : 0,
          body.enabledPrayers?.isya ? 1 : 0,
        )
        .run();
    } else {
      // Update existing row
      await c.env.DB.prepare(
        `UPDATE adzan_settings SET
          enabled = ?,
          volume = ?,
          use_subuh_adzan = ?,
          tarhim_enabled = ?,
          tarhim_minutes_before_imsak = ?,
          caution_enabled = ?,
          caution_seconds_before_adzan = ?,
          caution_seconds_before_imsak = ?,
          enabled_imsak = ?,
          enabled_subuh = ?,
          enabled_dzuhur = ?,
          enabled_ashar = ?,
          enabled_maghrib = ?,
          enabled_isya = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
      )
        .bind(
          body.enabled ? 1 : 0,
          body.volume || 80,
          body.useSubuhAdzan ? 1 : 0,
          body.tarhimEnabled ? 1 : 0,
          body.tarhimMinutesBeforeImsak || 0,
          body.cautionEnabled ? 1 : 0,
          body.cautionSecondsBeforeAdzan || 60,
          body.cautionSecondsBeforeImsak || 60,
          body.enabledPrayers?.imsak ? 1 : 0,
          body.enabledPrayers?.subuh ? 1 : 0,
          body.enabledPrayers?.dzuhur ? 1 : 0,
          body.enabledPrayers?.ashar ? 1 : 0,
          body.enabledPrayers?.maghrib ? 1 : 0,
          body.enabledPrayers?.isya ? 1 : 0,
        )
        .run();
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update adzan settings:", error);
    return c.json(
      { success: false, error: "Failed to update adzan settings" },
      500,
    );
  }
});

// ============================================
// Routes - Theme Assets
// ============================================

// Get all theme assets
app.get("/api/theme-assets", async (c) => {
  try {
    const themeId = c.req.query("themeId");
    const assetType = c.req.query("assetType");

    let query = "SELECT * FROM theme_assets WHERE 1=1";
    const params: any[] = [];

    if (themeId) {
      query += " AND (theme_id = ? OR theme_local_id = ?)";
      params.push(themeId, themeId);
    }
    if (assetType) {
      query += " AND asset_type = ?";
      params.push(assetType);
    }

    query += " ORDER BY display_order ASC";

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all();
    return c.json(result.results);
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to fetch theme assets" },
      500,
    );
  }
});

// Create theme asset
app.post("/api/theme-assets", async (c) => {
  try {
    const body = await c.req.json();
    const result = await c.env.DB.prepare(
      `
      INSERT INTO theme_assets (
        theme_id, theme_local_id, asset_type, file_url, file_name,
        file_size, mime_type, position, position_x, position_y, width, height,
        z_index, opacity, animation, is_active, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(
        body.themeId || body.theme_id,
        body.themeLocalId || body.theme_local_id,
        body.assetType || body.asset_type,
        body.fileUrl || body.file_url,
        body.fileName || body.file_name,
        body.fileSize || body.file_size,
        body.mimeType || body.mime_type,
        body.position || "center",
        body.positionX || body.position_x,
        body.positionY || body.position_y,
        body.width,
        body.height,
        body.zIndex || body.z_index || 0,
        body.opacity ?? 1,
        body.animation || "none",
        body.isActive ?? body.is_active ?? 1,
        body.displayOrder || body.display_order || 0,
      )
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error: any) {
    console.error("Error creating theme asset:", error);
    return c.json(
      { success: false, error: "Failed to create theme asset" },
      500,
    );
  }
});

// Update theme asset
app.put("/api/theme-assets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    await c.env.DB.prepare(
      `
      UPDATE theme_assets SET
        position = ?, position_x = ?, position_y = ?, width = ?, height = ?,
        z_index = ?, opacity = ?, animation = ?, is_active = ?, display_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
      .bind(
        body.position,
        body.positionX || body.position_x,
        body.positionY || body.position_y,
        body.width,
        body.height,
        body.zIndex || body.z_index,
        body.opacity,
        body.animation,
        body.isActive ?? body.is_active,
        body.displayOrder || body.display_order,
        id,
      )
      .run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to update theme asset" },
      500,
    );
  }
});

// Delete theme asset
app.delete("/api/theme-assets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("DELETE FROM theme_assets WHERE id = ?")
      .bind(id)
      .run();
    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to delete theme asset" },
      500,
    );
  }
});

// ============================================
// Routes - Themes
// ============================================

// Get all themes
app.get("/api/themes", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM themes ORDER BY created_at ASC",
    ).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch themes" }, 500);
  }
});

// Get theme settings
app.get("/api/theme-settings", async (c) => {
  try {
    const themeId = c.req.query("themeId");
    let query = "SELECT * FROM theme_settings";
    const params: any[] = [];

    if (themeId) {
      query += " WHERE theme_id = ?";
      params.push(themeId);
    }

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all();
    return c.json(result.results);
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch theme settings" },
      500,
    );
  }
});

// Get theme schedules
app.get("/api/theme-schedules", async (c) => {
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

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all();
    return c.json(result.results);
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch theme schedules" },
      500,
    );
  }
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
// Routes - File Upload (R2)
// ============================================

// Upload file to R2
app.post("/api/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json(
        { success: false, error: "File too large (max 10MB)" },
        400,
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: "Invalid file type" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop() || "bin";
    const key = `uploads/${timestamp}-${randomStr}.${extension}`;

    // Upload to R2
    await c.env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Generate public URL
    // Use R2_PUBLIC_URL if configured, otherwise use API endpoint for serving
    const baseUrl = c.env.R2_PUBLIC_URL
      ? c.env.R2_PUBLIC_URL.replace(/\/$/, "")
      : `${new URL(c.req.url).origin}/api/files`;
    const publicUrl = `${baseUrl}/${key}`;

    // Log event
    await c.env.DB.prepare(
      "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
    )
      .bind(
        "File uploaded",
        `File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
        "success",
      )
      .run();

    return c.json({
      success: true,
      key,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json(
      { success: false, error: "Upload failed", message: error.message },
      500,
    );
  }
});

// Delete file from R2
app.delete("/api/upload/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const fullKey = key.startsWith("uploads/") ? key : `uploads/${key}`;

    await c.env.R2_BUCKET.delete(fullKey);

    // Log event
    await c.env.DB.prepare(
      "INSERT INTO system_events (title, description, event_type) VALUES (?, ?, ?)",
    )
      .bind("File deleted", `Key: ${fullKey}`, "warning")
      .run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: "Delete failed" }, 500);
  }
});

// Serve file from R2 (for private access or custom serving)
app.get("/api/files/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const fullKey = key.startsWith("uploads/") ? key : `uploads/${key}`;

    const object = await c.env.R2_BUCKET.get(fullKey);

    if (!object) {
      return c.json({ error: "File not found" }, 404);
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "application/octet-stream",
    );
    headers.set("Cache-Control", "public, max-age=86400");
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, { headers });
  } catch (error: any) {
    return c.json({ error: "Failed to retrieve file" }, 500);
  }
});

// List files in R2 bucket
app.get("/api/files", async (c) => {
  try {
    const prefix = c.req.query("prefix") || "uploads/";
    const limit = parseInt(c.req.query("limit") || "50");

    const listed = await c.env.R2_BUCKET.list({ prefix, limit });

    const files = listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
    }));

    return c.json({ files, truncated: listed.truncated });
  } catch (error: any) {
    return c.json({ success: false, error: "Failed to list files" }, 500);
  }
});

// ============================================
// Routes - Running Text
// ============================================

// Get all running text data (items + settings)
app.get("/api/running-text", async (c) => {
  try {
    const items = await c.env.DB.prepare(
      "SELECT * FROM running_text_items ORDER BY display_order ASC",
    ).all();

    const settings = await c.env.DB.prepare(
      `SELECT 
        show_running_text,
        running_text_speed,
        running_text_bg_color,
        running_text_text_color,
        running_text_font_size,
        running_text_font_family,
        running_text_spacing,
        running_text_separator
      FROM theme_settings LIMIT 1`,
    ).first();

    return c.json({ items: items.results, settings });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to fetch running text data" },
      500,
    );
  }
});

// Get running text items only
app.get("/api/running-text/items", async (c) => {
  try {
    const items = await c.env.DB.prepare(
      "SELECT * FROM running_text_items ORDER BY display_order ASC",
    ).all();
    return c.json(items.results);
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to fetch running text items" },
      500,
    );
  }
});

// Add new running text item
app.post("/api/running-text/items", async (c) => {
  try {
    const body = await c.req.json();
    const result = await c.env.DB.prepare(
      `INSERT INTO running_text_items (content, display_order, is_active, show_icon, icon)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(
        body.content,
        body.display_order || 0,
        body.is_active !== false ? 1 : 0,
        body.show_icon !== false ? 1 : 0,
        body.icon || "📢",
      )
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to create running text item" },
      500,
    );
  }
});

// Update running text item
app.put("/api/running-text/items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE running_text_items SET
        content = ?,
        display_order = ?,
        is_active = ?,
        show_icon = ?,
        icon = ?
      WHERE id = ?`,
    )
      .bind(
        body.content,
        body.display_order || 0,
        body.is_active ? 1 : 0,
        body.show_icon ? 1 : 0,
        body.icon || "📢",
        id,
      )
      .run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to update running text item" },
      500,
    );
  }
});

// Delete running text item
app.delete("/api/running-text/items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("DELETE FROM running_text_items WHERE id = ?")
      .bind(id)
      .run();
    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to delete running text item" },
      500,
    );
  }
});

// Update running text settings
app.put("/api/running-text/settings", async (c) => {
  try {
    const body = await c.req.json();

    const existing = await c.env.DB.prepare(
      "SELECT id FROM theme_settings LIMIT 1",
    ).first();

    if (existing) {
      await c.env.DB.prepare(
        `UPDATE theme_settings SET
          show_running_text = ?,
          running_text_speed = ?,
          running_text_bg_color = ?,
          running_text_text_color = ?,
          running_text_font_size = ?,
          running_text_font_family = ?,
          running_text_spacing = ?,
          running_text_separator = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      )
        .bind(
          body.showRunningText ? 1 : 0,
          body.speed || 50,
          body.bgColor || null,
          body.textColor || null,
          body.fontSize || "1.25rem",
          body.fontFamily || "inherit",
          body.spacing || 0.75,
          body.separator || "•",
          (existing as any).id,
        )
        .run();
    }

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { success: false, error: "Failed to update running text settings" },
      500,
    );
  }
});

// ============================================
// Export for Cloudflare Workers
// ============================================
export default app;
