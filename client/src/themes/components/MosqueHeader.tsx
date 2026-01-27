// ============================================
// Mosque Header Component
// ============================================

import type { ThemeConfig } from "../types";

interface MosqueHeaderProps {
  name: string;
  location: string;
  theme: ThemeConfig;
}

export function MosqueHeader({ name, location, theme }: MosqueHeaderProps) {
  const { colors, layout } = theme;

  if (!layout.showHeader) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <span
          className="material-symbols-outlined text-4xl"
          style={{ color: colors.bg }}
        >
          mosque
        </span>
      </div>
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: colors.text }}
        >
          {name}
        </h1>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          {location}
        </p>
      </div>
    </div>
  );
}

export default MosqueHeader;
