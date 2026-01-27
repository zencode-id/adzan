/**
 * Hijri Calendar Utility
 * Uses Intl.DateTimeFormat with islamic-umalqura calendar (built-in browser API)
 * This is the official Saudi Arabian Umm al-Qura calendar
 */

// Hijri month names in Arabic and Indonesian
export const HIJRI_MONTHS = {
  ar: [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأولى",
    "جمادى الآخرة",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ],
  id: [
    "Muharram",
    "Safar",
    "Rabiul Awal",
    "Rabiul Akhir",
    "Jumadil Awal",
    "Jumadil Akhir",
    "Rajab",
    "Sya'ban",
    "Ramadhan",
    "Syawal",
    "Dzulqa'dah",
    "Dzulhijjah",
  ],
};

// Hijri day names
export const HIJRI_DAYS = {
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  id: ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
};

export interface HijriDate {
  day: number;
  month: number; // 1-indexed (1 = Muharram)
  year: number;
  monthName: string;
  monthNameAr: string;
  dayName: string;
  dayNameAr: string;
}

/**
 * Convert Gregorian date to Hijri date using Intl.DateTimeFormat
 * Uses islamic-umalqura calendar (Umm al-Qura - Saudi Arabian official calendar)
 */
export function toHijri(date: Date): HijriDate {
  // Use Intl.DateTimeFormat with islamic-umalqura calendar
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);

  let hijriDay = 1;
  let hijriMonth = 1;
  let hijriYear = 1446;

  for (const part of parts) {
    if (part.type === "day") {
      hijriDay = parseInt(part.value, 10);
    } else if (part.type === "month") {
      hijriMonth = parseInt(part.value, 10);
    } else if (part.type === "year") {
      // Remove "AH" suffix if present and parse
      hijriYear = parseInt(part.value.replace(/[^\d]/g, ""), 10);
    }
  }

  // Get day of week (0 = Sunday)
  const dayOfWeek = date.getDay();

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    monthName: HIJRI_MONTHS.id[hijriMonth - 1] || `Bulan ${hijriMonth}`,
    monthNameAr: HIJRI_MONTHS.ar[hijriMonth - 1] || "",
    dayName: HIJRI_DAYS.id[dayOfWeek],
    dayNameAr: HIJRI_DAYS.ar[dayOfWeek],
  };
}

/**
 * Get Hijri month name
 */
export function getHijriMonthName(
  month: number,
  lang: "ar" | "id" = "id",
): string {
  if (month < 1 || month > 12) return "";
  return HIJRI_MONTHS[lang][month - 1];
}

/**
 * Format Hijri date to string
 */
export function formatHijriDate(
  date: Date,
  options?: {
    showDayName?: boolean;
    showYear?: boolean;
    lang?: "ar" | "id";
  },
): string {
  const hijri = toHijri(date);
  const { showDayName = true, showYear = true, lang = "id" } = options || {};

  const parts: string[] = [];

  if (showDayName) {
    parts.push(lang === "ar" ? hijri.dayNameAr : hijri.dayName);
  }

  parts.push(`${hijri.day}`);
  parts.push(lang === "ar" ? hijri.monthNameAr : hijri.monthName);

  if (showYear) {
    parts.push(`${hijri.year} H`);
  }

  return parts.join(" ");
}

/**
 * Get current Hijri date
 */
export function getCurrentHijri(): HijriDate {
  return toHijri(new Date());
}

/**
 * Check if current month is Ramadan
 */
export function isRamadan(date?: Date): boolean {
  const hijri = toHijri(date || new Date());
  return hijri.month === 9; // Ramadan is the 9th month
}

/**
 * Get days until Ramadan
 */
export function getDaysUntilRamadan(date?: Date): number {
  const currentDate = date || new Date();
  const hijri = toHijri(currentDate);

  if (hijri.month === 9) {
    return 0; // Already Ramadan
  }

  // Approximate calculation (since Hijri months vary)
  const monthsUntilRamadan =
    hijri.month < 9 ? 9 - hijri.month : 12 - hijri.month + 9;

  // Approximate 29.5 days per month
  return Math.floor(monthsUntilRamadan * 29.5 - hijri.day);
}

/**
 * Check if it's a special Islamic day
 */
export function getSpecialDay(date?: Date): string | null {
  const hijri = toHijri(date || new Date());

  // Special days mapping
  const specialDays: Record<string, string> = {
    "1-1": "Tahun Baru Hijriah",
    "10-1": "Hari Asyura",
    "12-3": "Maulid Nabi Muhammad SAW",
    "27-7": "Isra' Mi'raj",
    "15-8": "Nisfu Sya'ban",
    "1-9": "Awal Ramadhan",
    "17-9": "Nuzulul Quran",
    "1-10": "Idul Fitri",
    "10-12": "Idul Adha",
  };

  const key = `${hijri.day}-${hijri.month}`;
  return specialDays[key] || null;
}

export default {
  toHijri,
  getHijriMonthName,
  formatHijriDate,
  getCurrentHijri,
  isRamadan,
  getDaysUntilRamadan,
  getSpecialDay,
  HIJRI_MONTHS,
  HIJRI_DAYS,
};
