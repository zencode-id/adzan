// ============================================
// Running Text Component
// ============================================

import type { ThemeConfig } from "../types";

interface RunningTextProps {
  items: string[];
  theme: ThemeConfig;
}

export function RunningText({ items, theme }: RunningTextProps) {
  const { colors, layout } = theme;

  if (!layout.showRunningText || items.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-2xl py-3 px-6 overflow-hidden transition-all duration-500"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="animate-marquee whitespace-nowrap">
        {items.map((item, index) => (
          <span key={index}>
            <span className="font-semibold mx-8" style={{ color: colors.bg }}>
              {item}
            </span>
            {index < items.length - 1 && (
              <span className="mx-8 opacity-50" style={{ color: colors.bg }}>
                •
              </span>
            )}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((item, index) => (
          <span key={`dup-${index}`}>
            <span className="font-semibold mx-8" style={{ color: colors.bg }}>
              {item}
            </span>
            {index < items.length - 1 && (
              <span className="mx-8 opacity-50" style={{ color: colors.bg }}>
                •
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RunningText;
