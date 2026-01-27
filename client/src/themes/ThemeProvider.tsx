// ============================================
// Theme Context & Provider
// ============================================

import { useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  ThemeConfig,
  ThemeContextState,
  ThemeScheduleConfig,
} from "./types";
import { ThemeContext } from "./legacyThemeContext";
import { builtinThemes, emeraldClassic, getThemeById } from "./presets";

// API base URL
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://mosque-display-api.adzan.workers.dev/"
).replace(/\/$/, "");

// ============================================
// Theme Provider Component
// ============================================
interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
}

export function ThemeProvider({
  children,
  defaultThemeId,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    defaultThemeId ? getThemeById(defaultThemeId) : emeraldClassic,
  );
  const [availableThemes, setAvailableThemes] =
    useState<ThemeConfig[]>(builtinThemes);
  const [schedules, setSchedules] = useState<ThemeScheduleConfig[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load themes from server
  const refreshThemes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/themes`);
      if (response.ok) {
        const serverThemes = await response.json();
        // Merge with builtin themes
        const merged = [...builtinThemes];

        // Add any custom themes from server
        if (Array.isArray(serverThemes)) {
          serverThemes.forEach((st: ThemeConfig) => {
            if (!merged.find((t) => t.id === st.id)) {
              merged.push(st);
            }
          });
        }

        setAvailableThemes(merged);
      }
    } catch (error) {
      console.warn(
        "Failed to load themes from server, using builtin themes:",
        error,
      );
    }

    // Load schedules
    try {
      const scheduleResponse = await fetch(
        `${API_BASE_URL}/api/theme-schedules`,
      );
      if (scheduleResponse.ok) {
        const serverSchedules = await scheduleResponse.json();
        if (Array.isArray(serverSchedules)) {
          setSchedules(serverSchedules);
        }
      }
    } catch (error) {
      console.warn("Failed to load theme schedules:", error);
    }
  }, []);

  // Set theme with transition
  const setTheme = useCallback(
    (themeId: string) => {
      const newTheme = availableThemes.find(
        (t) => t.id === themeId || t.slug === themeId,
      );
      if (newTheme && newTheme.id !== currentTheme.id) {
        setIsTransitioning(true);

        // Apply transition
        setTimeout(() => {
          setCurrentTheme(newTheme);

          // End transition after duration
          setTimeout(() => {
            setIsTransitioning(false);
          }, newTheme.animation.transitionDuration);
        }, 50);
      }
    },
    [availableThemes, currentTheme],
  );

  // Check and apply scheduled theme
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentDay = now.getDay();
      const currentDateStr = now.toISOString().split("T")[0];

      // Sort schedules by priority (highest first)
      const activeSchedules = schedules
        .filter((s) => s.isActive)
        .sort((a, b) => b.priority - a.priority);

      for (const schedule of activeSchedules) {
        // Check days of week
        if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(currentDay)) {
          continue;
        }

        let shouldApply = false;

        switch (schedule.scheduleType) {
          case "time":
            if (schedule.startTime && schedule.endTime) {
              shouldApply =
                currentTimeStr >= schedule.startTime &&
                currentTimeStr <= schedule.endTime;
            }
            break;

          case "date_range":
            if (schedule.startDate && schedule.endDate) {
              shouldApply =
                currentDateStr >= schedule.startDate &&
                currentDateStr <= schedule.endDate;
            }
            break;

          case "prayer":
            // Prayer-based scheduling would need prayer times integration
            // This is handled separately in the display component
            break;
        }

        if (shouldApply) {
          setTheme(schedule.themeId);
          break;
        }
      }
    };

    // Check schedule every minute
    const interval = setInterval(checkSchedule, 60000);
    checkSchedule(); // Initial check

    return () => clearInterval(interval);
  }, [schedules, setTheme]);

  // Load themes on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshThemes();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshThemes]);

  // Apply default theme if provided
  useEffect(() => {
    if (defaultThemeId) {
      const timer = setTimeout(() => {
        setTheme(defaultThemeId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [defaultThemeId, setTheme]);

  const value: ThemeContextState = {
    currentTheme,
    availableThemes,
    schedules,
    isTransitioning,
    setTheme,
    refreshThemes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
