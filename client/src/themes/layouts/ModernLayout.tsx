// ============================================
// Modern Layout - Clean, centered design
// ============================================

import type { DisplayThemeProps } from "../types";
import { BackgroundLayer } from "../components/BackgroundLayer";
import { OrnamentLayer } from "../components/OrnamentLayer";
import { ParticleEffect } from "../components/ParticleEffect";
import { ClockDisplay } from "../components/ClockDisplay";
import { DateDisplay } from "../components/DateDisplay";
import { PrayerTimesGrid } from "../components/PrayerTimesGrid";

export function ModernLayout(props: DisplayThemeProps) {
  const {
    mosqueName,
    mosqueLocation,
    formattedTime,
    gregorianDate,
    hijriDate,
    prayerTimes,
    nextPrayer,
    activePrayer,
    theme,
  } = props;

  // Simplified prayer list for horizontal bar
  const prayersList = [
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      icon: "light_mode",
      iconColor: "#facc15",
      isActive: activePrayer === "Subuh",
      isNext: nextPrayer?.name === "Subuh",
    },
    {
      name: "Dzuhur",
      time: prayerTimes.dzuhur,
      icon: "wb_sunny",
      iconColor: "#fbbf24",
      isActive: activePrayer === "Dzuhur",
      isNext: nextPrayer?.name === "Dzuhur",
    },
    {
      name: "Ashar",
      time: prayerTimes.ashar,
      icon: "wb_twilight",
      iconColor: "#fb923c",
      isActive: activePrayer === "Ashar",
      isNext: nextPrayer?.name === "Ashar",
    },
    {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      icon: "restaurant",
      iconColor: theme.colors.accent,
      isActive: activePrayer === "Maghrib",
      isNext: nextPrayer?.name === "Maghrib",
    },
    {
      name: "Isya",
      time: prayerTimes.isya,
      icon: "bedtime",
      iconColor: "#818cf8",
      isActive: activePrayer === "Isya",
      isNext: nextPrayer?.name === "Isya",
    },
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Background */}
      <BackgroundLayer theme={theme} />

      {/* Particle Effects */}
      <ParticleEffect theme={theme} type="stars" />

      {/* Ornaments */}
      <OrnamentLayer theme={theme} />

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col justify-between p-8">
        {/* Top - Mosque Name & Date */}
        <header className="flex items-start justify-between">
          <div>
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: theme.colors.text }}
            >
              {mosqueName}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: theme.colors.textMuted }}
            >
              {mosqueLocation}
            </p>
          </div>
          <DateDisplay
            gregorianDate={gregorianDate}
            hijriDate={hijriDate}
            theme={theme}
          />
        </header>

        {/* Center - Big Clock */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <ClockDisplay time={formattedTime} theme={theme} size="xl" />

          {/* Next Prayer Info */}
          {nextPrayer && (
            <div className="mt-8 text-center">
              <p
                className="text-sm uppercase tracking-widest mb-2"
                style={{ color: theme.colors.textMuted }}
              >
                Menuju
              </p>
              <div className="flex items-center gap-4">
                <span
                  className="text-4xl font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  {nextPrayer.name}
                </span>
                <span
                  className="text-2xl"
                  style={{ color: theme.colors.textSecondary }}
                >
                  •
                </span>
                <span
                  className="text-3xl font-mono"
                  style={{ color: theme.colors.text }}
                >
                  {nextPrayer.countdown}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom - Horizontal Prayer Bar */}
        <footer>
          <PrayerTimesGrid
            prayers={prayersList}
            theme={theme}
            style="horizontal"
          />
        </footer>
      </div>
    </div>
  );
}

export default ModernLayout;
