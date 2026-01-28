// ============================================
// Classic Layout - Traditional mosque display
// ============================================

import type { DisplayThemeProps } from "../types";
import { BackgroundLayer } from "../components/BackgroundLayer";
import { OrnamentLayer } from "../components/OrnamentLayer";
import { ParticleEffect } from "../components/ParticleEffect";
import { MosqueHeader } from "../components/MosqueHeader";
import { DateDisplay } from "../components/DateDisplay";
import { ClockDisplay } from "../components/ClockDisplay";
import { CountdownTimer } from "../components/CountdownTimer";
import { PrayerTimesGrid } from "../components/PrayerTimesGrid";
import { RunningText } from "../components/RunningText";
import { CautionAlert } from "../components/CautionAlert";

export function ClassicLayout(props: DisplayThemeProps) {
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
    announcements = [],
  } = props;

  // Convert prayer times to grid format
  const prayersList = [
    {
      name: "Imsak",
      time: prayerTimes.imsak,
      icon: "wb_twilight",
      iconColor: "#f97316",
      isActive: false,
      isNext: false,
      isSpecial: true,
    },
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      icon: "light_mode",
      iconColor: "#facc15",
      isActive: activePrayer === "Subuh",
      isNext: nextPrayer?.name === "Subuh",
    },
    {
      name: "Terbit",
      time: prayerTimes.terbit,
      icon: "wb_sunny",
      iconColor: "#fdba74",
      isActive: false,
      isNext: nextPrayer?.name === "Terbit",
    },
    {
      name: "Dhuha",
      time: prayerTimes.dhuha,
      icon: "sunny",
      iconColor: "#fcd34d",
      isActive: false,
      isNext: false,
      isSpecial: true,
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

  // Running text items
  const runningItems = [
    `🕌 Selamat Datang di ${mosqueName}`,
    `📍 ${mosqueLocation}`,
    `🌙 ${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} H`,
    ...announcements,
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Background */}
      <BackgroundLayer theme={theme} />

      {/* Particle Effects (stars, lanterns, etc.) */}
      <ParticleEffect theme={theme} type="stars" />

      {/* Ornaments */}
      <OrnamentLayer theme={theme} />

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <MosqueHeader
            name={mosqueName}
            location={mosqueLocation}
            theme={theme}
          />
          <DateDisplay
            gregorianDate={gregorianDate}
            hijriDate={hijriDate}
            theme={theme}
          />
        </header>

        {/* Main Content */}
        <div className="grow grid grid-cols-12 gap-8">
          {/* Left - Clock & Countdown */}
          <div className="col-span-5 flex flex-col justify-center">
            {/* Clock */}
            <div className="mb-8">
              <p
                className="text-sm uppercase tracking-[0.3em] mb-2"
                style={{ color: theme.colors.textMuted }}
              >
                Waktu Sekarang
              </p>
              <ClockDisplay time={formattedTime} theme={theme} size="lg" />
            </div>

            {/* Countdown */}
            {nextPrayer && (
              <CountdownTimer nextPrayer={nextPrayer} theme={theme} />
            )}

            {/* Calculation Info */}
            <div
              className="mt-4 flex items-center gap-2 text-xs"
              style={{ color: theme.colors.textMuted }}
            >
              <span className="material-symbols-outlined text-sm">
                calculate
              </span>
              <span>Kalkulasi Offline • Metode Kemenag RI</span>
            </div>
          </div>

          {/* Right - Prayer Times */}
          <div className="col-span-7 flex flex-col justify-center">
            <PrayerTimesGrid
              prayers={prayersList}
              theme={theme}
              style="cards"
            />
          </div>
        </div>

        <footer className="mt-8">
          <RunningText items={runningItems} theme={theme} />
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

export default ClassicLayout;
