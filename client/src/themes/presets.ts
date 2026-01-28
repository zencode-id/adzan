// ============================================
// Built-in Theme Presets
// ============================================

import type { ThemeConfig } from "./types";

// Default typography settings
const defaultTypography = {
  fontFamily: "Inter, system-ui, sans-serif",
  clockFontSize: "8rem",
  clockFontWeight: "700",
  headerFontSize: "2rem",
  prayerFontSize: "1.5rem",
  labelFontSize: "0.875rem",
};

// Default layout settings
const defaultLayout = {
  type: "classic" as const,
  showHeader: true,
  showDate: true,
  showHijriDate: true,
  showCountdown: true,
  showQuote: true,
  showPrayerBar: true,
  showRunningText: true,
  showOrnaments: true,
  clockStyle: "digital" as const,
  clockSeparator: ":",
  clockShowSeconds: true,
  prayerBarStyle: "cards" as const,
  prayerBarPosition: "bottom" as const,
  highlightCurrentPrayer: true,
};

// Default animation settings
const defaultAnimation = {
  clockAnimation: "none" as const,
  transitionType: "fade" as const,
  transitionDuration: 500,
  enableParticles: false,
};

// ============================================
// Theme 1: Emerald Classic
// ============================================
export const emeraldClassic: ThemeConfig = {
  id: "emerald-classic",
  slug: "emerald-classic",
  name: "Emerald Classic",
  description: "Tema hijau klasik dengan nuansa islami yang elegan",
  isBuiltin: true,

  colors: {
    primary: "#10b981", // emerald-500
    secondary: "#059669", // emerald-600
    accent: "#d4af37", // gold

    bg: "#064e3b", // emerald-950
    bgSecondary: "#065f46", // emerald-900

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    textMuted: "rgba(255, 255, 255, 0.5)",

    card: "rgba(6, 78, 59, 0.6)",
    cardHover: "rgba(6, 78, 59, 0.8)",
    border: "rgba(255, 255, 255, 0.1)",

    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  typography: { ...defaultTypography },

  background: {
    type: "gradient",
    value: "linear-gradient(135deg, #064e3b 0%, #022c22 50%, #064e3b 100%)",
  },

  ornaments: {
    show: true,
    style: "islamic",
    opacity: 0.1,
  },

  layout: { ...defaultLayout },

  animation: { ...defaultAnimation },
};

// ============================================
// Theme 2: Sunset Warm
// ============================================
export const sunsetWarm: ThemeConfig = {
  id: "sunset-warm",
  slug: "sunset-warm",
  name: "Sunset Warm",
  description: "Tema hangat dengan gradasi sunset, cocok untuk waktu Maghrib",
  isBuiltin: true,

  colors: {
    primary: "#f97316", // orange-500
    secondary: "#ea580c", // orange-600
    accent: "#fbbf24", // amber-400

    bg: "#7c2d12", // orange-900
    bgSecondary: "#9a3412", // orange-800

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.85)",
    textMuted: "rgba(255, 255, 255, 0.5)",

    card: "rgba(124, 45, 18, 0.6)",
    cardHover: "rgba(124, 45, 18, 0.8)",
    border: "rgba(255, 255, 255, 0.15)",

    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },

  typography: { ...defaultTypography },

  background: {
    type: "gradient",
    value:
      "linear-gradient(180deg, #ff6b35 0%, #c2410c 30%, #7c2d12 70%, #431407 100%)",
  },

  ornaments: {
    show: true,
    style: "islamic",
    opacity: 0.08,
  },

  layout: { ...defaultLayout },

  animation: {
    ...defaultAnimation,
    clockAnimation: "glow",
  },
};

// ============================================
// Theme 3: Night Sky
// ============================================
export const nightSky: ThemeConfig = {
  id: "night-sky",
  slug: "night-sky",
  name: "Night Sky",
  description: "Tema malam dengan nuansa biru gelap dan bintang",
  isBuiltin: true,

  colors: {
    primary: "#60a5fa", // blue-400
    secondary: "#3b82f6", // blue-500
    accent: "#fbbf24", // amber-400 (stars)

    bg: "#0f172a", // slate-900
    bgSecondary: "#1e293b", // slate-800

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    textMuted: "rgba(255, 255, 255, 0.4)",

    card: "rgba(30, 41, 59, 0.7)",
    cardHover: "rgba(30, 41, 59, 0.9)",
    border: "rgba(255, 255, 255, 0.1)",

    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },

  typography: { ...defaultTypography },

  background: {
    type: "gradient",
    value: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)",
  },

  ornaments: {
    show: true,
    style: "geometric",
    opacity: 0.05,
  },

  layout: {
    ...defaultLayout,
    type: "modern",
  },

  animation: {
    ...defaultAnimation,
    clockAnimation: "glow",
    enableParticles: true, // Stars effect
  },
};

// ============================================
// Theme 4: Minimalist White
// ============================================
export const minimalistWhite: ThemeConfig = {
  id: "minimalist-white",
  slug: "minimalist-white",
  name: "Minimalist White",
  description: "Tema minimalis putih bersih untuk tampilan modern",
  isBuiltin: true,

  colors: {
    primary: "#10b981", // emerald-500
    secondary: "#059669", // emerald-600
    accent: "#0d9488", // teal-600

    bg: "#fafafa", // neutral-50
    bgSecondary: "#f5f5f5", // neutral-100

    text: "#171717", // neutral-900
    textSecondary: "#404040", // neutral-700
    textMuted: "#737373", // neutral-500

    card: "rgba(255, 255, 255, 0.9)",
    cardHover: "rgba(255, 255, 255, 1)",
    border: "rgba(0, 0, 0, 0.1)",

    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },

  typography: {
    ...defaultTypography,
    fontFamily: "Outfit, system-ui, sans-serif",
  },

  background: {
    type: "solid",
    value: "#fafafa",
  },

  ornaments: {
    show: false,
    style: "none",
    opacity: 0,
  },

  layout: {
    ...defaultLayout,
    type: "minimal",
    showOrnaments: false,
    prayerBarStyle: "minimal",
  },

  animation: {
    ...defaultAnimation,
    transitionType: "slide",
  },
};

// ============================================
// Theme 5: Ramadan Kareem
// ============================================
export const ramadanKareem: ThemeConfig = {
  id: "ramadan-kareem",
  slug: "ramadan-kareem",
  name: "Ramadan Kareem",
  description: "Tema spesial Ramadan dengan ornamen bulan sabit dan lentera",
  isBuiltin: true,

  colors: {
    primary: "#d4af37", // gold
    secondary: "#10b981", // emerald-500
    accent: "#fbbf24", // amber-400

    bg: "#064e3b", // emerald-950
    bgSecondary: "#065f46", // emerald-900

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.85)",
    textMuted: "rgba(255, 255, 255, 0.5)",

    card: "rgba(6, 78, 59, 0.7)",
    cardHover: "rgba(6, 78, 59, 0.9)",
    border: "rgba(212, 175, 55, 0.3)",

    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },

  typography: {
    ...defaultTypography,
    fontFamily: "Amiri, serif",
  },

  background: {
    type: "gradient",
    value: "linear-gradient(135deg, #064e3b 0%, #022c22 40%, #065f46 100%)",
  },

  ornaments: {
    show: true,
    style: "islamic",
    opacity: 0.15,
    items: [
      {
        url: "/ornaments/crescent-moon.svg",
        position: "top-right",
        width: "200px",
        opacity: 0.8,
        animation: "float",
      },
      {
        url: "/ornaments/lantern.svg",
        position: "bottom-left",
        width: "150px",
        opacity: 0.6,
        animation: "float",
      },
    ],
  },

  layout: {
    ...defaultLayout,
    showQuote: true,
  },

  animation: {
    ...defaultAnimation,
    clockAnimation: "glow",
    transitionType: "crossfade",
    enableParticles: true,
  },
};

// ============================================
// Theme 6: Immersive Sunset
// ============================================
export const immersiveSunset: ThemeConfig = {
  id: "immersive-sunset",
  slug: "immersive-sunset",
  name: "Immersive Sunset",
  description: "Tema immersive dengan background gambar dan vignette overlay",
  isBuiltin: true,

  colors: {
    primary: "#2beead", // Teal/Mint
    secondary: "#22d3ee", // Cyan
    accent: "#fbbf24", // Amber

    bg: "#10221c", // Deep dark green
    bgSecondary: "#1a3129",

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    textMuted: "rgba(255, 255, 255, 0.5)",

    card: "rgba(16, 34, 28, 0.4)",
    cardHover: "rgba(16, 34, 28, 0.6)",
    border: "rgba(255, 255, 255, 0.1)",

    success: "#22c55e",
    warning: "#fbbf24",
    error: "#ef4444",
  },

  typography: {
    ...defaultTypography,
    fontFamily: "Inter, system-ui, sans-serif",
    clockFontSize: "15rem",
    clockFontWeight: "200",
  },

  background: {
    type: "image",
    value:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920",
    overlay: "rgba(0, 0, 0, 0.4)",
  },

  ornaments: {
    show: true,
    style: "minimal",
    opacity: 0.1,
  },

  layout: {
    ...defaultLayout,
    type: "immersive",
    showOrnaments: true,
    prayerBarStyle: "horizontal",
    prayerBarPosition: "bottom",
  },

  animation: {
    ...defaultAnimation,
    transitionType: "fade",
  },
};

// ============================================
// Theme 7: High-Contrast Digital
// ============================================
export const digitalNeon: ThemeConfig = {
  id: "digital-neon",
  slug: "digital-neon",
  name: "Digital Neon",
  description: "Tema high-contrast dengan warna neon hijau yang mencolok",
  isBuiltin: true,

  colors: {
    primary: "#39FF14", // Neon Green
    secondary: "#22d3ee", // Cyan
    accent: "#fbbf24", // Amber

    bg: "#000000", // Pure Black
    bgSecondary: "#0a0a0a",

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.85)",
    textMuted: "rgba(255, 255, 255, 0.5)",

    card: "rgba(20, 20, 20, 0.8)",
    cardHover: "rgba(30, 30, 30, 0.9)",
    border: "rgba(255, 255, 255, 0.05)",

    success: "#39FF14",
    warning: "#fbbf24",
    error: "#ef4444",
  },

  typography: {
    ...defaultTypography,
    fontFamily: "Lexend, Inter, system-ui, sans-serif",
    clockFontSize: "16rem",
    clockFontWeight: "900",
  },

  background: {
    type: "solid",
    value: "#000000",
  },

  ornaments: {
    show: false,
    style: "none",
    opacity: 0,
  },

  layout: {
    ...defaultLayout,
    type: "digital",
    showOrnaments: false,
    prayerBarStyle: "cards",
  },

  animation: {
    ...defaultAnimation,
    clockAnimation: "glow",
  },
};

// ============================================
// Theme 8: Royal Dark
// ============================================
export const royalDark: ThemeConfig = {
  id: "royal-dark",
  slug: "royal-dark",
  name: "Royal Dark",
  description: "Tema elegan dengan warna gold dan astronomikal rings",
  isBuiltin: true,

  colors: {
    primary: "#D4AF37", // Classic Gold
    secondary: "#B8860B", // Dark Golden Rod
    accent: "#FFD700", // Gold

    bg: "#050A18", // Deep Navy
    bgSecondary: "#0d1424",

    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    textMuted: "rgba(255, 255, 255, 0.5)",

    card: "rgba(255, 255, 255, 0.05)",
    cardHover: "rgba(255, 255, 255, 0.1)",
    border: "rgba(212, 175, 55, 0.2)",

    success: "#22c55e",
    warning: "#D4AF37",
    error: "#ef4444",
  },

  typography: {
    ...defaultTypography,
    fontFamily: "Cinzel, Playfair Display, serif",
    clockFontSize: "10rem",
    clockFontWeight: "800",
  },

  background: {
    type: "solid",
    value: "#050A18",
  },

  ornaments: {
    show: true,
    style: "geometric",
    opacity: 0.1,
  },

  layout: {
    ...defaultLayout,
    type: "royal",
    showOrnaments: true,
    prayerBarStyle: "minimal",
  },

  animation: {
    ...defaultAnimation,
    clockAnimation: "glow",
    transitionType: "crossfade",
  },
};

// ============================================
// All Built-in Themes
// ============================================
export const builtinThemes: ThemeConfig[] = [
  emeraldClassic,
  sunsetWarm,
  nightSky,
  minimalistWhite,
  ramadanKareem,
  immersiveSunset,
  digitalNeon,
  royalDark,
];

// ============================================
// Get theme by ID or slug
// ============================================
export function getThemeById(id: string = "emerald-classic"): ThemeConfig {
  return (
    builtinThemes.find((t) => t.id === id || t.slug === id) || emeraldClassic
  );
}

// ============================================
// Create custom theme from base
// ============================================
export function createCustomTheme(
  base: ThemeConfig,
  overrides: Partial<ThemeConfig>,
): ThemeConfig {
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    background: { ...base.background, ...overrides.background },
    ornaments: { ...base.ornaments, ...overrides.ornaments },
    layout: { ...base.layout, ...overrides.layout },
    animation: { ...base.animation, ...overrides.animation },
    isBuiltin: false,
  };
}

export default builtinThemes;
