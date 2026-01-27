import { useState, useEffect, useMemo } from "react";
import { mosqueApi, type MosqueInfo } from "./lib/api";
import { getThemeById } from "./lib/themes";
import {
  calculatePrayerTimes,
  getNextPrayer,
  type PrayerTimesResult,
} from "./lib/prayerTimes";
import { toHijri } from "./lib/hijriCalendar";
import { useAdzan } from "./hooks/useAdzan";

export function DisplayScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);

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

  // Parse coordinates for adzan
  const lat = mosqueInfo ? parseFloat(mosqueInfo.coordinates.latitude) : 0;
  const lng = mosqueInfo ? parseFloat(mosqueInfo.coordinates.longitude) : 0;

  // Adzan auto-playback when prayer time arrives
  // The hook handles automatic adzan playback when prayer time is reached
  useAdzan({
    prayerSettings: {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
    },
    autoStart: mosqueInfo !== null && lat !== 0 && lng !== 0,
  });

  // Calculate prayer times using useMemo to avoid cascading renders
  // Create a date-only value for comparison (prayer times only change daily)
  const dateString = currentTime.toDateString();

  // Create a stable date object for the current day (at midnight)
  // Uses dateString to only recalculate when the date changes, not every second
  const todayDate = useMemo(() => {
    const d = new Date(dateString);
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

  // Check if a prayer time is currently active (within 10 minutes of its time)
  const isActivePrayer = (prayerTimeStr: string): boolean => {
    if (!prayerTimeStr) return false;

    // Handle both "11:41" and "11.41" formats
    const separator = prayerTimeStr.includes(":") ? ":" : ".";
    const [hours, minutes] = prayerTimeStr.split(separator).map(Number);

    if (isNaN(hours) || isNaN(minutes)) return false;

    const prayerDate = new Date(currentTime);
    prayerDate.setHours(hours, minutes, 0, 0);

    const diff = currentTime.getTime() - prayerDate.getTime();
    const tenMinutes = 10 * 60 * 1000;

    // Active if current time is between prayer time and 10 minutes after
    return diff >= 0 && diff <= tenMinutes;
  };

  // Calculate time until next prayer - returns HH:MM:SS format
  const getTimeUntilNextPrayer = () => {
    if (!nextPrayer || !mosqueInfo) return "--:--:--";

    const lat = parseFloat(mosqueInfo.coordinates.latitude);
    const lng = parseFloat(mosqueInfo.coordinates.longitude);

    const next = getNextPrayer(currentTime, {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
    });

    if (!next) return "--:--:--";

    const diff = next.time.getTime() - currentTime.getTime();
    if (diff < 0) return "00:00:00";

    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${diffHours.toString().padStart(2, "0")}:${diffMinutes.toString().padStart(2, "0")}:${diffSeconds.toString().padStart(2, "0")}`;
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
              🌙 {toHijri(currentTime).day} {toHijri(currentTime).monthName}{" "}
              {toHijri(currentTime).year} H
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
                  borderColor: theme.colors.border,
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
                    <p className="text-white/60 mt-1 text-sm">
                      pukul {nextPrayer.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-1">
                      Hitung Mundur
                    </p>
                    <p
                      className="text-5xl font-bold font-mono"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {getTimeUntilNextPrayer()}
                    </p>
                  </div>
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
                borderColor: theme.colors.border,
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
                    borderColor: "rgba(249, 115, 22, 0.2)",
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
                  className={`rounded-2xl p-5 border transition-all ${isActivePrayer(prayerTimes.subuh) ? "animate-prayer-active" : ""}`}
                  style={{
                    backgroundColor:
                      nextPrayer?.name === "Subuh" ||
                      isActivePrayer(prayerTimes.subuh)
                        ? `${theme.colors.primary}33`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      nextPrayer?.name === "Subuh" ||
                      isActivePrayer(prayerTimes.subuh)
                        ? theme.colors.primary
                        : theme.colors.border,
                    boxShadow:
                      nextPrayer?.name === "Subuh"
                        ? `0 0 15px ${theme.colors.primary}33`
                        : "none",
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
                        color:
                          nextPrayer?.name === "Subuh"
                            ? theme.colors.primary
                            : "white",
                      }}
                    >
                      {prayerTimes.subuh}
                    </span>
                  </div>
                </div>

                {/* Terbit/Syuruq */}
                <div
                  className={`rounded-2xl p-5 border transition-all`}
                  style={{
                    backgroundColor:
                      nextPrayer?.name === "Terbit"
                        ? `${theme.colors.primary}33`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      nextPrayer?.name === "Terbit"
                        ? theme.colors.primary
                        : theme.colors.border,
                    boxShadow:
                      nextPrayer?.name === "Terbit"
                        ? `0 0 15px ${theme.colors.primary}33`
                        : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-orange-300 text-2xl">
                        wb_sunny
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Terbit
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color:
                          nextPrayer?.name === "Terbit"
                            ? theme.colors.primary
                            : "white",
                      }}
                    >
                      {prayerTimes.terbit}
                    </span>
                  </div>
                </div>

                {/* Dhuha */}
                <div
                  className="rounded-2xl p-5 border transition-all"
                  style={{
                    backgroundColor: "rgba(251, 191, 36, 0.1)", // amber-400 low opacity
                    borderColor: "rgba(251, 191, 36, 0.2)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-amber-300 text-2xl">
                        sunny
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Dhuha
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold text-amber-300"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {prayerTimes.dhuha}
                    </span>
                  </div>
                </div>

                {/* Dzuhur */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${isActivePrayer(prayerTimes.dzuhur) ? "animate-prayer-active" : ""}`}
                  style={{
                    backgroundColor:
                      nextPrayer?.name === "Dzuhur" ||
                      isActivePrayer(prayerTimes.dzuhur)
                        ? `${theme.colors.primary}33`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      nextPrayer?.name === "Dzuhur" ||
                      isActivePrayer(prayerTimes.dzuhur)
                        ? theme.colors.primary
                        : theme.colors.border,
                    boxShadow:
                      nextPrayer?.name === "Dzuhur"
                        ? `0 0 15px ${theme.colors.primary}33`
                        : "none",
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
                        color:
                          nextPrayer?.name === "Dzuhur"
                            ? theme.colors.primary
                            : "white",
                      }}
                    >
                      {prayerTimes.dzuhur}
                    </span>
                  </div>
                </div>

                {/* Ashar */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${isActivePrayer(prayerTimes.ashar) ? "animate-prayer-active" : ""}`}
                  style={{
                    backgroundColor:
                      nextPrayer?.name === "Ashar" ||
                      isActivePrayer(prayerTimes.ashar)
                        ? `${theme.colors.primary}33`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      nextPrayer?.name === "Ashar" ||
                      isActivePrayer(prayerTimes.ashar)
                        ? theme.colors.primary
                        : theme.colors.border,
                    boxShadow:
                      nextPrayer?.name === "Ashar"
                        ? `0 0 15px ${theme.colors.primary}33`
                        : "none",
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
                        color:
                          nextPrayer?.name === "Ashar"
                            ? theme.colors.primary
                            : "white",
                      }}
                    >
                      {prayerTimes.ashar}
                    </span>
                  </div>
                </div>

                {/* Maghrib */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${isActivePrayer(prayerTimes.maghrib) ? "animate-prayer-active" : ""}`}
                  style={{
                    backgroundColor:
                      nextPrayer?.name === "Maghrib" ||
                      isActivePrayer(prayerTimes.maghrib)
                        ? `${theme.colors.accent}33`
                        : `${theme.colors.accent}11`,
                    borderColor:
                      nextPrayer?.name === "Maghrib" ||
                      isActivePrayer(prayerTimes.maghrib)
                        ? theme.colors.accent
                        : `${theme.colors.accent}33`,
                    boxShadow:
                      nextPrayer?.name === "Maghrib"
                        ? `0 0 15px ${theme.colors.accent}33`
                        : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={{ color: theme.colors.accent }}
                      >
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
                        color: theme.colors.accent,
                      }}
                    >
                      {prayerTimes.maghrib}
                    </span>
                  </div>
                </div>

                {/* Isya */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${isActivePrayer(prayerTimes.isya) ? "animate-prayer-active" : ""}`}
                  style={{
                    backgroundColor:
                      nextPrayer?.name === "Isya" ||
                      isActivePrayer(prayerTimes.isya)
                        ? `${theme.colors.primary}33`
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      nextPrayer?.name === "Isya" ||
                      isActivePrayer(prayerTimes.isya)
                        ? theme.colors.primary
                        : theme.colors.border,
                    boxShadow:
                      nextPrayer?.name === "Isya"
                        ? `0 0 15px ${theme.colors.primary}33`
                        : "none",
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
                        color:
                          nextPrayer?.name === "Isya"
                            ? theme.colors.primary
                            : "white",
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
              <span
                className="mx-8 opacity-50"
                style={{ color: theme.colors.bg }}
              >
                •
              </span>
              <span
                className="font-semibold mx-8"
                style={{ color: theme.colors.bg }}
              >
                📍 {mosqueInfo.address.street}, {mosqueInfo.address.city}
              </span>
              <span
                className="mx-8 opacity-50"
                style={{ color: theme.colors.bg }}
              >
                •
              </span>
              <span
                className="font-semibold mx-8"
                style={{ color: theme.colors.bg }}
              >
                🌙 {toHijri(currentTime).day} {toHijri(currentTime).monthName}{" "}
                {toHijri(currentTime).year} H
              </span>
              <span
                className="mx-8 opacity-50"
                style={{ color: theme.colors.bg }}
              >
                •
              </span>
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
