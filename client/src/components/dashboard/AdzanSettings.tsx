import { useState, useEffect, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Bell,
  Clock,
  AlertTriangle,
  Music,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { adzanSettingsApi, type AdzanSettingsData } from "../../lib/api";

interface AdzanSettingsProps {
  isPlaying: boolean;
  countdown: string;
  nextPrayer: { name: string; time: Date } | null;
  currentPrayer: string | null;
  onPlay: () => void;
  onStop: () => void;
}

type TabType = "umum" | "tarhim" | "peringatan" | "waktu";

const DEFAULT_SETTINGS: AdzanSettingsData = {
  enabled: true,
  volume: 80,
  useSubuhAdzan: true,
  tarhimEnabled: true,
  tarhimMinutesBeforeImsak: 0,
  cautionEnabled: true,
  cautionSecondsBeforeAdzan: 60,
  cautionSecondsBeforeImsak: 60,
  enabledPrayers: {
    imsak: false,
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  },
};

export function AdzanSettings({
  isPlaying,
  countdown,
  nextPrayer,
  currentPrayer,
  onPlay,
  onStop,
}: AdzanSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("umum");
  const [settings, setSettings] = useState<AdzanSettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const data = await adzanSettingsApi.get();
      if (data) {
        setSettings(data);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const updateSetting = useCallback(
    <K extends keyof AdzanSettingsData>(
      key: K,
      value: AdzanSettingsData[K],
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    [],
  );

  const updateEnabledPrayer = useCallback(
    (prayer: keyof AdzanSettingsData["enabledPrayers"], value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        enabledPrayers: { ...prev.enabledPrayers, [prayer]: value },
      }));
      setHasChanges(true);
    },
    [],
  );

  const saveSettings = async () => {
    setIsSaving(true);
    const result = await adzanSettingsApi.update(settings);
    if (result.success) {
      setHasChanges(false);
      toast.success("Pengaturan adzan berhasil disimpan");
    } else {
      toast.error("Gagal menyimpan pengaturan");
    }
    setIsSaving(false);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "umum", label: "Umum", icon: <Bell className="w-4 h-4" /> },
    { id: "tarhim", label: "Tarhim", icon: <Music className="w-4 h-4" /> },
    {
      id: "peringatan",
      label: "Peringatan",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    { id: "waktu", label: "Waktu Sholat", icon: <Clock className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-800">
              Pengaturan Adzan
            </span>
          </div>

          {/* Master Toggle */}
          <button
            onClick={() => updateSetting("enabled", !settings.enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.enabled ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.enabled ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Next Prayer Info */}
        {nextPrayer && (
          <div className="mt-4 bg-emerald-50 rounded-xl p-4">
            <p className="text-sm text-emerald-600 mb-1">
              Waktu {nextPrayer.name} dalam
            </p>
            <p className="text-3xl font-bold font-mono text-emerald-700">
              {countdown}
            </p>
            <p className="text-xs text-emerald-500 mt-1">
              {nextPrayer.time.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {currentPrayer && (
          <p className="mt-2 text-sm text-slate-500">
            Waktu sekarang: <span className="font-medium">{currentPrayer}</span>
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 space-y-6">
        {activeTab === "umum" && (
          <>
            {/* Test Adzan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Test Adzan
              </label>
              <button
                onClick={isPlaying ? onStop : onPlay}
                disabled={!settings.enabled}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  settings.enabled
                    ? isPlaying
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Test Adzan
                  </>
                )}
              </button>
            </div>

            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Volume
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateSetting("volume", settings.volume > 0 ? 0 : 80)
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  {settings.volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) =>
                    updateSetting("volume", Number(e.target.value))
                  }
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-sm text-slate-500 w-10 text-right">
                  {settings.volume}%
                </span>
              </div>
            </div>

            {/* Use Subuh Adzan */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Adzan Subuh Berbeda
                </p>
                <p className="text-xs text-slate-500">
                  Gunakan file adzan_subuh.mp3
                </p>
              </div>
              <button
                onClick={() =>
                  updateSetting("useSubuhAdzan", !settings.useSubuhAdzan)
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings.useSubuhAdzan ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.useSubuhAdzan ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {activeTab === "tarhim" && (
          <>
            {/* Tarhim Enable */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Aktifkan Shalawat Tarhim
                </p>
                <p className="text-xs text-slate-500">
                  Diputar saat waktu Imsak
                </p>
              </div>
              <button
                onClick={() =>
                  updateSetting("tarhimEnabled", !settings.tarhimEnabled)
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings.tarhimEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.tarhimEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Tarhim Minutes Before */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Menit Sebelum Imsak
              </label>
              <p className="text-xs text-slate-500 mb-2">
                0 = tepat saat Imsak, 5 = 5 menit sebelum Imsak
              </p>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.tarhimMinutesBeforeImsak}
                onChange={(e) =>
                  updateSetting(
                    "tarhimMinutesBeforeImsak",
                    Number(e.target.value),
                  )
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </>
        )}

        {activeTab === "peringatan" && (
          <>
            {/* Caution Enable */}
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Aktifkan Peringatan
                </p>
                <p className="text-xs text-slate-500">
                  Tampilkan countdown berhati-hati
                </p>
              </div>
              <button
                onClick={() =>
                  updateSetting("cautionEnabled", !settings.cautionEnabled)
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  settings.cautionEnabled ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.cautionEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Seconds Before Adzan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detik Sebelum Adzan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={settings.cautionSecondsBeforeAdzan}
                  onChange={(e) =>
                    updateSetting(
                      "cautionSecondsBeforeAdzan",
                      Number(e.target.value),
                    )
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-sm text-slate-500">detik</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Contoh: 60 = 1 menit sebelum adzan
              </p>
            </div>

            {/* Seconds Before Imsak */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Detik Sebelum Imsak
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={settings.cautionSecondsBeforeImsak}
                  onChange={(e) =>
                    updateSetting(
                      "cautionSecondsBeforeImsak",
                      Number(e.target.value),
                    )
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-sm text-slate-500">detik</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "waktu" && (
          <>
            <p className="text-sm text-slate-500 mb-4">
              Pilih waktu sholat yang akan memutar adzan otomatis
            </p>

            {(
              Object.keys(settings.enabledPrayers) as Array<
                keyof typeof settings.enabledPrayers
              >
            ).map((prayer) => (
              <div
                key={prayer}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {prayer === "imsak" ? "Imsak (Tarhim)" : prayer}
                </span>
                <button
                  onClick={() =>
                    updateEnabledPrayer(
                      prayer,
                      !settings.enabledPrayers[prayer],
                    )
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.enabledPrayers[prayer]
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.enabledPrayers[prayer] ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AdzanSettings;
