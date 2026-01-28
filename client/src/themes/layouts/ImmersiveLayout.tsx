// ============================================
// Immersive Layout Component
// Full-screen immersive design with background image,
// vignette overlay, and glass effects
// ============================================

import type { DisplayThemeProps } from "../types";
import { RunningText } from "../components/RunningText";

export function ImmersiveLayout({
  theme,
  mosqueName,
  mosqueLocation,
  prayerTimes,
  formattedTime,
  nextPrayer,
  hijriDate,
  gregorianDate,
  announcements = [],
}: DisplayThemeProps) {
  const { colors, background } = theme;

  // Format hijri date string
  const hijriDateString = `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} H`;

  // All 8 prayer times in order
  const prayersList = [
    {
      name: "Imsak",
      time: prayerTimes.imsak,
      isNext: nextPrayer?.name === "Imsak",
    },
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      isNext: nextPrayer?.name === "Subuh",
    },
    {
      name: "Terbit",
      time: prayerTimes.terbit,
      isNext: nextPrayer?.name === "Terbit",
    },
    {
      name: "Dhuha",
      time: prayerTimes.dhuha,
      isNext: nextPrayer?.name === "Dhuha",
    },
    {
      name: "Dzuhur",
      time: prayerTimes.dzuhur,
      isNext: nextPrayer?.name === "Dzuhur",
    },
    {
      name: "Ashar",
      time: prayerTimes.ashar,
      isNext: nextPrayer?.name === "Ashar",
    },
    {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      isNext: nextPrayer?.name === "Maghrib",
    },
    {
      name: "Isya",
      time: prayerTimes.isya,
      isNext: nextPrayer?.name === "Isya",
    },
  ];

  // Build running text items
  const runningTextItems = [
    `🕌 ${mosqueName}`,
    `📍 ${mosqueLocation}`,
    `📅 ${hijriDateString}`,
    ...announcements.map((a) => `📢 ${a}`),
  ];

  // Get background image URL from theme
  const bgImageUrl = background.type === "image" ? background.value : null;

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        {bgImageUrl ? (
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url("${bgImageUrl}")` }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                background.type === "gradient" ? background.value : colors.bg,
            }}
          />
        )}

        {/* Vignette Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full px-8 lg:px-16 py-8 flex items-start justify-between">
        {/* Left: Mosque Info */}
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl backdrop-blur-sm border"
            style={{
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}30`,
              color: colors.primary,
            }}
          >
            <span className="material-symbols-outlined text-4xl">mosque</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mosqueName}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-sm"
                style={{ color: colors.primary }}
              >
                location_on
              </span>
              <span className="text-xs text-white/70 uppercase tracking-widest">
                {mosqueLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Date & Time */}
        <div className="flex flex-col items-end">
          <div className="text-right">
            <p className="text-xl font-light text-white tracking-wide">
              {formattedTime}
            </p>
            <p
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: `${colors.primary}cc` }}
            >
              {gregorianDate}
            </p>
            <p className="text-[10px] text-white/40 tracking-tight">
              {hijriDateString}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content - Countdown */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-20">
        {nextPrayer && (
          <div className="flex flex-col gap-2">
            {/* Next Prayer Label */}
            <h3
              className="text-xl lg:text-2xl font-light tracking-[0.4em] uppercase mb-2"
              style={{ color: colors.primary }}
            >
              Menuju Adzan {nextPrayer.name}
            </h3>

            {/* Giant Countdown Timer */}
            <div className="flex flex-col items-center">
              <h1 className="text-white text-[100px] md:text-[160px] lg:text-[200px] xl:text-[240px] font-extralight leading-none tracking-tighter tabular-nums">
                {nextPrayer.countdown}
              </h1>

              {/* Subtitle */}
              <div className="flex items-center gap-3 mt-4">
                <div
                  className="h-[1px] w-12"
                  style={{ backgroundColor: `${colors.primary}50` }}
                />
                <span
                  className="text-sm lg:text-base font-light tracking-[0.5em] uppercase"
                  style={{ color: `${colors.primary}99` }}
                >
                  Menit : Detik
                </span>
                <div
                  className="h-[1px] w-12"
                  style={{ backgroundColor: `${colors.primary}50` }}
                />
              </div>
            </div>
          </div>
        )}

        {!nextPrayer && (
          <h1 className="text-white text-[100px] md:text-[160px] lg:text-[200px] font-extralight leading-none tracking-tighter tabular-nums">
            {formattedTime}
          </h1>
        )}
      </main>

      {/* Bottom Section */}
      <div className="relative z-20 w-full">
        {/* Prayer Times Bar */}
        <div
          className="w-full py-6 lg:py-8 px-6"
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 gap-2">
            {prayersList.map((prayer, index) => (
              <div key={prayer.name} className="contents">
                {/* Prayer Item */}
                <div
                  className={`flex flex-col items-center transition-all duration-300 ${
                    prayer.isNext
                      ? "px-4 lg:px-8 py-3 rounded-xl"
                      : "opacity-60"
                  }`}
                  style={
                    prayer.isNext
                      ? {
                          backgroundColor: `${colors.primary}15`,
                          border: `1px solid ${colors.primary}50`,
                          boxShadow: `0 0 20px ${colors.primary}15`,
                        }
                      : {}
                  }
                >
                  <span
                    className={`text-[10px] uppercase tracking-[0.2em] mb-1 lg:mb-2 ${
                      prayer.isNext ? "font-bold" : "text-white/70"
                    }`}
                    style={prayer.isNext ? { color: colors.primary } : {}}
                  >
                    {prayer.name}
                  </span>
                  <span
                    className={`font-light ${prayer.isNext ? "text-xl lg:text-2xl font-bold" : "text-lg lg:text-xl"}`}
                    style={
                      prayer.isNext
                        ? { color: colors.primary }
                        : { color: "white" }
                    }
                  >
                    {prayer.time}
                  </span>
                </div>

                {/* Separator */}
                {index < prayersList.length - 1 && (
                  <div className="h-8 w-[1px] bg-white/10 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Running Text Footer */}
        <footer
          className="w-full py-4 px-6 lg:px-10"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <RunningText
            items={runningTextItems}
            theme={theme}
            spacing={0.75}
            separator="•"
          />
        </footer>
      </div>

      {/* Decorative Elements */}
      <div
        className="absolute bottom-48 right-10 z-10 opacity-10 hidden lg:block"
        style={{ color: colors.primary }}
      >
        <span className="material-symbols-outlined text-9xl">auto_awesome</span>
      </div>
      <div className="absolute top-40 left-10 z-10 opacity-5 hidden lg:block text-white">
        <span className="material-symbols-outlined text-[140px]">flare</span>
      </div>
    </div>
  );
}

export default ImmersiveLayout;
