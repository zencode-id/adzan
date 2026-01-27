// ============================================
// Theme Resolver Service
// Automatically resolves which theme to display based on schedules
// ============================================

import {
  builtinThemes,
  type ThemeConfig,
  type ThemeScheduleConfig,
} from "../themes";

// Schedule with resolved theme
interface ResolvedSchedule extends ThemeScheduleConfig {
  theme: ThemeConfig;
  matchScore: number; // Higher = more specific match
}

// Prayer times for prayer-based schedules
export interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

// Resolver configuration
interface ResolverConfig {
  defaultThemeId: string;
  schedules: ThemeScheduleConfig[];
  prayerTimes?: PrayerTimes;
  currentTime?: Date;
}

// ============================================
// Time Utilities
// ============================================

// Parse time string (HH:MM) to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Get current time as minutes since midnight
function getCurrentMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

// Check if current time is within a time range
function isWithinTimeRange(
  current: number,
  start: number,
  end: number,
): boolean {
  // Handle overnight ranges (e.g., 22:00 - 06:00)
  if (start > end) {
    return current >= start || current <= end;
  }
  return current >= start && current <= end;
}

// Parse date string (YYYY-MM-DD) to Date object
function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

// Check if current date is within a date range
function isWithinDateRange(current: Date, start: string, end: string): boolean {
  const currentDate = new Date(current.toISOString().split("T")[0]);
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  return currentDate >= startDate && currentDate <= endDate;
}

// Get day of week (0 = Sunday, 6 = Saturday)
function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay();
}

// ============================================
// Schedule Matchers
// ============================================

// Match time-based schedule
function matchTimeSchedule(
  schedule: ThemeScheduleConfig,
  currentTime: Date,
): boolean {
  if (schedule.scheduleType !== "time") return false;
  if (!schedule.startTime || !schedule.endTime) return false;

  const current = getCurrentMinutes(currentTime);
  const start = parseTimeToMinutes(schedule.startTime);
  const end = parseTimeToMinutes(schedule.endTime);

  // Check days of week if specified
  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
    const today = getDayOfWeek(currentTime);
    if (!schedule.daysOfWeek.includes(today)) return false;
  }

  return isWithinTimeRange(current, start, end);
}

// Match date-range schedule
function matchDateSchedule(
  schedule: ThemeScheduleConfig,
  currentTime: Date,
): boolean {
  if (schedule.scheduleType !== "date_range") return false;
  if (!schedule.startDate || !schedule.endDate) return false;

  return isWithinDateRange(currentTime, schedule.startDate, schedule.endDate);
}

// Match prayer-based schedule
function matchPrayerSchedule(
  schedule: ThemeScheduleConfig,
  currentTime: Date,
  prayerTimes?: PrayerTimes,
): boolean {
  if (schedule.scheduleType !== "prayer") return false;
  if (!schedule.prayerTrigger || !prayerTimes) return false;

  // Get prayer time
  const prayerTimeStr = prayerTimes[schedule.prayerTrigger];
  if (!prayerTimeStr) return false;

  const prayerMinutes = parseTimeToMinutes(prayerTimeStr);
  const offsetMinutes = schedule.offsetMinutes || 0;
  const durationMinutes = schedule.durationMinutes || 60;

  const startMinutes = prayerMinutes + offsetMinutes;
  const endMinutes = startMinutes + durationMinutes;
  const current = getCurrentMinutes(currentTime);

  return isWithinTimeRange(current, startMinutes, endMinutes);
}

// ============================================
// Theme Resolver
// ============================================

export function resolveTheme(config: ResolverConfig): ThemeConfig {
  const {
    defaultThemeId,
    schedules,
    prayerTimes,
    currentTime = new Date(),
  } = config;

  // Find default theme
  const defaultTheme =
    builtinThemes.find((t) => t.id === defaultThemeId) || builtinThemes[0];

  if (!schedules || schedules.length === 0) {
    return defaultTheme;
  }

  // Find matching schedules with scores
  const matchingSchedules: ResolvedSchedule[] = [];

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    let matches = false;
    let matchScore = schedule.priority || 0;

    switch (schedule.scheduleType) {
      case "time":
        matches = matchTimeSchedule(schedule, currentTime);
        matchScore += 10; // Time-based has base score of 10
        break;

      case "date_range":
        matches = matchDateSchedule(schedule, currentTime);
        matchScore += 20; // Date-range is more specific
        break;

      case "prayer":
        matches = matchPrayerSchedule(schedule, currentTime, prayerTimes);
        matchScore += 30; // Prayer-based is most specific
        break;
    }

    if (matches) {
      const theme = builtinThemes.find((t) => t.id === schedule.themeId);
      if (theme) {
        matchingSchedules.push({
          ...schedule,
          theme,
          matchScore,
        });
      }
    }
  }

  // Sort by match score (highest first)
  matchingSchedules.sort((a, b) => b.matchScore - a.matchScore);

  // Return highest scoring match or default
  if (matchingSchedules.length > 0) {
    return matchingSchedules[0].theme;
  }

  return defaultTheme;
}

// ============================================
// Schedule Evaluator (for debugging/preview)
// ============================================

export interface ScheduleEvaluation {
  schedule: ThemeScheduleConfig;
  matches: boolean;
  reason: string;
  theme?: ThemeConfig;
}

export function evaluateSchedules(
  config: ResolverConfig,
): ScheduleEvaluation[] {
  const { schedules, prayerTimes, currentTime = new Date() } = config;
  const evaluations: ScheduleEvaluation[] = [];

  for (const schedule of schedules) {
    const theme = builtinThemes.find((t) => t.id === schedule.themeId);
    let matches = false;
    let reason = "";

    if (!schedule.isActive) {
      reason = "Schedule is inactive";
    } else {
      switch (schedule.scheduleType) {
        case "time":
          matches = matchTimeSchedule(schedule, currentTime);
          reason = matches
            ? `Current time is within ${schedule.startTime} - ${schedule.endTime}`
            : `Current time is outside ${schedule.startTime} - ${schedule.endTime}`;
          break;

        case "date_range":
          matches = matchDateSchedule(schedule, currentTime);
          reason = matches
            ? `Current date is within ${schedule.startDate} - ${schedule.endDate}`
            : `Current date is outside ${schedule.startDate} - ${schedule.endDate}`;
          break;

        case "prayer":
          matches = matchPrayerSchedule(schedule, currentTime, prayerTimes);
          reason = matches
            ? `Currently within ${schedule.prayerTrigger} time window`
            : `Outside ${schedule.prayerTrigger} time window`;
          break;
      }
    }

    evaluations.push({
      schedule,
      matches,
      reason,
      theme,
    });
  }

  return evaluations;
}

// ============================================
// Get Next Theme Change
// ============================================

export interface NextThemeChange {
  theme: ThemeConfig;
  changeAt: Date;
  schedule: ThemeScheduleConfig;
}

export function getNextThemeChange(
  config: ResolverConfig,
  lookaheadHours: number = 24,
): NextThemeChange | null {
  const { schedules, prayerTimes, currentTime = new Date() } = config;

  const lookaheadEnd = new Date(
    currentTime.getTime() + lookaheadHours * 60 * 60 * 1000,
  );
  let nextChange: NextThemeChange | null = null;

  for (const schedule of schedules) {
    if (!schedule.isActive) continue;

    let changeAt: Date | null = null;
    const theme = builtinThemes.find((t) => t.id === schedule.themeId);
    if (!theme) continue;

    if (schedule.scheduleType === "time" && schedule.startTime) {
      const [hours, minutes] = schedule.startTime.split(":").map(Number);
      const today = new Date(currentTime);
      today.setHours(hours, minutes, 0, 0);

      if (today > currentTime && today <= lookaheadEnd) {
        changeAt = today;
      } else {
        // Try tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (tomorrow <= lookaheadEnd) {
          changeAt = tomorrow;
        }
      }
    }

    if (schedule.scheduleType === "date_range" && schedule.startDate) {
      const startDate = parseDate(schedule.startDate);
      if (startDate > currentTime && startDate <= lookaheadEnd) {
        changeAt = startDate;
      }
    }

    if (
      schedule.scheduleType === "prayer" &&
      schedule.prayerTrigger &&
      prayerTimes
    ) {
      const prayerTimeStr = prayerTimes[schedule.prayerTrigger];
      if (prayerTimeStr) {
        const [hours, minutes] = prayerTimeStr.split(":").map(Number);
        const offset = schedule.offsetMinutes || 0;

        const prayerTime = new Date(currentTime);
        prayerTime.setHours(hours, minutes + offset, 0, 0);

        if (prayerTime > currentTime && prayerTime <= lookaheadEnd) {
          changeAt = prayerTime;
        }
      }
    }

    if (changeAt && (!nextChange || changeAt < nextChange.changeAt)) {
      nextChange = {
        theme,
        changeAt,
        schedule,
      };
    }
  }

  return nextChange;
}

// ============================================
// Simple Schedule Format (for form data)
// ============================================

export interface SimpleSchedule {
  themeId: string;
  type: "time" | "date" | "prayer";
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  prayer?: string;
  priority: number;
}

// Convert simple schedule to ThemeScheduleConfig
export function convertToScheduleConfig(
  simple: SimpleSchedule,
  index: number,
): ThemeScheduleConfig {
  return {
    id: `schedule-${index}`,
    themeId: simple.themeId,
    name: `Schedule ${index + 1}`,
    scheduleType: simple.type === "date" ? "date_range" : simple.type,
    startTime: simple.startTime,
    endTime: simple.endTime,
    startDate: simple.startDate,
    endDate: simple.endDate,
    prayerTrigger: simple.prayer as ThemeScheduleConfig["prayerTrigger"],
    offsetMinutes: 0,
    durationMinutes: 60,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    priority: simple.priority,
    isActive: true,
  };
}

export default resolveTheme;
