// ============================================
// Theme Transition Wrapper
// ============================================

import { type ReactNode } from "react";
import type { ThemeConfig } from "../types";

interface ThemeTransitionProps {
  children: ReactNode;
  theme: ThemeConfig;
  isTransitioning: boolean;
}

export function ThemeTransition({
  children,
  theme,
  isTransitioning,
}: ThemeTransitionProps) {
  const transitionStyles = getTransitionStyles(theme, isTransitioning);

  return (
    <div
      className="theme-transition-wrapper"
      style={{
        ...transitionStyles,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

function getTransitionStyles(
  theme: ThemeConfig,
  isTransitioning: boolean,
): React.CSSProperties {
  const duration = theme.animation.transitionDuration;

  switch (theme.animation.transitionType) {
    case "fade":
      return {
        opacity: isTransitioning ? 0 : 1,
        transition: `opacity ${duration}ms ease-in-out`,
      };

    case "slide":
      return {
        transform: isTransitioning ? "translateX(-100%)" : "translateX(0)",
        transition: `transform ${duration}ms ease-in-out`,
      };

    case "zoom":
      return {
        transform: isTransitioning ? "scale(1.1)" : "scale(1)",
        opacity: isTransitioning ? 0 : 1,
        transition: `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
      };

    case "crossfade":
      return {
        opacity: isTransitioning ? 0.5 : 1,
        transition: `opacity ${duration}ms ease-in-out`,
      };

    case "flip":
      return {
        transform: isTransitioning ? "rotateY(90deg)" : "rotateY(0)",
        transition: `transform ${duration}ms ease-in-out`,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      };

    default:
      return {};
  }
}

export default ThemeTransition;
