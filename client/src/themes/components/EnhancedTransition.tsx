// ============================================
// Enhanced Theme Transition Wrapper
// With dynamic keyframe injection and smooth animations
// ============================================

import { type ReactNode, useEffect, useRef, useMemo } from "react";
import type { ThemeConfig } from "../types";
import {
  generateThemeKeyframes,
  generateThemeCSSVariables,
} from "../animations";

interface EnhancedTransitionProps {
  children: ReactNode;
  theme: ThemeConfig;
  previousTheme?: ThemeConfig;
  onTransitionEnd?: () => void;
}

export function EnhancedTransition({
  children,
  theme,
  previousTheme,
  onTransitionEnd,
}: EnhancedTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const isTransitioning = !!(previousTheme && previousTheme.id !== theme.id);

  // Inject theme keyframes
  useEffect(() => {
    // Create or update style element
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "theme-keyframes";
      document.head.appendChild(styleRef.current);
    }

    styleRef.current.textContent = generateThemeKeyframes(theme);

    return () => {
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
      }
    };
  }, [theme]);

  // Handle theme change with transition
  useEffect(() => {
    if (
      !previousTheme ||
      previousTheme.id === theme.id ||
      !containerRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    const duration = theme.animation.transitionDuration;

    // Apply exit styles
    container.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    applyExitStyles(container, previousTheme);

    // After exit, apply enter styles
    const exitTimeout = setTimeout(() => {
      applyEnterStyles(container, theme);

      // Notify transition end
      const enterTimeout = setTimeout(() => {
        onTransitionEnd?.();
      }, duration);

      return () => clearTimeout(enterTimeout);
    }, duration / 2);

    return () => clearTimeout(exitTimeout);
  }, [theme, previousTheme, onTransitionEnd]);

  // Apply CSS variables - memoized to avoid recalculation
  const cssVariables = useMemo(() => generateThemeCSSVariables(theme), [theme]);

  return (
    <div
      ref={containerRef}
      className={`theme-enhanced-transition ${isTransitioning ? "theme-entering" : ""}`}
      style={{
        ...cssVariables,
        minHeight: "100vh",
        width: "100%",
        willChange: isTransitioning ? "opacity, transform" : "auto",
      }}
    >
      {children}
    </div>
  );
}

// Apply exit animation styles
function applyExitStyles(element: HTMLElement, theme: ThemeConfig) {
  const { transitionType } = theme.animation;

  switch (transitionType) {
    case "fade":
      element.style.opacity = "0";
      break;
    case "slide":
      element.style.transform = "translateX(-20px)";
      element.style.opacity = "0";
      break;
    case "zoom":
      element.style.transform = "scale(1.05)";
      element.style.opacity = "0";
      break;
    case "crossfade":
      element.style.opacity = "0.3";
      break;
    case "flip":
      element.style.transform = "perspective(1000px) rotateY(90deg)";
      break;
  }
}

// Apply enter animation styles
function applyEnterStyles(element: HTMLElement, theme: ThemeConfig) {
  const { transitionType, transitionDuration } = theme.animation;

  element.style.transition = `opacity ${transitionDuration}ms ease-in, transform ${transitionDuration}ms ease-in`;

  switch (transitionType) {
    case "fade":
      element.style.opacity = "1";
      break;
    case "slide":
      element.style.transform = "translateX(0)";
      element.style.opacity = "1";
      break;
    case "zoom":
      element.style.transform = "scale(1)";
      element.style.opacity = "1";
      break;
    case "crossfade":
      element.style.opacity = "1";
      break;
    case "flip":
      element.style.transform = "perspective(1000px) rotateY(0)";
      break;
  }
}

export default EnhancedTransition;
