/**
 * useAdzan Hook
 * React hook for managing adzan functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AdzanService, DEFAULT_ADZAN_SETTINGS } from "../lib/adzan";
import type { AdzanSettings, AdzanState } from "../lib/adzan";
import type { PrayerSettingsInput } from "../lib/prayerTimes";

export interface UseAdzanOptions {
  prayerSettings: PrayerSettingsInput;
  adzanSettings?: Partial<AdzanSettings>;
  autoStart?: boolean;
}

export interface UseAdzanReturn {
  state: AdzanState;
  settings: AdzanSettings;
  isEnabled: boolean;
  isPlaying: boolean;
  playAdzan: () => Promise<void>;
  stopAdzan: () => void;
  setVolume: (volume: number) => void;
  toggleEnabled: () => void;
  updateSettings: (settings: Partial<AdzanSettings>) => void;
}

export function useAdzan(options: UseAdzanOptions): UseAdzanReturn {
  const { prayerSettings, adzanSettings, autoStart = true } = options;

  const serviceRef = useRef<AdzanService | null>(null);

  const [state, setState] = useState<AdzanState>({
    isPlaying: false,
    currentPrayer: null,
    currentAudioType: null,
    nextPrayer: null,
    prayerTimes: null,
    countdown: "--:--:--",
    tarhimCountdown: null,
    isCautionActive: false,
    cautionFor: null,
    cautionCountdown: null,
  });

  const [settings, setSettings] = useState<AdzanSettings>({
    ...DEFAULT_ADZAN_SETTINGS,
    ...adzanSettings,
  });

  // Initialize service
  useEffect(() => {
    const currentSettings = { ...DEFAULT_ADZAN_SETTINGS, ...adzanSettings };
    serviceRef.current = new AdzanService(prayerSettings, currentSettings);

    serviceRef.current.onStateChange((newState) => {
      setState(newState);
    });

    if (autoStart) {
      serviceRef.current.startMonitoring();
    }

    // Get initial state
    setState(serviceRef.current.getState());

    return () => {
      serviceRef.current?.destroy();
      serviceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerSettings.latitude, prayerSettings.longitude, autoStart]);

  // Update prayer settings when they change
  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.updatePrayerSettings(prayerSettings);
    }
  }, [prayerSettings]);

  const playAdzan = useCallback(async () => {
    await serviceRef.current?.playAdzan();
  }, []);

  const stopAdzan = useCallback(() => {
    serviceRef.current?.stopAdzan();
  }, []);

  const setVolume = useCallback((volume: number) => {
    serviceRef.current?.setVolume(volume);
    setSettings((prev) => ({ ...prev, volume }));
  }, []);

  const toggleEnabled = useCallback(() => {
    const newEnabled = !settings.enabled;
    serviceRef.current?.updateSettings({ enabled: newEnabled });
    setSettings((prev) => ({ ...prev, enabled: newEnabled }));
  }, [settings.enabled]);

  const updateSettings = useCallback((newSettings: Partial<AdzanSettings>) => {
    serviceRef.current?.updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    state,
    settings,
    isEnabled: settings.enabled,
    isPlaying: state.isPlaying,
    playAdzan,
    stopAdzan,
    setVolume,
    toggleEnabled,
    updateSettings,
  };
}

export default useAdzan;
