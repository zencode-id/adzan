// ============================================
// Theme Context Definition
// Separated for Fast Refresh compatibility
// ============================================

import { createContext } from "react";
import type { ThemeConfig, ThemeScheduleConfig } from "../themes";
import type {
  PrayerTimes,
  NextThemeChange,
  ScheduleEvaluation,
} from "./resolver";

// ============================================
// Context Types
// ============================================

export interface ThemeContextValue {
  // Current theme
  currentTheme: ThemeConfig;
  previousTheme: ThemeConfig | null;
  isTransitioning: boolean;

  // Available themes
  availableThemes: ThemeConfig[];

  // Manual theme control
  setTheme: (themeId: string) => void;
  setDefaultTheme: (themeId: string) => void;

  // Schedules
  schedules: ThemeScheduleConfig[];
  setSchedules: (schedules: ThemeScheduleConfig[]) => void;
  addSchedule: (schedule: ThemeScheduleConfig) => void;
  removeSchedule: (id: string) => void;
  updateSchedule: (id: string, updates: Partial<ThemeScheduleConfig>) => void;

  // Auto-resolution
  enableAutoResolve: boolean;
  setEnableAutoResolve: (enabled: boolean) => void;
  resolveNow: () => void;

  // Debug info
  nextChange: NextThemeChange | null;
  scheduleEvaluations: ScheduleEvaluation[];

  // Prayer times (for prayer-based schedules)
  prayerTimes: PrayerTimes | null;
  setPrayerTimes: (times: PrayerTimes) => void;
}

// Create context
export const ThemeContext = createContext<ThemeContextValue | null>(null);
