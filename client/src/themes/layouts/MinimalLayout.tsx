// ============================================
// Minimal Layout - Clean, distraction-free
// ============================================

import type { DisplayThemeProps } from "../types";
import { ClockDisplay } from "../components/ClockDisplay";
import { PrayerTimesGrid } from "../components/PrayerTimesGrid";

export function MinimalLayout(props: DisplayThemeProps) {
  const {
    mosqueName,
    gregorianDate,
    formattedTime,
    prayerTimes,
    nextPrayer,
    activePrayer,
    theme,
  } = props;

  // Prayer list for minimal style
  const prayersList = [
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      icon: "light_mode",
      iconColor: theme.colors.primary,
      isActive: activePrayer === "Subuh",
      isNext: nextPrayer?.name === "Subuh",
    },
    {
      name: "Dzuhur",
      time: prayerTimes.dzuhur,
      icon: "wb_sunny",
      iconColor: theme.colors.primary,
      isActive: activePrayer === "Dzuhur",
      isNext: nextPrayer?.name === "Dzuhur",
    },
    {
      name: "Ashar",
      time: prayerTimes.ashar,
      icon: "wb_twilight",
      iconColor: theme.colors.primary,
      isActive: activePrayer === "Ashar",
      isNext: nextPrayer?.name === "Ashar",
    },
    {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      icon: "restaurant",
      iconColor: theme.colors.primary,
      isActive: activePrayer === "Maghrib",
      isNext: nextPrayer?.name === "Maghrib",
    },
    {
      name: "Isya",
      time: prayerTimes.isya,
      icon: "bedtime",
      iconColor: theme.colors.primary,
      isActive: activePrayer === "Isya",
      isNext: nextPrayer?.name === "Isya",
    },
  ];

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <div className="h-screen flex flex-col p-12">
        {/* Header - Simple */}
        <header className="flex items-center justify-between mb-auto">
          <h1
            className="text-2xl font-medium"
            style={{ color: theme.colors.text }}
          >
            {mosqueName}
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            {gregorianDate}
          </p>
        </header>

        {/* Center - Clock & Next Prayer */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-24 items-center max-w-5xl w-full">
            {/* Clock */}
            <div>
              <ClockDisplay time={formattedTime} theme={theme} size="xl" />
              {nextPrayer && (
                <div className="mt-6">
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {nextPrayer.name} dalam
                  </p>
                  <p
                    className="text-3xl font-mono font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    {nextPrayer.countdown}
                  </p>
                </div>
              )}
            </div>

            {/* Prayer Times */}
            <div
              className="border-l pl-12"
              style={{ borderColor: theme.colors.border }}
            >
              <h2
                className="text-sm uppercase tracking-widest mb-6"
                style={{ color: theme.colors.textMuted }}
              >
                Jadwal Hari Ini
              </h2>
              <PrayerTimesGrid
                prayers={prayersList}
                theme={theme}
                style="minimal"
              />
            </div>
          </div>
        </div>

        {/* Footer - Empty space for balance */}
        <footer className="mt-auto" />
      </div>
    </div>
  );
}

export default MinimalLayout;
