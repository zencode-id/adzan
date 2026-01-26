import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================
// Jadwal Sholat Table
// ============================================
export const jadwal = sqliteTable("jadwal", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tanggal: text("tanggal"),
  imsak: text("imsak"),
  subuh: text("subuh"),
  dzuhur: text("dzuhur"),
  ashar: text("ashar"),
  maghrib: text("maghrib"),
  isya: text("isya"),
});

// ============================================
// Mosque Settings Table
// ============================================
export const mosqueSettings = sqliteTable("mosque_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").default("masjid"),
  street: text("street"),
  village: text("village"),
  district: text("district"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("Indonesia"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timezone: text("timezone").default("Asia/Jakarta (WIB - UTC+7)"),
  phone: text("phone"),
  email: text("email"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Announcements Table
// ============================================
export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  type: text("type").default("info"),
  isActive: integer("is_active").default(1),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Display Content Table
// ============================================
export const displayContent = sqliteTable("display_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentType: text("content_type").notNull(),
  title: text("title"),
  content: text("content"),
  mediaUrl: text("media_url"),
  displayOrder: integer("display_order").default(0),
  durationSeconds: integer("duration_seconds").default(10),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Prayer Settings Table
// ============================================
export const prayerSettings = sqliteTable("prayer_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  calculationMethod: text("calculation_method").default("Kemenag"),
  madhab: text("madhab").default("Shafi"),
  fajrAdjustment: integer("fajr_adjustment").default(0),
  sunriseAdjustment: integer("sunrise_adjustment").default(0),
  dhuhrAdjustment: integer("dhuhr_adjustment").default(0),
  asrAdjustment: integer("asr_adjustment").default(0),
  maghribAdjustment: integer("maghrib_adjustment").default(0),
  ishaAdjustment: integer("isha_adjustment").default(0),
  highLatitudeRule: text("high_latitude_rule").default("MiddleOfTheNight"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// System Events Table
// ============================================
export const systemEvents = sqliteTable("system_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").default("info"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Type Exports for use in application
// ============================================
export type Jadwal = typeof jadwal.$inferSelect;
export type NewJadwal = typeof jadwal.$inferInsert;

export type MosqueSettings = typeof mosqueSettings.$inferSelect;
export type NewMosqueSettings = typeof mosqueSettings.$inferInsert;

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type DisplayContent = typeof displayContent.$inferSelect;
export type NewDisplayContent = typeof displayContent.$inferInsert;

export type PrayerSettings = typeof prayerSettings.$inferSelect;
export type NewPrayerSettings = typeof prayerSettings.$inferInsert;

export type SystemEvent = typeof systemEvents.$inferSelect;
export type NewSystemEvent = typeof systemEvents.$inferInsert;
