// ============================================
// Legacy Theme Context & Hooks
// ============================================

import { createContext, useContext, useEffect } from "react";
import type { ThemeContextState } from "./types";

// Create context with default value
export const ThemeContext = createContext<ThemeContextState | null>(null);

// ============================================
// Hook to use theme context
// ============================================
export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// ============================================
// useThemeSchedule Hook (for prayer-based scheduling)
// ============================================
interface UsePrayerThemeOptions {
  prayerTimes: {
    subuh: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
  };
  currentTime: Date;
}

export function usePrayerTheme({
  prayerTimes,
  currentTime,
}: UsePrayerThemeOptions) {
  const { schedules, setTheme } = useTheme();

  useEffect(() => {
    const prayerSchedules = schedules.filter(
      (s) => s.isActive && s.scheduleType === "prayer" && s.prayerTrigger,
    );

    if (prayerSchedules.length === 0) return;

    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    for (const schedule of prayerSchedules) {
      if (!schedule.prayerTrigger) continue;

      const prayerTimeStr = prayerTimes[schedule.prayerTrigger];
      if (!prayerTimeStr) continue;

      const [hours, minutes] = prayerTimeStr.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      const offset = schedule.offsetMinutes || 0;
      const duration = schedule.durationMinutes || 30;

      const startMinutes = prayerMinutes + offset;
      const endMinutes = startMinutes + duration;

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        setTheme(schedule.themeId);
        break;
      }
    }
  }, [prayerTimes, currentTime, schedules, setTheme]);
}
