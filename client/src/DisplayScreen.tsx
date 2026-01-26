import { useState, useEffect, useMemo } from "react";
import { mosqueApi, type MosqueInfo } from "./lib/api";
import { getThemeById } from "./lib/themes";
import {
  calculatePrayerTimes,
  getNextPrayer,
  type PrayerTimesResult,
} from "./lib/prayerTimes";

export function DisplayScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mosqueInfo, setMosqueInfo] = useState< MosqueInfo | null>(null);

  // Get current theme
  const theme = useMemo(() => getThemeById(mosqueInfo?.themeId), [mosqueInfo]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch mosque data on mount
  useEffect(() => {
    const fetchMosque = async () => {
      const mosque = await mosqueApi.get();
      setMosqueInfo(mosque);
    };
    fetchMosque();
  }, []);

  // Calculate prayer times using useMemo to avoid cascading renders
  // Create a date-only value for comparison (prayer times only change daily)
  const dateString = currentTime.toDateString();

  // Create a stable date object for the current day (at midnight)
  const todayDate = useMemo(() => {
    const d = new Date(currentTime);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [dateString]);

  const prayerTimes = useMemo<PrayerTimesResult | null>(() => {
    if (!mosqueInfo) return null;

    const lat = parseFloat(mosqueInfo.coordinates.latitude);
    const lng = parseFloat(mosqueInfo.coordinates.longitude);

    if (isNaN(lat) || isNaN(lng)) return null;

    // Calculate prayer times for today using offline calculation
    return calculatePrayerTimes(todayDate, {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
      madhab: "Shafi",
    });
  }, [mosqueInfo, todayDate]); // Recalculate when date changes

  // Calculate next prayer using useMemo
  const nextPrayer = useMemo<{ name: string; time: string } | null>(() => {
    if (!mosqueInfo || !prayerTimes) return null;

    const lat = parseFloat(mosqueInfo.coordinates.latitude);
    const lng = parseFloat(mosqueInfo.coordinates.longitude);

    if (isNaN(lat) || isNaN(lng)) return null;

    const next = getNextPrayer(currentTime, {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
    });

    if (next) {
      return {
        name: next.name,
        time: next.time.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    }
    return null;
  }, [mosqueInfo, prayerTimes, currentTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate time until next prayer
  const getTimeUntilNextPrayer = () => {
    if (!nextPrayer || !mosqueInfo) return "";

    const lat = parseFloat(mosqueInfo.coordinates.latitude);
    const lng = parseFloat(mosqueInfo.coordinates.longitude);

    const next = getNextPrayer(currentTime, {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
    });

    if (!next) return "";

    const diff = next.time.getTime() - currentTime.getTime();
    if (diff < 0) return "";

    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (diffHours > 0) {
      return `${diffHours} jam ${diffMinutes} menit`;
    }
    if (diffMinutes > 0) {
      return `${diffMinutes} menit ${diffSeconds} detik`;
    }
    return `${diffSeconds} detik`;
  };

  // Loading state
  if (!mosqueInfo || !prayerTimes) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex items-center justify-center">
        <div className="text-center text-white">
          <span className="material-symbols-outlined text-8xl text-(--primary-gold) animate-pulse mb-4">
            mosque
          </span>
          <p className="text-xl">Menghitung waktu sholat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative transition-colors duration-1000"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] transform translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px] transform -translate-x-1/2 translate-y-1/2"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>

      {/* Theme Pattern Overlay */}
      <div className={`absolute inset-0 ${theme.pattern} opacity-[0.05]`} />

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ color: theme.colors.bg }}
              >
                mosque
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {mosqueInfo.name}
              </h1>
              <p className="text-white/60 text-sm">
                {mosqueInfo.address.city}, {mosqueInfo.address.province}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="text-right">
            <p className="text-white/60 text-sm uppercase tracking-widest">
              {formatDate(currentTime)}
            </p>
            <p
              className="text-sm font-medium mt-1"
              style={{ color: theme.colors.primary }}
            >
              🌙 Ramadhan 1447 H
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="grow grid grid-cols-12 gap-8">
          {/* Left - Clock & Next Prayer */}
          <div className="col-span-5 flex flex-col justify-center">
            {/* Big Clock */}
            <div className="mb-8">
              <p className="text-white/40 text-sm uppercase tracking-[0.3em] mb-2">
                Waktu Sekarang
              </p>
              <p
                className="text-8xl font-bold tracking-tight"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {formatTime(currentTime)}
              </p>
            </div>

            {/* Next Prayer Countdown */}
            {nextPrayer && (
              <div
                className="backdrop-blur-sm rounded-3xl p-6 border transition-colors duration-500"
                style={{
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: theme.colors.primary }}
                  >
                    notifications_active
                  </span>
                  <p className="text-white/60 text-sm uppercase tracking-widest">
                    Waktu Sholat Berikutnya
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h2
                      className="text-4xl font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {nextPrayer.name}
                    </h2>
                    <p className="text-white/60 mt-1">
                      dalam {getTimeUntilNextPrayer()}
                    </p>
                  </div>
                  <p
                    className="text-5xl font-bold"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {nextPrayer.time}
                  </p>
                </div>
              </div>
            )}

            {/* Calculation Info */}
            <div className="mt-4 flex items-center gap-2 text-white/30 text-xs">
              <span className="material-symbols-outlined text-sm">
                calculate
              </span>
              <span>
                Kalkulasi Offline • Metode Kemenag RI •{" "}
                {mosqueInfo.coordinates.latitude},{" "}
                {mosqueInfo.coordinates.longitude}
              </span>
            </div>
          </div>

          {/* Right - Prayer Times Grid */}
          <div className="col-span-7 flex flex-col justify-center">
            <div
              className="backdrop-blur-sm rounded-3xl p-8 border transition-colors duration-500"
              style={{
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border
              }}
            >
              <h3 className="text-white/40 text-sm uppercase tracking-[0.3em] mb-6 text-center">
                Jadwal Sholat Hari Ini
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Imsak */}
                <div
                  className="rounded-2xl p-5 border transition-all"
                  style={{
                    backgroundColor: "rgba(249, 115, 22, 0.1)", // orange-500 low opacity
                    borderColor: "rgba(249, 115, 22, 0.2)"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-orange-400 text-2xl">
                        wb_twilight
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Imsak
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold text-orange-400"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {prayerTimes.imsak}
                    </span>
                  </div>
                </div>

                {/* Subuh */}
                <div
                  className={`rounded-2xl p-5 border transition-all`}
                  style={{
                    backgroundColor: nextPrayer?.name === "Subuh" ? `${theme.colors.primary}33` : "rgba(255,255,255,0.03)",
                    borderColor: nextPrayer?.name === "Subuh" ? theme.colors.primary : theme.colors.border,
                    boxShadow: nextPrayer?.name === "Subuh" ? `0 0 15px ${theme.colors.primary}33` : "none"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-yellow-400 text-2xl">
                        light_mode
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Subuh
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: nextPrayer?.name === "Subuh" ? theme.colors.primary : "white"
                      }}
                    >
                      {prayerTimes.subuh}
                    </span>
                  </div>
                </div>

                {/* Dzuhur */}
                <div
                  className={`rounded-2xl p-5 border transition-all`}
                  style={{
                    backgroundColor: nextPrayer?.name === "Dzuhur" ? `${theme.colors.primary}33` : "rgba(255,255,255,0.03)",
                    borderColor: nextPrayer?.name === "Dzuhur" ? theme.colors.primary : theme.colors.border,
                    boxShadow: nextPrayer?.name === "Dzuhur" ? `0 0 15px ${theme.colors.primary}33` : "none"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-400 text-2xl">
                        wb_sunny
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Dzuhur
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: nextPrayer?.name === "Dzuhur" ? theme.colors.primary : "white"
                      }}
                    >
                      {prayerTimes.dzuhur}
                    </span>
                  </div>
                </div>

                {/* Ashar */}
                <div
                  className={`rounded-2xl p-5 border transition-all`}
                  style={{
                    backgroundColor: nextPrayer?.name === "Ashar" ? `${theme.colors.primary}33` : "rgba(255,255,255,0.03)",
                    borderColor: nextPrayer?.name === "Ashar" ? theme.colors.primary : theme.colors.border,
                    boxShadow: nextPrayer?.name === "Ashar" ? `0 0 15px ${theme.colors.primary}33` : "none"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-orange-400 text-2xl">
                        wb_twilight
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Ashar
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: nextPrayer?.name === "Ashar" ? theme.colors.primary : "white"
                      }}
                    >
                      {prayerTimes.ashar}
                    </span>
                  </div>
                </div>

                {/* Maghrib */}
                <div
                  className={`rounded-2xl p-5 border transition-all`}
                  style={{
                    backgroundColor: nextPrayer?.name === "Maghrib" ? `${theme.colors.accent}33` : `${theme.colors.accent}11`,
                    borderColor: nextPrayer?.name === "Maghrib" ? theme.colors.accent : `${theme.colors.accent}33`,
                    boxShadow: nextPrayer?.name === "Maghrib" ? `0 0 15px ${theme.colors.accent}33` : "none"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl" style={{ color: theme.colors.accent }}>
                        restaurant
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Maghrib
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: theme.colors.accent
                      }}
                    >
                      {prayerTimes.maghrib}
                    </span>
                  </div>
                </div>

                {/* Isya */}
                <div
                  className={`rounded-2xl p-5 border transition-all`}
                  style={{
                    backgroundColor: nextPrayer?.name === "Isya" ? `${theme.colors.primary}33` : "rgba(255,255,255,0.03)",
                    borderColor: nextPrayer?.name === "Isya" ? theme.colors.primary : theme.colors.border,
                    boxShadow: nextPrayer?.name === "Isya" ? `0 0 15px ${theme.colors.primary}33` : "none"
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-indigo-400 text-2xl">
                        bedtime
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Isya
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: nextPrayer?.name === "Isya" ? theme.colors.primary : "white"
                      }}
                    >
                      {prayerTimes.isya}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Running Text */}
        <footer className="mt-8">
          <div
            className="rounded-2xl py-3 px-6 overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <div className="animate-marquee whitespace-nowrap">
              <span
                className="font-semibold mx-8"
                style={{ color: theme.colors.bg }}
              >
                🕌 Selamat Datang di {mosqueInfo.name}
              </span>
              <span className="mx-8 opacity-50" style={{ color: theme.colors.bg }}>•</span>
              <span
                className="font-semibold mx-8"
                style={{ color: theme.colors.bg }}
              >
                📍 {mosqueInfo.address.street}, {mosqueInfo.address.city}
              </span>
              <span className="mx-8 opacity-50" style={{ color: theme.colors.bg }}>•</span>
              <span
                className="font-semibold mx-8"
                style={{ color: theme.colors.bg }}
              >
                🌙 Ramadhan Mubarak 1447 H
              </span>
              <span className="mx-8 opacity-50" style={{ color: theme.colors.bg }}>•</span>
              <span
                className="font-semibold mx-8"
                style={{ color: theme.colors.bg }}
              >
                ☎️ {mosqueInfo.phone || "Hubungi Takmir"}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DisplayScreen;
