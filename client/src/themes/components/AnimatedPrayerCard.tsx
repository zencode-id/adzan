// ============================================
// Animated Prayer Card Component
// With stagger animations and active state effects
// ============================================

import { memo } from "react";
import type { ThemeConfig } from "../types";

interface AnimatedPrayerCardProps {
  name: string;
  time: string;
  icon: string;
  iconColor: string;
  isActive: boolean;
  isNext: boolean;
  isSpecial?: boolean;
  theme: ThemeConfig;
  index: number; // For stagger animation
}

export const AnimatedPrayerCard = memo(function AnimatedPrayerCard({
  name,
  time,
  icon,
  iconColor,
  isActive,
  isNext,
  isSpecial,
  theme,
  index,
}: AnimatedPrayerCardProps) {
  const { colors, typography, animation } = theme;
  const isHighlighted = isActive || isNext;

  // Stagger delay based on index
  const staggerDelay = index * 50;

  return (
    <div
      className={`
        rounded-2xl p-5 border transition-all duration-300
        ${isActive ? "prayer-card-active" : ""}
        ${isNext ? "prayer-card-next" : ""}
      `}
      style={{
        backgroundColor: isHighlighted
          ? `${colors.primary}33`
          : isSpecial
            ? `${iconColor}15`
            : "rgba(255,255,255,0.03)",
        borderColor: isHighlighted
          ? colors.primary
          : isSpecial
            ? `${iconColor}30`
            : colors.border,
        boxShadow: isNext ? `0 0 30px ${colors.primary}25` : "none",
        animation: isActive
          ? `prayer-highlight 1.5s ease-in-out infinite`
          : `theme-scale-in 0.4s ease-out ${staggerDelay}ms both`,
        transform: isNext ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-2xl transition-all duration-300 ${
              isActive ? "animate-pulse" : ""
            }`}
            style={{ color: iconColor }}
          >
            {icon}
          </span>
          <span
            className="text-lg font-medium transition-colors duration-300"
            style={{ color: colors.textSecondary }}
          >
            {name}
          </span>
        </div>
        <span
          className={`text-3xl font-bold transition-all duration-300 ${
            animation.clockAnimation === "glow" && isHighlighted
              ? "animate-theme-glow"
              : ""
          }`}
          style={{
            fontFamily: typography.fontFamily,
            color:
              isHighlighted || isSpecial
                ? isHighlighted
                  ? colors.primary
                  : iconColor
                : colors.text,
          }}
        >
          {time}
        </span>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}10 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Next prayer indicator */}
      {isNext && (
        <div className="absolute -top-1 -right-1">
          <span
            className="material-symbols-outlined text-sm animate-bounce"
            style={{ color: colors.primary }}
          >
            arrow_upward
          </span>
        </div>
      )}
    </div>
  );
});

export default AnimatedPrayerCard;
