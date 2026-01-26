import {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  Prayer,
  SunnahTimes,
} from "adhan";

// Calculation method options
export const CALCULATION_METHODS = {
  Kemenag: () => {
    // Custom Kemenag Indonesia settings
    const params = new CalculationParameters("Other", 20, 18);
    params.madhab = Madhab.Shafi;
    return params;
  },
  MWL: () => CalculationMethod.MuslimWorldLeague(),
  ISNA: () => CalculationMethod.NorthAmerica(),
  Egypt: () => CalculationMethod.Egyptian(),
  Makkah: () => CalculationMethod.UmmAlQura(),
  Karachi: () => CalculationMethod.Karachi(),
  Tehran: () => CalculationMethod.Tehran(),
  Singapore: () => CalculationMethod.Singapore(),
};

export type CalculationMethodKey = keyof typeof CALCULATION_METHODS;

export interface PrayerTimesResult {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  tengahMalam: string;
  sepertiga: string;
}

export interface PrayerSettingsInput {
  latitude: number;
  longitude: number;
  calculationMethod?: CalculationMethodKey;
  madhab?: "Shafi" | "Hanafi";
  adjustments?: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
}

// Format time to HH:mm
function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Add minutes to a date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Calculate prayer times for a specific date and location
 * This works completely offline using astronomical calculations
 */
export function calculatePrayerTimes(
  date: Date,
  settings: PrayerSettingsInput,
): PrayerTimesResult {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);

  // Get calculation parameters
  const methodKey = settings.calculationMethod || "Kemenag";
  const params = CALCULATION_METHODS[methodKey]();

  // Set madhab
  if (settings.madhab === "Hanafi") {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  // Apply adjustments if provided
  if (settings.adjustments) {
    params.adjustments = {
      fajr: settings.adjustments.fajr || 0,
      sunrise: settings.adjustments.sunrise || 0,
      dhuhr: settings.adjustments.dhuhr || 0,
      asr: settings.adjustments.asr || 0,
      maghrib: settings.adjustments.maghrib || 0,
      isha: settings.adjustments.isha || 0,
    };
  }

  // Calculate prayer times
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  // Calculate Imsak (10 minutes before Fajr)
  const imsakTime = addMinutes(prayerTimes.fajr, -10);

  // Calculate Dhuha (15 minutes after sunrise)
  const dhuhaTime = addMinutes(prayerTimes.sunrise, 15);

  return {
    imsak: formatTime(imsakTime),
    subuh: formatTime(prayerTimes.fajr),
    terbit: formatTime(prayerTimes.sunrise),
    dhuha: formatTime(dhuhaTime),
    dzuhur: formatTime(prayerTimes.dhuhr),
    ashar: formatTime(prayerTimes.asr),
    maghrib: formatTime(prayerTimes.maghrib),
    isya: formatTime(prayerTimes.isha),
    tengahMalam: formatTime(sunnahTimes.middleOfTheNight),
    sepertiga: formatTime(sunnahTimes.lastThirdOfTheNight),
  };
}

/**
 * Get the next prayer from current time
 */
export function getNextPrayer(
  date: Date,
  settings: PrayerSettingsInput,
): { name: string; time: Date } | null {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);

  const methodKey = settings.calculationMethod || "Kemenag";
  const params = CALCULATION_METHODS[methodKey]();

  if (settings.madhab === "Hanafi") {
    params.madhab = Madhab.Hanafi;
  }

  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const nextPrayer = prayerTimes.nextPrayer(date);

  if (nextPrayer === Prayer.None) {
    // All prayers have passed, return tomorrow's Fajr
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayers = new PrayerTimes(coordinates, tomorrow, params);
    return { name: "Subuh", time: tomorrowPrayers.fajr };
  }

  const prayerNames: Record<string, string> = {
    Fajr: "Subuh",
    Sunrise: "Terbit",
    Dhuhr: "Dzuhur",
    Asr: "Ashar",
    Maghrib: "Maghrib",
    Isha: "Isya",
  };

  // nextPrayer is a Prayer enum value, use it directly
  const prayerTime = prayerTimes.timeForPrayer(nextPrayer);

  return {
    name: prayerNames[nextPrayer] || nextPrayer,
    time: prayerTime!,
  };
}

/**
 * Calculate prayer times for multiple days (e.g., for Ramadan schedule)
 */
export function calculateMonthlySchedule(
  year: number,
  month: number, // 0-indexed (0 = January)
  settings: PrayerSettingsInput,
): Array<{ date: string; times: PrayerTimesResult }> {
  const schedule: Array<{ date: string; times: PrayerTimesResult }> = [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const times = calculatePrayerTimes(date, settings);

    schedule.push({
      date: date.toISOString().split("T")[0],
      times,
    });
  }

  return schedule;
}

/**
 * Get current prayer period
 */
export function getCurrentPrayer(
  date: Date,
  settings: PrayerSettingsInput,
): string {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);

  const methodKey = settings.calculationMethod || "Kemenag";
  const params = CALCULATION_METHODS[methodKey]();

  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const currentPrayer = prayerTimes.currentPrayer(date);

  const prayerNames: Record<string, string> = {
    None: "Sebelum Subuh",
    Fajr: "Subuh",
    Sunrise: "Terbit",
    Dhuhr: "Dzuhur",
    Asr: "Ashar",
    Maghrib: "Maghrib",
    Isha: "Isya",
  };

  // currentPrayer is a Prayer enum value, use it directly
  return prayerNames[currentPrayer] || currentPrayer;
}

export default {
  calculatePrayerTimes,
  getNextPrayer,
  calculateMonthlySchedule,
  getCurrentPrayer,
  CALCULATION_METHODS,
};
