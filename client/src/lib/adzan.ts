/**
 * Adzan Service
 * Manages prayer time notifications and audio playback
 */

import {
  calculatePrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
} from "./prayerTimes";
import type { PrayerSettingsInput, PrayerTimesResult } from "./prayerTimes";

// Prayer names for adzan
export const PRAYER_NAMES = {
  subuh: "Subuh",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
} as const;

export type PrayerName = keyof typeof PRAYER_NAMES;

// Adzan audio URLs (online sources as fallback)
const ADZAN_AUDIO_URLS = {
  default: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  subuh: "https://www.islamcan.com/audio/adhan/azan1.mp3",
};

export interface AdzanSettings {
  enabled: boolean;
  volume: number; // 0-100
  enabledPrayers: Record<PrayerName, boolean>;
  useSubuhAdzan: boolean; // Use different adzan for Subuh
  audioUrl?: string; // Custom audio URL
  subuhAudioUrl?: string; // Custom Subuh audio URL
}

export interface AdzanState {
  isPlaying: boolean;
  currentPrayer: string | null;
  nextPrayer: { name: string; time: Date } | null;
  prayerTimes: PrayerTimesResult | null;
  countdown: string;
}

// Default settings
export const DEFAULT_ADZAN_SETTINGS: AdzanSettings = {
  enabled: true,
  volume: 80,
  enabledPrayers: {
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  },
  useSubuhAdzan: true,
};

/**
 * Adzan Service Class
 */
export class AdzanService {
  private audioElement: HTMLAudioElement | null = null;
  private settings: AdzanSettings;
  private prayerSettings: PrayerSettingsInput;
  private checkInterval: number | null = null;
  private lastPlayedPrayer: string | null = null;
  private onAdzanCallback: ((prayer: string) => void) | null = null;
  private onStateChangeCallback: ((state: AdzanState) => void) | null = null;

  constructor(
    prayerSettings: PrayerSettingsInput,
    adzanSettings?: Partial<AdzanSettings>,
  ) {
    this.prayerSettings = prayerSettings;
    this.settings = { ...DEFAULT_ADZAN_SETTINGS, ...adzanSettings };
    this.initAudio();
  }

  /**
   * Initialize audio element
   */
  private initAudio(): void {
    if (typeof window !== "undefined") {
      this.audioElement = new Audio();
      this.audioElement.volume = this.settings.volume / 100;

      this.audioElement.addEventListener("ended", () => {
        this.notifyStateChange();
      });

      this.audioElement.addEventListener("error", (e) => {
        console.error("Adzan audio error:", e);
      });
    }
  }

  /**
   * Get current state
   */
  public getState(): AdzanState {
    const now = new Date();
    const prayerTimes = calculatePrayerTimes(now, this.prayerSettings);
    const nextPrayer = getNextPrayer(now, this.prayerSettings);
    const currentPrayer = getCurrentPrayer(now, this.prayerSettings);

    return {
      isPlaying: this.audioElement ? !this.audioElement.paused : false,
      currentPrayer,
      nextPrayer,
      prayerTimes,
      countdown: this.getCountdown(nextPrayer?.time),
    };
  }

  /**
   * Calculate countdown to next prayer
   */
  private getCountdown(nextTime: Date | undefined): string {
    if (!nextTime) return "--:--:--";

    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();

    if (diff <= 0) return "00:00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getState());
    }
  }

  /**
   * Play adzan audio
   */
  public async playAdzan(prayer?: PrayerName): Promise<void> {
    if (!this.audioElement || !this.settings.enabled) return;

    // Determine which audio to play
    const isSubuh = prayer === "subuh";
    const audioUrl =
      isSubuh && this.settings.useSubuhAdzan
        ? this.settings.subuhAudioUrl || ADZAN_AUDIO_URLS.subuh
        : this.settings.audioUrl || ADZAN_AUDIO_URLS.default;

    try {
      this.audioElement.src = audioUrl;
      this.audioElement.currentTime = 0;
      await this.audioElement.play();

      if (prayer && this.onAdzanCallback) {
        this.onAdzanCallback(PRAYER_NAMES[prayer]);
      }

      this.notifyStateChange();
    } catch (error) {
      console.error("Failed to play adzan:", error);
    }
  }

  /**
   * Stop adzan audio
   */
  public stopAdzan(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.notifyStateChange();
    }
  }

  /**
   * Set volume
   */
  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(100, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.settings.volume / 100;
    }
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<AdzanSettings>): void {
    this.settings = { ...this.settings, ...settings };
    if (settings.volume !== undefined) {
      this.setVolume(settings.volume);
    }
  }

  /**
   * Update prayer settings (location, method, etc.)
   */
  public updatePrayerSettings(settings: PrayerSettingsInput): void {
    this.prayerSettings = settings;
    this.notifyStateChange();
  }

  /**
   * Start monitoring prayer times
   */
  public startMonitoring(): void {
    if (this.checkInterval) return;

    // Check every second
    this.checkInterval = window.setInterval(() => {
      this.checkPrayerTime();
      this.notifyStateChange();
    }, 1000);

    // Initial check
    this.checkPrayerTime();
    this.notifyStateChange();
  }

  /**
   * Stop monitoring prayer times
   */
  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if it's prayer time and play adzan
   */
  private checkPrayerTime(): void {
    if (!this.settings.enabled) return;

    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const prayerTimes = calculatePrayerTimes(now, this.prayerSettings);

    // Map prayer times to prayer names
    const timeTosPrayer: Record<string, PrayerName> = {
      [prayerTimes.subuh]: "subuh",
      [prayerTimes.dzuhur]: "dzuhur",
      [prayerTimes.ashar]: "ashar",
      [prayerTimes.maghrib]: "maghrib",
      [prayerTimes.isya]: "isya",
    };

    const prayer = timeTosPrayer[currentTimeStr];

    if (
      prayer &&
      this.settings.enabledPrayers[prayer] &&
      this.lastPlayedPrayer !== `${prayer}-${currentTimeStr}`
    ) {
      this.lastPlayedPrayer = `${prayer}-${currentTimeStr}`;
      this.playAdzan(prayer);
    }
  }

  /**
   * Set callback for when adzan plays
   */
  public onAdzan(callback: (prayer: string) => void): void {
    this.onAdzanCallback = callback;
  }

  /**
   * Set callback for state changes
   */
  public onStateChange(callback: (state: AdzanState) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Get current settings
   */
  public getSettings(): AdzanSettings {
    return { ...this.settings };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopMonitoring();
    this.stopAdzan();
    this.audioElement = null;
  }
}

/**
 * Create a singleton instance for global use
 */
let adzanServiceInstance: AdzanService | null = null;

export function getAdzanService(
  prayerSettings: PrayerSettingsInput,
  adzanSettings?: Partial<AdzanSettings>,
): AdzanService {
  if (!adzanServiceInstance) {
    adzanServiceInstance = new AdzanService(prayerSettings, adzanSettings);
  }
  return adzanServiceInstance;
}

export function resetAdzanService(): void {
  if (adzanServiceInstance) {
    adzanServiceInstance.destroy();
    adzanServiceInstance = null;
  }
}

export default AdzanService;
