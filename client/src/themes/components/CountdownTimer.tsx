// ============================================
// Countdown Timer Component
// ============================================

import type { ThemeConfig } from "../types";

interface CountdownTimerProps {
  nextPrayer: {
    name: string;
    time: string;
    countdown: string;
  };
  theme: ThemeConfig;
}

export function CountdownTimer({ nextPrayer, theme }: CountdownTimerProps) {
  const { colors, typography } = theme;

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
