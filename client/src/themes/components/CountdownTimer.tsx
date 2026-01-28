// ============================================
// Countdown Timer Component
// ============================================

import { useState, useEffect } from "react";
import type { ThemeConfig } from "../types";

interface CountdownTimerProps {
  nextPrayer?: {
    name: string;
    time: string;
    countdown: string;
  };
  targetTime?: string; // For immersive format - just the time
  theme: ThemeConfig;
  format?: "default" | "compact" | "immersive";
}

// Calculate countdown from target time
function useCountdown(targetTime?: string) {
  const [countdown, setCountdown] = useState("00:00");

  useEffect(() => {
    if (!targetTime) return;

    const calculateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      // If target is in the past, assume it's for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const totalMinutes = Math.floor(diff / 60000);
      const mins = totalMinutes % 60;
      const secs = Math.floor((diff % 60000) / 1000);

      setCountdown(
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
      );
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return countdown;
}

export function CountdownTimer({
  nextPrayer,
  targetTime,
  theme,
  format = "default",
}: CountdownTimerProps) {
  const { colors, typography } = theme;
  const calculatedCountdown = useCountdown(targetTime);
  const displayCountdown = nextPrayer?.countdown || calculatedCountdown;

  // Immersive format - Giant countdown for full-screen displays
  if (format === "immersive") {
    return (
      <h1
        className="text-white text-[100px] md:text-[160px] lg:text-[200px] xl:text-[240px] font-extralight leading-none tracking-tighter tabular-nums"
        style={{
          fontFamily: typography.fontFamily,
        }}
      >
        {displayCountdown}
      </h1>
    );
  }

  // Compact format
  if (format === "compact") {
    return (
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-sm"
          style={{ color: colors.primary }}
        >
          timer
        </span>
        <span
          className="text-lg font-bold font-mono"
          style={{ color: colors.text }}
        >
          {displayCountdown}
        </span>
      </div>
    );
  }

  // Default format with card
  if (!nextPrayer) return null;

  return (
    <div
      className="backdrop-blur-sm rounded-3xl p-6 border transition-all duration-500"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="material-symbols-outlined"
          style={{ color: colors.primary }}
        >
          notifications_active
        </span>
        <p
          className="text-sm uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          Waktu Sholat Berikutnya
        </p>
      </div>

      {/* Content */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-bold" style={{ color: colors.primary }}>
            {nextPrayer.name}
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            pukul {nextPrayer.time}
          </p>
        </div>

        <div className="text-right">
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: colors.textMuted }}
          >
            Hitung Mundur
          </p>
          <p
            className="text-5xl font-bold font-mono"
            style={{
              fontFamily: typography.fontFamily,
              color: colors.text,
            }}
          >
            {nextPrayer.countdown}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CountdownTimer;
