// ============================================
// Minimal Layout - Clean, distraction-free
// ============================================

import type { DisplayThemeProps } from "../types";
import { ClockDisplay } from "../components/ClockDisplay";
import { PrayerTimesGrid } from "../components/PrayerTimesGrid";
import { RunningText } from "../components/RunningText";
import { CautionAlert } from "../components/CautionAlert";

export function MinimalLayout(props: DisplayThemeProps) {
  const {
    mosqueName,
    mosqueLocation,
    gregorianDate,
    hijriDate,
    formattedTime,
    prayerTimes,
    nextPrayer,
    activePrayer,
    theme,
    announcements = [],
  } = props;

  // Prayer list for minimal style (8 times)
  const prayersList = [
    {
      name: "Imsak",
      time: prayerTimes.imsak,
      icon: "dark_mode",
      iconColor: theme.colors.textMuted,
      isActive: false,
      isNext: false,
      isSpecial: true,
    },
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      icon: "light_mode",
      iconColor: theme.colors.primary,
      isActive: activePrayer === "Subuh",
      isNext: nextPrayer?.name === "Subuh",
    },
    {
      name: "Terbit",
      time: prayerTimes.terbit,
      icon: "wb_sunny",
      iconColor: theme.colors.textMuted,
      isActive: false,
      isNext: nextPrayer?.name === "Terbit",
      isSpecial: true,
    },
    {
      name: "Dhuha",
      time: prayerTimes.dhuha,
      icon: "sunny",
      iconColor: theme.colors.textMuted,
      isActive: false,
      isNext: false,
      isSpecial: true,
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
          <div className="grid grid-cols-12 gap-12 lg:gap-32 items-center max-w-6xl w-full">
            {/* Clock */}
            <div className="col-span-12 lg:col-span-7 flex flex-col items-center lg:items-end lg:pr-12">
              <div className="text-center lg:text-right">
                <ClockDisplay time={formattedTime} theme={theme} size="xl" />
                {nextPrayer && (
                  <div className="mt-6">
                    <p
                      className="text-sm mb-1 uppercase tracking-widest"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {nextPrayer.name} dalam
                    </p>
                    <p
                      className="text-4xl font-mono font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {nextPrayer.countdown}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Prayer Times */}
            <div
              className="col-span-12 lg:col-span-5 border-t lg:border-t-0 lg:border-l pt-8 lg:pt-0 lg:pl-16"
              style={{ borderColor: theme.colors.border }}
            >
              <h2
                className="text-sm uppercase tracking-widest mb-6 font-bold"
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

        {/* Footer with Running Text */}
        <footer className="mt-auto">
          <RunningText
            items={[
              `🕌 Selamat Datang di ${mosqueName}`,
              `📍 ${mosqueLocation}`,
              `🌙 ${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} H`,
              ...announcements,
            ]}
            theme={theme}
          />
        </footer>
      </div>

      {/* Caution Alert Overlay */}
      {props.caution && (
        <CautionAlert
          isActive={props.caution.isActive}
          type={props.caution.type}
          countdown={props.caution.countdown}
          theme={theme}
        />
      )}
    </div>
  );
}

export default MinimalLayout;
