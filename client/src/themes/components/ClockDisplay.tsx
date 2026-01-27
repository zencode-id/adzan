// ============================================
// Clock Display Component
// ============================================

import type { ThemeConfig } from "../types";

interface ClockDisplayProps {
  time: string;
  theme: ThemeConfig;
  size?: "sm" | "md" | "lg" | "xl";
}

export function ClockDisplay({ time, theme, size = "lg" }: ClockDisplayProps) {
  const { colors, typography, animation, layout } = theme;

  // Size mappings
  const sizeClasses = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
    xl: "text-[10rem]",
  };

  // Animation class
  const getAnimationClass = (): string => {
    switch (animation.clockAnimation) {
      case "pulse":
        return "animate-pulse";
      case "glow":
        return "clock-glow";
      case "bounce":
        return "animate-bounce-subtle";
      default:
        return "";
    }
  };

  // Format time based on settings
  const formatTime = (): string => {
    if (!layout.clockShowSeconds) {
      // Remove seconds from HH:MM:SS format
      const parts = time.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}${layout.clockSeparator}${parts[1]}`;
      }
    }
    // Replace colons with configured separator
    return time.replace(/:/g, layout.clockSeparator);
  };

  return (
    <div className={`relative ${getAnimationClass()}`}>
      <p
        className={`${sizeClasses[size]} font-bold tracking-tight`}
        style={{
          fontFamily: typography.fontFamily,
          fontWeight: typography.clockFontWeight,
          color: colors.text,
          textShadow:
            animation.clockAnimation === "glow"
              ? `0 0 40px ${colors.primary}80, 0 0 80px ${colors.primary}40`
              : "none",
        }}
      >
        {formatTime()}
      </p>

      {/* Glow effect underline */}
      {animation.clockAnimation === "glow" && (
        <div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 rounded-full blur-sm"
          style={{ backgroundColor: colors.primary, opacity: 0.5 }}
        />
      )}
    </div>
  );
}

export default ClockDisplay;
