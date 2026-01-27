// ============================================
// Theme System - Main Export
// ============================================

// Types
export type {
  ThemeConfig,
  ThemeColors,
  ThemeTypography,
  ThemeBackground,
  ThemeOrnaments,
  ThemeOrnamentItem,
  ThemeLayout,
  ThemeAnimation,
  DisplayThemeProps,
  ThemeScheduleConfig,
  ThemeContextState,
} from "./types";

// Presets
export {
  builtinThemes,
  emeraldClassic,
  sunsetWarm,
  nightSky,
  minimalistWhite,
  ramadanKareem,
  getThemeById,
  createCustomTheme,
} from "./presets";

// Animations & Utilities
export {
  generateThemeKeyframes,
  generateThemeCSSVariables,
  getTransitionConfig,
  getStaggerDelay,
  getAnimationClasses,
} from "./animations";

// Theme Resolver
export {
  resolveTheme,
  evaluateSchedules,
  getNextThemeChange,
  convertToScheduleConfig,
  type PrayerTimes,
  type NextThemeChange,
  type ScheduleEvaluation,
  type SimpleSchedule,
} from "./resolver";

// Theme Context (new auto-resolve context)
export { AutoThemeProvider, ThemeContext } from "./ThemeContext";
export type { ThemeContextValue } from "./ThemeContext";

// Theme Context Hooks
export {
  useAutoTheme,
  useThemeStyles,
  useThemeTransition,
} from "./useThemeHooks";

// Legacy Provider & Hooks (display-focused)
export { ThemeProvider } from "./ThemeProvider";
export { useTheme, usePrayerTheme } from "./legacyThemeContext";

// Components
export {
  ThemeTransition,
  EnhancedTransition,
  BackgroundLayer,
  OrnamentLayer,
  ParticleEffect,
  ClockDisplay,
  AnimatedClock,
  CountdownTimer,
  PrayerTimesGrid,
  AnimatedPrayerCard,
  DateDisplay,
  RunningText,
  MosqueHeader,
} from "./components";

// Layouts
export { ClassicLayout, ModernLayout, MinimalLayout } from "./layouts";

// Main Display Component
export { ThemedDisplay } from "./ThemedDisplay";

// Debug Tools
export { ThemeDebugPanel } from "./ThemeDebugPanel";
