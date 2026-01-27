// ============================================
// Date Display Component
// ============================================

import type { ThemeConfig } from "../types";

interface DateDisplayProps {
  gregorianDate: string;
  hijriDate: {
    day: number;
    monthName: string;
    year: number;
  };
  theme: ThemeConfig;
  showHijri?: boolean;
}

export function DateDisplay({
  gregorianDate,
  hijriDate,
  theme,
  showHijri = true,
}: DateDisplayProps) {
  const { colors, layout } = theme;

  return (
    <div className="text-right">
      {layout.showDate && (
        <p
          className="text-sm uppercase tracking-widest"
          style={{ color: colors.textMuted }}
        >
          {gregorianDate}
        </p>
      )}
      {showHijri && layout.showHijriDate && (
        <p
          className="text-sm font-medium mt-1"
          style={{ color: colors.primary }}
        >
          🌙 {hijriDate.day} {hijriDate.monthName} {hijriDate.year} H
        </p>
      )}
    </div>
  );
}

export default DateDisplay;
