// ============================================
// Theme Context Hooks
// Custom hooks for theme context
// ============================================

import { useContext, useMemo } from "react";
import { ThemeContext, type ThemeContextValue } from "./themeContextDef";

// ============================================
// Hook to use theme context
// ============================================

export function useAutoTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAutoTheme must be used within an AutoThemeProvider");
  }
  return context;
}

// ============================================
// Hook for theme CSS variables
// ============================================

export function useThemeStyles(): React.CSSProperties {
  const { currentTheme } = useAutoTheme();

  return useMemo(() => {
    const { colors, typography, background, animation } = currentTheme;

    return {
      // Colors
      "--theme-primary": colors.primary,
      "--theme-secondary": colors.secondary,
      "--theme-accent": colors.accent,
      "--theme-bg": colors.bg,
      "--theme-bg-secondary": colors.bgSecondary,
      "--theme-text": colors.text,
      "--theme-text-secondary": colors.textSecondary,
      "--theme-text-muted": colors.textMuted,
      "--theme-card": colors.card,
      "--theme-card-hover": colors.cardHover,
      "--theme-border": colors.border,

      // Typography
      "--theme-font-family": typography.fontFamily,
      "--theme-clock-size": typography.clockFontSize,
      "--theme-clock-weight": typography.clockFontWeight,

      // Background
      "--theme-bg-type": background.type,
      "--theme-bg-value": background.value,
      "--theme-bg-overlay": background.overlay || "transparent",
      "--theme-bg-overlay-opacity":
        background.overlayOpacity?.toString() || "0",

      // Animation
      "--theme-transition-duration": `${animation.transitionDuration}ms`,
    } as React.CSSProperties;
  }, [currentTheme]);
}

// ============================================
// Hook for transition state
// ============================================

export function useThemeTransition() {
  const { currentTheme, previousTheme, isTransitioning } = useAutoTheme();

  return {
    currentTheme,
    previousTheme,
    isTransitioning,
    transitionType: currentTheme.animation.transitionType,
    transitionDuration: currentTheme.animation.transitionDuration,
  };
}
