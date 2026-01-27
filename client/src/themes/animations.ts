// ============================================
// Theme Animation Utilities
// Keyframe animations and transition helpers
// ============================================

import type { ThemeConfig } from "./types";

// Generate CSS keyframes for theme
export function generateThemeKeyframes(theme: ThemeConfig): string {
  const { colors } = theme;

  return `
    @keyframes theme-glow {
      0%, 100% {
        text-shadow: 0 0 20px ${colors.primary}80, 0 0 40px ${colors.primary}40;
      }
      50% {
        text-shadow: 0 0 40px ${colors.primary}, 0 0 80px ${colors.primary}60;
      }
    }

    @keyframes theme-pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.02);
      }
    }

    @keyframes theme-float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      25% {
        transform: translateY(-10px) rotate(2deg);
      }
      75% {
        transform: translateY(-5px) rotate(-2deg);
      }
    }

    @keyframes theme-shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    @keyframes theme-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes theme-slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes theme-scale-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes prayer-highlight {
      0%, 100% {
        box-shadow: 0 0 20px ${colors.primary}40;
        border-color: ${colors.primary};
      }
      50% {
        box-shadow: 0 0 40px ${colors.primary}60;
        border-color: ${colors.primary};
      }
    }
  `;
}

// Transition configuration
export interface TransitionConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// Get transition config for animation type
export function getTransitionConfig(
  type: ThemeConfig["animation"]["transitionType"],
  duration: number,
): TransitionConfig {
  switch (type) {
    case "fade":
      return {
        duration,
        easing: "ease-in-out",
      };
    case "slide":
      return {
        duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      };
    case "zoom":
      return {
        duration,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      };
    case "crossfade":
      return {
        duration: duration * 1.5,
        easing: "ease-out",
      };
    case "flip":
      return {
        duration,
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      };
    default:
      return {
        duration: 300,
        easing: "ease",
      };
  }
}

// Stagger delay for list animations
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

// Animation class generator
export function getAnimationClasses(theme: ThemeConfig): {
  clock: string;
  prayerCard: string;
  header: string;
  content: string;
} {
  const { animation } = theme;

  return {
    clock:
      animation.clockAnimation === "glow"
        ? "animate-theme-glow"
        : animation.clockAnimation === "pulse"
          ? "animate-theme-pulse"
          : "",
    prayerCard: "animate-theme-scale-in",
    header: "animate-theme-fade-in",
    content: "animate-theme-slide-up",
  };
}

// CSS variable generator for theme colors
export function generateThemeCSSVariables(
  theme: ThemeConfig,
): Record<string, string> {
  const { colors } = theme;

  return {
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
  };
}

export default {
  generateThemeKeyframes,
  getTransitionConfig,
  getStaggerDelay,
  getAnimationClasses,
  generateThemeCSSVariables,
};
