// ============================================
// Prayer Times Grid Component
// ============================================

import type { ThemeConfig } from "../types";

interface PrayerTime {
  name: string;
  time: string;
  icon: string;
  iconColor: string;
  isActive: boolean;
  isNext: boolean;
  isSpecial?: boolean; // For Imsak, Dhuha (non-wajib)
}

interface PrayerTimesGridProps {
  prayers: PrayerTime[];
  theme: ThemeConfig;
  style?: "cards" | "horizontal" | "minimal";
}

export function PrayerTimesGrid({
  prayers,
  theme,
  style = "cards",
}: PrayerTimesGridProps) {
  const { colors, typography } = theme;

  if (style === "horizontal") {
    return (
      <HorizontalStyle
        prayers={prayers}
        colors={colors}
        typography={typography}
      />
    );
  }

  if (style === "minimal") {
    return (
      <MinimalStyle prayers={prayers} colors={colors} typography={typography} />
    );
  }

  // Default: Cards style
  return (
    <CardsStyle prayers={prayers} colors={colors} typography={typography} />
  );
}

// Cards style (2 columns grid)
function CardsStyle({
  prayers,
  colors,
  typography,
}: {
  prayers: PrayerTime[];
  colors: ThemeConfig["colors"];
  typography: ThemeConfig["typography"];
}) {
  return (
    <div
      className="backdrop-blur-sm rounded-3xl p-8 border transition-all duration-500"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <h3
        className="text-sm uppercase tracking-[0.3em] mb-6 text-center"
        style={{ color: colors.textMuted }}
      >
        Jadwal Sholat Hari Ini
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {prayers.map((prayer) => (
          <PrayerCard
            key={prayer.name}
            prayer={prayer}
            colors={colors}
            typography={typography}
          />
        ))}
      </div>
    </div>
  );
}

// Individual prayer card
function PrayerCard({
  prayer,
  colors,
  typography,
}: {
  prayer: PrayerTime;
  colors: ThemeConfig["colors"];
  typography: ThemeConfig["typography"];
}) {
  const isHighlighted = prayer.isActive || prayer.isNext;

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-300 ${
        prayer.isActive ? "animate-prayer-active" : ""
      }`}
      style={{
        backgroundColor: isHighlighted
          ? `${colors.primary}33`
          : prayer.isSpecial
            ? `${prayer.iconColor}15`
            : "rgba(255,255,255,0.03)",
        borderColor: isHighlighted
          ? colors.primary
          : prayer.isSpecial
            ? `${prayer.iconColor}30`
            : colors.border,
        boxShadow: prayer.isNext ? `0 0 20px ${colors.primary}30` : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-2xl"
            style={{ color: prayer.iconColor }}
          >
            {prayer.icon}
          </span>
          <span
            className="text-lg font-medium"
            style={{ color: colors.textSecondary }}
          >
            {prayer.name}
          </span>
        </div>
        <span
          className="text-3xl font-bold"
          style={{
            fontFamily: typography.fontFamily,
            color:
              isHighlighted || prayer.isSpecial ? colors.primary : colors.text,
          }}
        >
          {prayer.time}
        </span>
      </div>
    </div>
  );
}

// Horizontal style (bottom bar)
function HorizontalStyle({
  prayers,
  colors,
  typography,
}: {
  prayers: PrayerTime[];
  colors: ThemeConfig["colors"];
  typography: ThemeConfig["typography"];
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl"
      style={{ backgroundColor: colors.card }}
    >
      {prayers.map((prayer, index) => (
        <div key={prayer.name} className="flex items-center">
          <div
            className={`flex flex-col items-center px-6 py-3 rounded-xl transition-all ${
              prayer.isNext ? "scale-110" : ""
            }`}
            style={{
              backgroundColor: prayer.isNext ? colors.primary : "transparent",
            }}
          >
            <span
              className="text-xs uppercase tracking-wider mb-1"
              style={{
                color: prayer.isNext ? colors.bg : colors.textMuted,
              }}
            >
              {prayer.name}
            </span>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: typography.fontFamily,
                color: prayer.isNext ? colors.bg : colors.text,
              }}
            >
              {prayer.time}
            </span>
          </div>
          {index < prayers.length - 1 && (
            <div
              className="w-px h-8 mx-2"
              style={{ backgroundColor: colors.border }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Minimal style (simple list)
function MinimalStyle({
  prayers,
  colors,
  typography,
}: {
  prayers: PrayerTime[];
  colors: ThemeConfig["colors"];
  typography: ThemeConfig["typography"];
}) {
  return (
    <div className="space-y-3">
      {prayers.map((prayer) => (
        <div
          key={prayer.name}
          className="flex items-center justify-between py-2 px-4 rounded-lg transition-all"
          style={{
            backgroundColor: prayer.isNext
              ? `${colors.primary}20`
              : "transparent",
          }}
        >
          <span
            className="font-medium"
            style={{
              color: prayer.isNext ? colors.primary : colors.textSecondary,
            }}
          >
            {prayer.name}
          </span>
          <span
            className="text-xl font-bold font-mono"
            style={{
              fontFamily: typography.fontFamily,
              color: prayer.isNext ? colors.primary : colors.text,
            }}
          >
            {prayer.time}
          </span>
        </div>
      ))}
    </div>
  );
}

export default PrayerTimesGrid;
