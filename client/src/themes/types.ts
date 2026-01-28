// ============================================
// Theme System Types
// ============================================

export interface ThemeColors {
  // Primary palette
  primary: string;
  secondary: string;
  accent: string;

  // Background
  bg: string;
  bgSecondary: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // UI Elements
  card: string;
  cardHover: string;
  border: string;

  // Status
  success: string;
  warning: string;
  error: string;
}

export interface ThemeTypography {
  fontFamily: string;
  clockFontSize: string;
  clockFontWeight: string;
  headerFontSize: string;
  prayerFontSize: string;
  labelFontSize: string;
}

export interface ThemeBackground {
  type: "solid" | "gradient" | "image";
  value: string; // Color, gradient CSS, or image URL
  overlay?: string; // Optional overlay color
  overlayOpacity?: number;
}

export interface ThemeOrnaments {
  show: boolean;
  style: "islamic" | "geometric" | "floral" | "minimal" | "none";
  opacity: number;
  pattern?: string; // CSS class name for background pattern
  patternOpacity?: number;
  items?: ThemeOrnamentItem[];
}

export interface ThemeOrnamentItem {
  url: string;
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  width?: string;
  height?: string;
  opacity?: number;
  animation?: "none" | "float" | "pulse" | "rotate";
}

export interface ThemeLayout {
  type:
    | "classic"
    | "modern"
    | "minimal"
    | "fullscreen"
    | "immersive"
    | "digital"
    | "royal";

  // Visibility toggles
  showHeader: boolean;
  showDate: boolean;
  showHijriDate: boolean;
  showCountdown: boolean;
  showQuote: boolean;
  showPrayerBar: boolean;
  showRunningText: boolean;
  showOrnaments: boolean;

  // Clock
  clockStyle: "digital" | "analog";
  clockSeparator: string;
  clockShowSeconds: boolean;

  // Prayer bar
  prayerBarStyle: "horizontal" | "cards" | "minimal";
  prayerBarPosition: "top" | "bottom" | "side";
  highlightCurrentPrayer: boolean;
}

export interface ThemeAnimation {
  clockAnimation: "none" | "pulse" | "glow" | "bounce";
  transitionType: "fade" | "slide" | "zoom" | "crossfade" | "flip";
  transitionDuration: number; // ms
  enableParticles: boolean;
}

// Complete theme configuration
export interface ThemeConfig {
  id: string;
  slug: string;
  name: string;
  description: string;
  previewUrl?: string;
  isBuiltin: boolean;

  colors: ThemeColors;
  typography: ThemeTypography;
  background: ThemeBackground;
  ornaments: ThemeOrnaments;
  layout: ThemeLayout;
  animation: ThemeAnimation;
}

// Props passed to theme layout components
export interface DisplayThemeProps {
  // Mosque info
  mosqueName: string;
  mosqueLocation: string;

  // Time
  currentTime: Date;
  formattedTime: string;
  gregorianDate: string;
  hijriDate: {
    day: number;
    month: number;
    monthName: string;
    year: number;
  };

  // Prayer times
  prayerTimes: {
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
  };

  // Next prayer
  nextPrayer: {
    name: string;
    time: string;
    countdown: string;
  } | null;

  // Current active prayer (within 10 min of prayer time)
  activePrayer: string | null;

  // Theme config
  theme: ThemeConfig;

  // Caution / Peringatan state
  caution?: {
    isActive: boolean;
    type: "adzan" | "imsak" | null;
    countdown: string | null;
  };

  // Extras
  quote?: string;
  announcements?: string[];
}

// Theme schedule for auto-switching
export interface ThemeScheduleConfig {
  id: string;
  themeId: string;
  name: string;
  scheduleType: "time" | "prayer" | "date_range";

  // Time-based
  startTime?: string;
  endTime?: string;

  // Prayer-based
  prayerTrigger?: "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";
  offsetMinutes?: number;
  durationMinutes?: number;

  // Date range
  startDate?: string;
  endDate?: string;

  daysOfWeek?: number[];
  priority: number;
  isActive: boolean;
}

// Theme context state
export interface ThemeContextState {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  schedules: ThemeScheduleConfig[];
  isTransitioning: boolean;
  setTheme: (themeId: string) => void;
  refreshThemes: () => Promise<void>;
}
