// ============================================
// Theme Context Provider
// Global theme state management with auto-resolution
// ============================================

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { mosqueApi } from "../lib/api";
import { calculatePrayerTimes } from "../lib/prayerTimes";
import {
  builtinThemes,
  type ThemeConfig,
  type ThemeScheduleConfig,
} from "../themes";
import {
  resolveTheme,
  evaluateSchedules,
  getNextThemeChange,
  type PrayerTimes,
  type NextThemeChange,
  type ScheduleEvaluation,
} from "./resolver";
import { ThemeContext, type ThemeContextValue } from "./themeContextDef";

// Re-export for convenience
export { ThemeContext, type ThemeContextValue } from "./themeContextDef";

// ============================================
// Provider Props
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
  initialSchedules?: ThemeScheduleConfig[];
  initialPrayerTimes?: PrayerTimes;
  autoResolveInterval?: number; // ms, default 60000 (1 min)
  transitionDuration?: number; // ms, default from theme
}

// ============================================
// Theme Provider Component
// ============================================

export function AutoThemeProvider({
  children,
  defaultThemeId = "emerald",
  initialSchedules = [],
  initialPrayerTimes,
  autoResolveInterval = 60000,
  transitionDuration,
}: ThemeProviderProps) {
  // State
  const [currentThemeId, setCurrentThemeId] = useState(defaultThemeId);
  const [defaultId, setDefaultId] = useState(defaultThemeId);
  const [previousTheme, setPreviousTheme] = useState<ThemeConfig | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [schedules, setSchedules] =
    useState<ThemeScheduleConfig[]>(initialSchedules);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(
    initialPrayerTimes || null,
  );
  const [enableAutoResolve, setEnableAutoResolve] = useState(true);
  const [nextChange, setNextChange] = useState<NextThemeChange | null>(null);
  const [scheduleEvaluations, setScheduleEvaluations] = useState<
    ScheduleEvaluation[]
  >([]);

  // Ref to track if initial resolve has happened
  const hasInitialized = useRef(false);

  // Initialize data from API
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Fetch Mosque Info for default theme
        const mosque = await mosqueApi.get();
        if (mosque && mosque.themeId) {
          setDefaultId(mosque.themeId);
          // Initial theme should follow mosque default if not resolved yet
          if (!hasInitialized.current) {
            setCurrentThemeId(mosque.themeId);
          }
        }

        // 2. Fetch Schedules
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/theme-schedules`,
        );
        if (response.ok) {
          const remoteSchedules = await response.json();
          if (Array.isArray(remoteSchedules)) {
            setSchedules(remoteSchedules);
          }
        }

        // 3. Calculate Prayer Times if coordinates available
        if (mosque) {
          const lat = parseFloat(mosque.coordinates.latitude);
          const lng = parseFloat(mosque.coordinates.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            const times = calculatePrayerTimes(new Date(), {
              latitude: lat,
              longitude: lng,
              calculationMethod: "Kemenag",
            });
            setPrayerTimes(times as unknown as PrayerTimes);
          }
        }
      } catch (error) {
        console.error("Failed to initialize theme context data:", error);
      }
    };

    initData();
  }, []);

  // Get current theme object
  const currentTheme = useMemo(() => {
    return (
      builtinThemes.find((t) => t.id === currentThemeId) || builtinThemes[0]
    );
  }, [currentThemeId]);

  // Set theme with transition
  const setTheme = useCallback(
    (themeId: string) => {
      if (themeId === currentThemeId) return;

      const newTheme = builtinThemes.find((t) => t.id === themeId);
      if (!newTheme) return;

      // Start transition
      setPreviousTheme(currentTheme);
      setIsTransitioning(true);
      setCurrentThemeId(themeId);

      // End transition after duration
      const duration =
        transitionDuration || currentTheme.animation.transitionDuration;
      setTimeout(() => {
        setIsTransitioning(false);
        setPreviousTheme(null);
      }, duration);
    },
    [currentThemeId, currentTheme, transitionDuration],
  );

  // Resolve theme based on schedules
  const resolveNow = useCallback(() => {
    const resolvedTheme = resolveTheme({
      defaultThemeId: defaultId,
      schedules,
      prayerTimes: prayerTimes || undefined,
    });

    if (resolvedTheme.id !== currentThemeId) {
      setTheme(resolvedTheme.id);
    }

    // Update debug info
    const evaluations = evaluateSchedules({
      defaultThemeId: defaultId,
      schedules,
      prayerTimes: prayerTimes || undefined,
    });
    setScheduleEvaluations(evaluations);

    const next = getNextThemeChange({
      defaultThemeId: defaultId,
      schedules,
      prayerTimes: prayerTimes || undefined,
    });
    setNextChange(next);
  }, [defaultId, schedules, prayerTimes, currentThemeId, setTheme]);

  // Initial resolution on mount
  useEffect(() => {
    if (!hasInitialized.current && enableAutoResolve) {
      hasInitialized.current = true;
      const timeoutId = setTimeout(resolveNow, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [enableAutoResolve, resolveNow]);

  // Auto-resolve on interval
  useEffect(() => {
    if (!enableAutoResolve) return;
    const interval = setInterval(resolveNow, autoResolveInterval);
    return () => clearInterval(interval);
  }, [enableAutoResolve, autoResolveInterval, resolveNow]);

  // Schedule management
  const addSchedule = useCallback((schedule: ThemeScheduleConfig) => {
    setSchedules((prev) => [...prev, schedule]);
  }, []);

  const removeSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSchedule = useCallback(
    (id: string, updates: Partial<ThemeScheduleConfig>) => {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  // Context value
  const value: ThemeContextValue = useMemo(
    () => ({
      currentTheme,
      previousTheme,
      isTransitioning,
      availableThemes: builtinThemes,
      setTheme,
      setDefaultTheme: setDefaultId,
      schedules,
      setSchedules,
      addSchedule,
      removeSchedule,
      updateSchedule,
      enableAutoResolve,
      setEnableAutoResolve,
      resolveNow,
      nextChange,
      scheduleEvaluations,
      prayerTimes,
      setPrayerTimes,
    }),
    [
      currentTheme,
      previousTheme,
      isTransitioning,
      setTheme,
      schedules,
      addSchedule,
      removeSchedule,
      updateSchedule,
      enableAutoResolve,
      resolveNow,
      nextChange,
      scheduleEvaluations,
      prayerTimes,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default AutoThemeProvider;
