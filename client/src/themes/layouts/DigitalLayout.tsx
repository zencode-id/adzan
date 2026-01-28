// ============================================
// Digital Layout Component
// High-contrast neon design with large clock display
// and card-based prayer times grid
// ============================================

import type { DisplayThemeProps } from "../types";
import { RunningText } from "../components/RunningText";

export function DigitalLayout({
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
  const { colors } = theme;

  // Format hijri date string
  const hijriDateString = `${hijriDate.monthName} ${hijriDate.year} H`;

  // Prayer times grid (6 prayers for the grid)
  const prayerCards = [
    {
      name: "Imsak",
      time: prayerTimes.imsak,
      icon: "wb_twilight",
      isNext: nextPrayer?.name === "Imsak",
    },
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      icon: "wb_sunny",
      isNext: nextPrayer?.name === "Subuh",
    },
    {
      name: "Dzuhur",
      time: prayerTimes.dzuhur,
      icon: "light_mode",
      isNext: nextPrayer?.name === "Dzuhur",
    },
    {
      name: "Ashar",
      time: prayerTimes.ashar,
      icon: "wb_cloudy",
      isNext: nextPrayer?.name === "Ashar",
    },
    {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      icon: "restaurant",
      isNext: nextPrayer?.name === "Maghrib",
    },
    {
      name: "Isya",
      time: prayerTimes.isya,
      icon: "nights_stay",
      isNext: nextPrayer?.name === "Isya",
    },
  ];

  // Build running text items
  const runningTextItems = [
    mosqueLocation,
    `🌙 ${hijriDateString}`,
    `📞 Hubungi Kami`,
    `🕌 Selamat Datang di ${mosqueName}`,
    ...announcements.map((a) => a),
  ];

  // Split time into parts for styling
  const timeParts = formattedTime.split(":");
  const mainTime = timeParts.slice(0, 2).join(".");
  const seconds = timeParts[2] || "00";

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <header className="p-6 lg:p-10 flex justify-between items-start w-full">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl shadow-lg"
            style={{
              backgroundColor: colors.primary,
              boxShadow: `0 0 15px ${colors.primary}66`,
            }}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ color: colors.bg }}
            >
              mosque
            </span>
          </div>
          <div>
            <h1
              className="text-2xl lg:text-3xl font-bold tracking-tight uppercase"
              style={{ color: colors.text }}
            >
              {mosqueName}
            </h1>
            <p
              className="font-medium tracking-wider"
              style={{ color: colors.textMuted }}
            >
              {mosqueLocation}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-lg lg:text-xl font-bold uppercase"
            style={{ color: colors.text }}
          >
            {gregorianDate}
          </div>
          <div
            className="flex items-center justify-end gap-2 font-bold"
            style={{ color: colors.primary }}
          >
            <span className="material-symbols-outlined text-sm">
              brightness_3
            </span>
            <span>{hijriDateString}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6">
        {/* Clock Display */}
        <div className="text-center mb-8">
          <p
            className="font-bold tracking-widest uppercase text-sm mb-2"
            style={{
              color: colors.secondary,
              textShadow: `0 0 20px ${colors.secondary}99`,
            }}
          >
            Waktu Sekarang
          </p>
          <h2
            className="text-[8rem] md:text-[12rem] lg:text-[16rem] leading-none font-black tracking-tighter tabular-nums"
            style={{ color: colors.text }}
          >
            {mainTime}
            <span style={{ color: colors.primary, opacity: 0.5 }}>
              .{seconds}
            </span>
          </h2>
        </div>

        {/* Prayer Cards Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Next Prayer Card - Large */}
          {nextPrayer && (
            <div
              className="md:col-span-1 p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden group"
              style={{
                backgroundColor: `${colors.bgSecondary}80`,
                border: `2px solid ${colors.primary}50`,
              }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span
                  className="material-symbols-outlined text-8xl"
                  style={{ color: colors.primary }}
                >
                  notifications_active
                </span>
              </div>
              <p
                className="uppercase font-bold text-sm tracking-widest mb-1 flex items-center gap-2"
                style={{ color: colors.textMuted }}
              >
                <span className="material-symbols-outlined text-base">
                  notifications
                </span>
                Waktu Sholat Berikutnya
              </p>
              <h3
                className="text-5xl lg:text-6xl font-black uppercase mb-2"
                style={{
                  color: colors.primary,
                  textShadow: `0 0 20px ${colors.primary}99`,
                }}
              >
                {nextPrayer.name}
              </h3>
              <p
                className="text-xl font-medium"
                style={{ color: colors.textSecondary }}
              >
                Dalam {nextPrayer.countdown}
              </p>
              <div
                className="mt-4 text-4xl font-bold"
                style={{ color: colors.text }}
              >
                {nextPrayer.time}
              </div>
            </div>
          )}

          {/* Prayer Times Grid */}
          <div
            className={`${nextPrayer ? "md:col-span-2" : "md:col-span-3"} grid grid-cols-3 gap-4`}
          >
            {prayerCards.map((prayer) => (
              <div
                key={prayer.name}
                className="p-4 lg:p-6 rounded-2xl flex flex-col justify-between transition-all hover:scale-105"
                style={{
                  backgroundColor: prayer.isNext
                    ? `${colors.primary}15`
                    : `${colors.bgSecondary}60`,
                  border: prayer.isNext
                    ? `2px solid ${colors.primary}80`
                    : `1px solid ${colors.border}`,
                  boxShadow: prayer.isNext
                    ? `0 0 20px ${colors.primary}20`
                    : "none",
                }}
              >
                <div className="flex justify-between items-start">
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: prayer.isNext ? colors.primary : colors.secondary,
                    }}
                  >
                    {prayer.icon}
                  </span>
                  <span
                    className="font-bold text-xs uppercase"
                    style={{
                      color: prayer.isNext ? colors.primary : colors.textMuted,
                    }}
                  >
                    {prayer.name}
                  </span>
                </div>
                <div
                  className="text-3xl lg:text-4xl font-bold mt-4"
                  style={{
                    color: prayer.isNext ? colors.primary : colors.text,
                    textShadow: prayer.isNext
                      ? `0 0 20px ${colors.primary}99`
                      : "none",
                  }}
                >
                  {prayer.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Bar */}
        <div
          className="flex items-center gap-6 text-sm font-medium"
          style={{ color: colors.textMuted }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">calculate</span>
            Metode Kemenag RI
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">
              location_on
            </span>
            {mosqueLocation}
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-green-500">
              check_circle
            </span>
            Kalkulasi Offline
          </div>
        </div>
      </main>

      {/* Footer - Running Text */}
      <footer
        className="py-4 overflow-hidden border-t mt-auto"
        style={{
          backgroundColor: colors.bgSecondary,
          borderColor: colors.border,
        }}
      >
        <RunningText
          items={runningTextItems}
          theme={theme}
          spacing={1}
          separator="•"
        />
      </footer>
    </div>
  );
}

export default DigitalLayout;
