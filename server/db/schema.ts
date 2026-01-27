import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
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
  defaultThemeId: integer("default_theme_id"),
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
// Themes Table (Master list of themes)
// ============================================
export const themes = sqliteTable("themes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  previewImageUrl: text("preview_image_url"),
  isBuiltin: integer("is_builtin").default(0),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Theme Settings Table (Visual configuration)
// ============================================
export const themeSettings = sqliteTable("theme_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  themeId: integer("theme_id").notNull(),

  // Colors
  primaryColor: text("primary_color").default("#1B5E20"),
  secondaryColor: text("secondary_color").default("#4CAF50"),
  accentColor: text("accent_color").default("#FFD700"),
  textColor: text("text_color").default("#FFFFFF"),
  textSecondaryColor: text("text_secondary_color").default("#E0E0E0"),

  // Background
  bgType: text("bg_type").default("gradient"),
  bgColor: text("bg_color").default("#0D3B0D"),
  bgGradient: text("bg_gradient").default(
    "linear-gradient(135deg, #1B5E20 0%, #0D3B0D 100%)",
  ),
  bgImageUrl: text("bg_image_url"),
  bgOverlayColor: text("bg_overlay_color").default("rgba(0,0,0,0.3)"),
  bgOverlayOpacity: real("bg_overlay_opacity").default(0.3),

  // Typography
  fontFamily: text("font_family").default("Inter"),
  clockFontSize: text("clock_font_size").default("8rem"),
  clockFontWeight: text("clock_font_weight").default("700"),
  headerFontSize: text("header_font_size").default("2rem"),
  prayerFontSize: text("prayer_font_size").default("1.5rem"),

  // Layout
  layoutType: text("layout_type").default("classic"),
  showHeader: integer("show_header").default(1),
  showDate: integer("show_date").default(1),
  showHijriDate: integer("show_hijri_date").default(1),
  showCountdown: integer("show_countdown").default(1),
  showQuote: integer("show_quote").default(1),
  showPrayerBar: integer("show_prayer_bar").default(1),

  // Ornaments
  showOrnaments: integer("show_ornaments").default(1),
  ornamentStyle: text("ornament_style").default("islamic"),
  ornamentOpacity: real("ornament_opacity").default(0.8),

  // Clock style
  clockStyle: text("clock_style").default("digital"),
  clockSeparator: text("clock_separator").default(":"),
  clockShowSeconds: integer("clock_show_seconds").default(1),

  // Animation
  clockAnimation: text("clock_animation").default("none"),
  transitionType: text("transition_type").default("fade"),
  transitionDuration: integer("transition_duration").default(500),

  // Prayer bar style
  prayerBarStyle: text("prayer_bar_style").default("horizontal"),
  prayerBarPosition: text("prayer_bar_position").default("bottom"),
  highlightCurrentPrayer: integer("highlight_current_prayer").default(1),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Theme Schedules Table (Auto-switch rules)
// ============================================
export const themeSchedules = sqliteTable("theme_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  themeId: integer("theme_id").notNull(),
  name: text("name"),

  // Schedule type
  scheduleType: text("schedule_type").notNull(),

  // Time-based schedule
  startTime: text("start_time"),
  endTime: text("end_time"),

  // Prayer-based schedule
  prayerTrigger: text("prayer_trigger"),
  offsetMinutes: integer("offset_minutes").default(0),
  durationMinutes: integer("duration_minutes").default(30),

  // Date range schedule
  startDate: text("start_date"),
  endDate: text("end_date"),

  // Days of week
  daysOfWeek: text("days_of_week").default("[0,1,2,3,4,5,6]"),

  // Priority
  priority: integer("priority").default(5),

  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// Theme Assets Table (Images, ornaments)
// ============================================
export const themeAssets = sqliteTable("theme_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  themeId: integer("theme_id").notNull(),

  assetType: text("asset_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),

  // Positioning
  position: text("position").default("center"),
  positionX: text("position_x"),
  positionY: text("position_y"),
  width: text("width"),
  height: text("height"),

  zIndex: integer("z_index").default(1),
  opacity: real("opacity").default(1.0),

  // Animation
  animation: text("animation"),

  isActive: integer("is_active").default(1),
  displayOrder: integer("display_order").default(0),
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

export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;

export type ThemeSettings = typeof themeSettings.$inferSelect;
export type NewThemeSettings = typeof themeSettings.$inferInsert;

export type ThemeSchedule = typeof themeSchedules.$inferSelect;
export type NewThemeSchedule = typeof themeSchedules.$inferInsert;

export type ThemeAsset = typeof themeAssets.$inferSelect;
export type NewThemeAsset = typeof themeAssets.$inferInsert;
