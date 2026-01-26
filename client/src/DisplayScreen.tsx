import { useState, useEffect, useMemo } from "react";
import { mosqueApi, type MosqueInfo } from "./lib/api";
import {
  calculatePrayerTimes,
  getNextPrayer,
  type PrayerTimesResult,
} from "./lib/prayerTimes";

export function DisplayScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);

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
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-(--primary-gold) rounded-full blur-[200px] transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[150px] transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-[0.02]" />

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "var(--primary-gold)" }}
            >
              <span className="material-symbols-outlined text-emerald-950 text-4xl">
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
            <p className="text-(--primary-gold) text-sm font-medium mt-1">
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
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-(--primary-gold)">
                    notifications_active
                  </span>
                  <p className="text-white/60 text-sm uppercase tracking-widest">
                    Waktu Sholat Berikutnya
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-(--primary-gold)">
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
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="text-white/40 text-sm uppercase tracking-[0.3em] mb-6 text-center">
                Jadwal Sholat Hari Ini
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Imsak */}
                <div className="bg-linear-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-5 border border-orange-500/20">
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
                  className={`rounded-2xl p-5 border transition-all ${
                    nextPrayer?.name === "Subuh"
                      ? "bg-(--primary-gold)/20 border-(--primary-gold)/50 ring-2 ring-(--primary-gold)/30"
                      : "bg-white/5 border-white/10"
                  }`}
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
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {prayerTimes.subuh}
                    </span>
                  </div>
                </div>

                {/* Dzuhur */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${
                    nextPrayer?.name === "Dzuhur"
                      ? "bg-(--primary-gold)/20 border-(--primary-gold)/50 ring-2 ring-(--primary-gold)/30"
                      : "bg-white/5 border-white/10"
                  }`}
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
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {prayerTimes.dzuhur}
                    </span>
                  </div>
                </div>

                {/* Ashar */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${
                    nextPrayer?.name === "Ashar"
                      ? "bg-(--primary-gold)/20 border-(--primary-gold)/50 ring-2 ring-(--primary-gold)/30"
                      : "bg-white/5 border-white/10"
                  }`}
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
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {prayerTimes.ashar}
                    </span>
                  </div>
                </div>

                {/* Maghrib */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${
                    nextPrayer?.name === "Maghrib"
                      ? "bg-(--primary-gold)/20 border-(--primary-gold)/50 ring-2 ring-(--primary-gold)/30"
                      : "bg-linear-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-400 text-2xl">
                        restaurant
                      </span>
                      <span className="text-lg font-medium text-white/80">
                        Maghrib
                      </span>
                    </div>
                    <span
                      className="text-3xl font-bold text-emerald-400"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {prayerTimes.maghrib}
                    </span>
                  </div>
                </div>

                {/* Isya */}
                <div
                  className={`rounded-2xl p-5 border transition-all ${
                    nextPrayer?.name === "Isya"
                      ? "bg-(--primary-gold)/20 border-(--primary-gold)/50 ring-2 ring-(--primary-gold)/30"
                      : "bg-white/5 border-white/10"
                  }`}
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
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
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
          <div className="bg-(--primary-gold) rounded-2xl py-3 px-6 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-emerald-950 font-semibold mx-8">
                🕌 Selamat Datang di {mosqueInfo.name}
              </span>
              <span className="text-emerald-950/70 mx-8">•</span>
              <span className="text-emerald-950 font-semibold mx-8">
                📍 {mosqueInfo.address.street}, {mosqueInfo.address.city}
              </span>
              <span className="text-emerald-950/70 mx-8">•</span>
              <span className="text-emerald-950 font-semibold mx-8">
                🌙 Ramadhan Mubarak 1447 H
              </span>
              <span className="text-emerald-950/70 mx-8">•</span>
              <span className="text-emerald-950 font-semibold mx-8">
                ☎️ {mosqueInfo.phone || "Hubungi Takmir"}
              </span>
              <span className="text-emerald-950/70 mx-8">•</span>
              <span className="text-emerald-950 font-semibold mx-8">
                🕌 Selamat Datang di {mosqueInfo.name}
              </span>
              <span className="text-emerald-950/70 mx-8">•</span>
              <span className="text-emerald-950 font-semibold mx-8">
                📍 {mosqueInfo.address.street}, {mosqueInfo.address.city}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DisplayScreen;
