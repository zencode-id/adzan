// ============================================
// Themed Display Screen
// Renders the appropriate layout based on active theme
// ============================================

import { useState, useEffect, useMemo } from "react";
import { mosqueApi, type MosqueInfo } from "../lib/api";
import {
  calculatePrayerTimes,
  getNextPrayer,
  type PrayerTimesResult,
} from "../lib/prayerTimes";
import { toHijri } from "../lib/hijriCalendar";
import { useAdzan } from "../hooks/useAdzan";

import type { DisplayThemeProps } from "./types";
import { useAutoTheme } from "./useThemeHooks";
import { ThemeTransition } from "./components/ThemeTransition";
import { ThemeDebugPanel } from "./ThemeDebugPanel";
import { ClassicLayout } from "./layouts/ClassicLayout";
import { ModernLayout } from "./layouts/ModernLayout";
import { MinimalLayout } from "./layouts/MinimalLayout";

export function ThemedDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);

  // Use global auto theme context
  const { currentTheme, isTransitioning } = useAutoTheme();

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

  // Adzan auto-playback
  useAdzan({
    prayerSettings: {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
    },
    autoStart: mosqueInfo !== null && lat !== 0 && lng !== 0,
  });

  // Calculate prayer times
  const dateString = currentTime.toDateString();
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

    return calculatePrayerTimes(todayDate, {
      latitude: lat,
      longitude: lng,
      calculationMethod: "Kemenag",
      madhab: "Shafi",
    });
  }, [mosqueInfo, todayDate]);

  // Calculate next prayer
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

  // Helper functions
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

  const isActivePrayer = (prayerTimeStr: string): string | null => {
    if (!prayerTimeStr) return null;

    const separator = prayerTimeStr.includes(":") ? ":" : ".";
    const [hours, minutes] = prayerTimeStr.split(separator).map(Number);

    if (isNaN(hours) || isNaN(minutes)) return null;

    const prayerDate = new Date(currentTime);
    prayerDate.setHours(hours, minutes, 0, 0);

    const diff = currentTime.getTime() - prayerDate.getTime();
    const tenMinutes = 10 * 60 * 1000;

    return diff >= 0 && diff <= tenMinutes ? "active" : null;
  };

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

  // Determine active prayer
  const getActivePrayer = (): string | null => {
    if (!prayerTimes) return null;
    const prayers = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;
    for (const prayer of prayers) {
      if (isActivePrayer(prayerTimes[prayer])) {
        return prayer.charAt(0).toUpperCase() + prayer.slice(1);
      }
    }
    return null;
  };

  // Loading state
  if (!mosqueInfo || !prayerTimes) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.bg }}
      >
        <div
          className="text-center"
          style={{ color: currentTheme.colors.text }}
        >
          <span
            className="material-symbols-outlined text-8xl animate-pulse mb-4"
            style={{ color: currentTheme.colors.primary }}
          >
            mosque
          </span>
          <p className="text-xl">Menghitung waktu sholat...</p>
        </div>
      </div>
    );
  }

  // Prepare props for layout
  const hijri = toHijri(currentTime);
  const displayProps: DisplayThemeProps = {
    mosqueName: mosqueInfo.name,
    mosqueLocation: `${mosqueInfo.address.city}, ${mosqueInfo.address.province}`,

    currentTime,
    formattedTime: formatTime(currentTime),
    gregorianDate: formatDate(currentTime),
    hijriDate: {
      day: hijri.day,
      month: hijri.month,
      monthName: hijri.monthName,
      year: hijri.year,
    },

    prayerTimes: {
      imsak: prayerTimes.imsak,
      subuh: prayerTimes.subuh,
      terbit: prayerTimes.terbit,
      dhuha: prayerTimes.dhuha,
      dzuhur: prayerTimes.dzuhur,
      ashar: prayerTimes.ashar,
      maghrib: prayerTimes.maghrib,
      isya: prayerTimes.isya,
    },

    nextPrayer: nextPrayer
      ? {
          name: nextPrayer.name,
          time: nextPrayer.time,
          countdown: getTimeUntilNextPrayer(),
        }
      : null,

    activePrayer: getActivePrayer(),

    theme: currentTheme,

    announcements: [`☎️ ${mosqueInfo.phone || "Hubungi Takmir"}`],
  };

  // Render layout based on theme
  const renderLayout = () => {
    switch (currentTheme.layout.type) {
      case "modern":
        return <ModernLayout {...displayProps} />;
      case "minimal":
        return <MinimalLayout {...displayProps} />;
      case "classic":
      default:
        return <ClassicLayout {...displayProps} />;
    }
  };

  return (
    <>
      <ThemeTransition theme={currentTheme} isTransitioning={isTransitioning}>
        {renderLayout()}
      </ThemeTransition>

      {/* Debug Panel - Shows only in development or can be toggled by user if needed */}
      <ThemeDebugPanel show={import.meta.env.MODE === "development"} />
    </>
  );
}

export default ThemedDisplay;
