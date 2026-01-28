// ============================================
// Caution Alert Component
// Shows a warning when Adzan or Imsak is near
// ============================================

import { AlertTriangle } from "lucide-react";
import type { ThemeConfig } from "../types";

interface CautionAlertProps {
  isActive: boolean;
  type: "adzan" | "imsak" | null;
  countdown: string | null;
  theme: ThemeConfig;
}

export function CautionAlert({
  isActive,
  type,
  countdown,
  theme,
}: CautionAlertProps) {
  if (!isActive || !type) return null;

  const isImsak = type === "imsak";
  const title = isImsak ? "Waktu Imsak Segera Tiba" : "Waktu Adzan Segera Tiba";
  const message = isImsak
    ? "Mohon segerakan sahur Anda."
    : "Mohon bersiap untuk sholat berjamaah.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 animate-in zoom-in-95 duration-300"
        style={{ borderColor: theme.colors.warning }}
      >
        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse"
            style={{
              backgroundColor: `${theme.colors.warning}20`,
              color: theme.colors.warning,
            }}
          >
            <AlertTriangle size={48} />
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold mb-2 text-slate-800">{title}</h2>

          {/* Countdown */}
          <div
            className="text-7xl font-mono font-bold my-4 tabular-nums"
            style={{ color: theme.colors.warning }}
          >
            {countdown || "00:00"}
          </div>

          {/* Message */}
          <p className="text-xl text-slate-500 max-w-md">{message}</p>
        </div>

        {/* Footer decoration */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: theme.colors.warning }}
        />
      </div>
    </div>
  );
}
