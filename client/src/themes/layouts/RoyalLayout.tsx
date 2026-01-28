// ============================================
// Royal Layout Component
// Elegant gold-themed design with astronomical rings
// and floating prayer time cards
// ============================================

import type { DisplayThemeProps } from "../types";

export function RoyalLayout({
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

  // Left side prayers
  const leftPrayers = [
    {
      name: "Imsak",
      time: prayerTimes.imsak,
      icon: "wb_twilight",
      position: "top-[10%] left-[10%]",
    },
    {
      name: "Subuh",
      time: prayerTimes.subuh,
      icon: "wb_sunny",
      position: "top-[40%] left-[2%]",
    },
    {
      name: "Dzuhur",
      time: prayerTimes.dzuhur,
      icon: "light_mode",
      position: "bottom-[15%] left-[10%]",
    },
  ];

  // Right side prayers
  const rightPrayers = [
    {
      name: "Ashar",
      time: prayerTimes.ashar,
      icon: "wb_cloudy",
      position: "top-[10%] right-[10%]",
    },
    {
      name: "Maghrib",
      time: prayerTimes.maghrib,
      icon: "nights_stay",
      position: "top-[40%] right-[2%]",
    },
    {
      name: "Isya",
      time: prayerTimes.isya,
      icon: "dark_mode",
      position: "bottom-[15%] right-[10%]",
    },
  ];

  // Build running text items
  const runningTextItems = [
    `🕌 Selamat Datang di ${mosqueName}`,
    `📞 Hubungi Kami`,
    `🌙 Mari Bersama Menuju Keberkahan di Bulan ${hijriDateString}`,
    `📍 ${mosqueLocation}`,
    ...announcements.map((a) => a),
  ];

  // Split time for display
  const timeParts = formattedTime.split(":");
  const mainTime = timeParts.slice(0, 2).join(":");
  const seconds = timeParts[2] || "00";

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Header */}
      <header className="p-8 flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
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
              className="text-xl lg:text-2xl tracking-widest uppercase"
              style={{ color: colors.primary, fontFamily: "Cinzel, serif" }}
            >
              {mosqueName}
            </h1>
            <p
              className="text-sm opacity-70 tracking-wider"
              style={{ color: colors.textSecondary }}
            >
              {mosqueLocation}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-lg lg:text-xl uppercase"
            style={{ color: colors.primary, fontFamily: "Cinzel, serif" }}
          >
            {gregorianDate}
          </div>
          <div
            className="flex items-center justify-end gap-2 text-sm opacity-80 mt-1"
            style={{ color: colors.textSecondary }}
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ color: colors.primary }}
            >
              brightness_3
            </span>
            <span>{hijriDateString}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative flex items-center justify-center overflow-hidden">
        {/* Astronomical Rings */}
        <div
          className="absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            border: `1px solid ${colors.primary}15`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "800px",
            height: "800px",
            border: `1px solid ${colors.primary}10`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute rounded-full opacity-50"
          style={{
            width: "1000px",
            height: "1000px",
            border: `1px solid ${colors.primary}08`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Center Content */}
        <div className="relative w-full max-w-6xl h-[600px] flex items-center justify-center">
          {/* Clock & Next Prayer */}
          <div className="relative z-20 flex flex-col items-center text-center">
            <div
              className="text-xs uppercase tracking-[0.4em] opacity-60 mb-2"
              style={{ color: colors.primary }}
            >
              Waktu Sekarang
            </div>
            <div
              className="text-[80px] lg:text-[120px] font-extrabold leading-none tracking-tighter"
              style={{ color: colors.text }}
            >
              {mainTime}
              <span style={{ color: colors.primary, opacity: 0.5 }}>
                .{seconds}
              </span>
            </div>

            {/* Next Prayer Card */}
            {nextPrayer && (
              <div
                className="mt-8 backdrop-blur-md p-6 rounded-2xl w-64"
                style={{
                  backgroundColor: `${colors.text}08`,
                  border: `1px solid ${colors.primary}30`,
                  boxShadow: `0 0 20px ${colors.primary}20`,
                }}
              >
                <div
                  className="flex items-center justify-center gap-2 mb-2"
                  style={{ color: colors.primary }}
                >
                  <span className="material-symbols-outlined text-sm">
                    notifications_active
                  </span>
                  <span className="text-[10px] uppercase tracking-widest">
                    Waktu Sholat Berikutnya
                  </span>
                </div>
                <div
                  className="text-2xl lg:text-3xl uppercase tracking-widest"
                  style={{ fontFamily: "Cinzel, serif", color: colors.text }}
                >
                  {nextPrayer.name}
                </div>
                <div
                  className="text-3xl lg:text-4xl font-bold mt-1"
                  style={{ color: colors.primary }}
                >
                  {nextPrayer.time}
                </div>
                <div
                  className="text-xs opacity-60 mt-2 italic"
                  style={{ color: colors.textSecondary }}
                >
                  dalam {nextPrayer.countdown}
                </div>
              </div>
            )}
          </div>

          {/* Left Prayer Cards */}
          {leftPrayers.map((prayer) => (
            <div
              key={prayer.name}
              className={`absolute ${prayer.position} w-40 lg:w-44 backdrop-blur-sm p-4 rounded-r-xl transition-all hover:bg-white/10`}
              style={{
                backgroundColor: `${colors.text}08`,
                borderLeft: `4px solid ${colors.primary}`,
              }}
            >
              <div
                className="flex items-center gap-2 mb-1"
                style={{ color: colors.primary }}
              >
                <span className="material-symbols-outlined text-lg">
                  {prayer.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {prayer.name}
                </span>
              </div>
              <div
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: colors.text }}
              >
                {prayer.time}
              </div>
            </div>
          ))}

          {/* Right Prayer Cards */}
          {rightPrayers.map((prayer) => (
            <div
              key={prayer.name}
              className={`absolute ${prayer.position} w-40 lg:w-44 backdrop-blur-sm p-4 rounded-l-xl text-right transition-all hover:bg-white/10`}
              style={{
                backgroundColor: `${colors.text}08`,
                borderRight: `4px solid ${colors.primary}`,
              }}
            >
              <div
                className="flex items-center justify-end gap-2 mb-1"
                style={{ color: colors.primary }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {prayer.name}
                </span>
                <span className="material-symbols-outlined text-lg">
                  {prayer.icon}
                </span>
              </div>
              <div
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: colors.text }}
              >
                {prayer.time}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div
          className="absolute bottom-8 left-8 flex items-center gap-2 text-[10px] opacity-40 uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          <span className="material-symbols-outlined text-xs">settings</span>
          Kalkulasi Offline • Metode Kemenag RI • {mosqueLocation}
        </div>
      </main>

      {/* Footer - Running Text */}
      <footer
        className="py-2 relative overflow-hidden"
        style={{ backgroundColor: colors.primary }}
      >
        <div
          className="animate-marquee whitespace-nowrap inline-flex items-center font-medium uppercase tracking-wider text-xs"
          style={{ color: colors.bg }}
        >
          {runningTextItems.map((item, index) => (
            <span key={index} className="inline-flex items-center gap-4 px-6">
              <span>{item}</span>
              {index < runningTextItems.length - 1 && (
                <span className="text-base opacity-50">•</span>
              )}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {runningTextItems.map((item, index) => (
            <span key={`dup-${index}`} className="inline-flex items-center gap-4 px-6">
              <span>{item}</span>
              {index < runningTextItems.length - 1 && (
                <span className="text-base opacity-50">•</span>
              )}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default RoyalLayout;
