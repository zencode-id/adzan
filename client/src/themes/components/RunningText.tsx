// ============================================
// Running Text Component
// ============================================

import type { ThemeConfig } from "../types";

interface RunningTextProps {
  items: string[];
  theme: ThemeConfig;
  separator?: string; // Default: "•"
  spacing?: number; // In rem, default: 0.75 (mx-3)
}

export function RunningText({
  items,
  theme,
  separator = "•",
  spacing = 0.75,
}: RunningTextProps) {
  const { colors, layout } = theme;

  if (!layout.showRunningText || items.length === 0) {
    return null;
  }

  const spacingStyle = { margin: `0 ${spacing}rem` };

  return (
    <div
      className="rounded-2xl py-3 px-6 overflow-hidden transition-all duration-500"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="animate-marquee whitespace-nowrap">
        {items.map((item, index) => (
          <span key={index}>
            <span
              className="font-semibold"
              style={{ ...spacingStyle, color: colors.bg }}
            >
              {item}
            </span>
            {index < items.length - 1 && (
              <span
                className="opacity-50"
                style={{ ...spacingStyle, color: colors.bg }}
              >
                {separator}
              </span>
            )}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        <span style={{ margin: `0 ${spacing * 2}rem` }} />
        {items.map((item, index) => (
          <span key={`dup-${index}`}>
            <span
              className="font-semibold"
              style={{ ...spacingStyle, color: colors.bg }}
            >
              {item}
            </span>
            {index < items.length - 1 && (
              <span
                className="opacity-50"
                style={{ ...spacingStyle, color: colors.bg }}
              >
                {separator}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RunningText;
