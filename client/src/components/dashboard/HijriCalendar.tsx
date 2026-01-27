import { Calendar, Moon, Star } from "lucide-react";
import { toHijri, isRamadan, getSpecialDay } from "../../lib/hijriCalendar";
import type { HijriDate } from "../../lib/hijriCalendar";

interface HijriCalendarProps {
  date?: Date;
  showSpecialDay?: boolean;
  compact?: boolean;
}

export function HijriCalendar({
  date,
  showSpecialDay = true,
  compact = false,
}: HijriCalendarProps) {
  const currentDate = date || new Date();
  const hijri: HijriDate = toHijri(currentDate);
  const specialDay = showSpecialDay ? getSpecialDay(currentDate) : null;
  const ramadan = isRamadan(currentDate);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Moon className="w-4 h-4 text-emerald-500" />
        <span className="font-medium">
          {hijri.day} {hijri.monthName} {hijri.year} H
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 text-slate-400 mb-4">
        <Calendar className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Kalender Hijriah
        </span>
      </div>

      {/* Hijri Date Display */}
      <div className="space-y-3">
        {/* Day Name */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-sm">{hijri.dayName}</span>
          <span className="text-slate-400 text-sm font-arabic" dir="rtl">
            {hijri.dayNameAr}
          </span>
        </div>

        {/* Date */}
        <div className="text-center py-4">
          <p className="text-4xl font-bold text-emerald-600 mb-1">
            {hijri.day}
          </p>
          <p className="text-xl font-semibold text-slate-700">
            {hijri.monthName}
          </p>
          <p className="text-slate-500">{hijri.year} H</p>
        </div>

        {/* Arabic Display */}
        <div className="text-center border-t border-slate-100 pt-3">
          <p className="text-lg font-arabic text-slate-600" dir="rtl">
            {hijri.day} {hijri.monthNameAr} {hijri.year}
          </p>
        </div>

        {/* Special Day Badge */}
        {specialDay && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{specialDay}</span>
          </div>
        )}

        {/* Ramadan Indicator */}
        {ramadan && !specialDay && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg">
            <Moon className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span className="text-sm font-medium">Bulan Ramadhan</span>
          </div>
        )}
      </div>

      {/* Gregorian Date */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          {currentDate.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default HijriCalendar;
