// ============================================
// Animated Clock Display Component
// With digit flip animation and glow effects
// ============================================

import { useMemo, memo, useState } from "react";
import type { ThemeConfig } from "../types";

interface AnimatedClockProps {
  time: string; // HH:MM:SS format
  theme: ThemeConfig;
  size?: "sm" | "md" | "lg" | "xl";
}

export const AnimatedClock = memo(function AnimatedClock({
  time,
  theme,
  size = "lg",
}: AnimatedClockProps) {
  const { colors, typography, animation, layout } = theme;
  // Size mappings
  const sizeConfig = {
    sm: { fontSize: "3rem", gap: "0.25rem" },
    md: { fontSize: "5rem", gap: "0.5rem" },
    lg: { fontSize: "7rem", gap: "0.75rem" },
    xl: { fontSize: "10rem", gap: "1rem" },
  };

  const config = sizeConfig[size];

  // Check if we should show seconds
  const displayTime = layout.clockShowSeconds
    ? time
    : time.split(":").slice(0, 2).join(layout.clockSeparator);

  // Track previous time to detect changes for animations
  const [prevTime, setPrevTime] = useState<string | null>(null);
  const [lastDisplayTime, setLastDisplayTime] = useState<string>(displayTime);

  // If displayTime changed, update state during render to capture previous value
  // React will re-render immediately with the new state
  if (displayTime !== lastDisplayTime) {
    setPrevTime(lastDisplayTime);
    setLastDisplayTime(displayTime);
  }

  // Track changed digits by comparing with previous time
  const changedIndices = useMemo(() => {
    const indices = new Set<number>();
    if (prevTime !== null) {
      for (let i = 0; i < displayTime.length; i++) {
        if (prevTime[i] !== displayTime[i]) {
          indices.add(i);
        }
      }
    }
    return indices;
  }, [displayTime, prevTime]);

  return (
    <div className="relative">
      {/* Main clock display */}
      <div
        className={`flex items-center justify-start ${
          animation.clockAnimation === "glow" ? "clock-glow-container" : ""
        }`}
        style={{ gap: config.gap }}
      >
        {displayTime.split("").map((char, index) => {
          const isDigit = /\d/.test(char);
          const isSeparator = char === ":" || char === layout.clockSeparator;
          const hasChanged = changedIndices.has(index);

          return (
            <span
              key={index}
              className={`
                inline-block font-bold
                ${isDigit && hasChanged ? "animate-digit-flip" : ""}
                ${isSeparator ? "animate-separator-blink" : ""}
              `}
              style={{
                fontSize: isSeparator
                  ? `calc(${config.fontSize} * 0.8)`
                  : config.fontSize,
                fontFamily: typography.fontFamily,
                fontWeight: typography.clockFontWeight,
                color: colors.text,
                textShadow:
                  animation.clockAnimation === "glow"
                    ? `0 0 30px ${colors.primary}80, 0 0 60px ${colors.primary}40, 0 0 90px ${colors.primary}20`
                    : "none",
                lineHeight: 1,
                minWidth: isSeparator ? "auto" : "0.6em",
                textAlign: "center",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Glow effect underline */}
      {animation.clockAnimation === "glow" && (
        <div
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-2 rounded-full blur-md animate-pulse"
          style={{
            backgroundColor: colors.primary,
            opacity: 0.4,
          }}
        />
      )}

      {/* Reflection effect */}
      <div
        className="absolute -bottom-8 left-0 right-0 h-16 opacity-10 pointer-events-none overflow-hidden"
        style={{
          transform: "scaleY(-1)",
          maskImage: "linear-gradient(to bottom, black, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      >
        <div
          className="flex items-center justify-start"
          style={{
            gap: config.gap,
            fontSize: config.fontSize,
            fontFamily: typography.fontFamily,
            fontWeight: typography.clockFontWeight,
            color: colors.text,
            filter: "blur(1px)",
          }}
        >
          {displayTime}
        </div>
      </div>
    </div>
  );
});

export default AnimatedClock;
