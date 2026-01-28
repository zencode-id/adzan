// ============================================
// Display Settings Page
// Admin page for managing display themes and schedules
// ============================================

import { useState, useEffect } from "react";
import { ThemeSelector } from "./ThemeSelector";
import {
  ThemeScheduleManager,
  type ScheduleFormData,
} from "./ThemeScheduleManager";
import { ThemeAssetGallery } from "./ThemeAssetGallery";
import { RunningTextManager } from "./RunningTextManager";
import { builtinThemes } from "../../themes";
import { mosqueApi } from "../../lib/api";

export function DisplaySettings() {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    builtinThemes[0].id,
  );
  const [schedules, setSchedules] = useState<ScheduleFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "theme" | "assets" | "schedule" | "ticker" | "preview"
  >("theme");

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const mosque = await mosqueApi.get();
        if (mosque?.themeId) {
          setSelectedThemeId(mosque.themeId);
        }
        // TODO: Load schedules from API
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleSaveTheme = async () => {
    setIsLoading(true);
    try {
      await mosqueApi.updateTheme(selectedThemeId);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedules = async () => {
    setIsLoading(true);
    try {
      // TODO: Save schedules to API
      console.log("Saving schedules:", schedules);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTheme = builtinThemes.find((t) => t.id === selectedThemeId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-950">
            Pengaturan Display
          </h2>
          <p className="text-slate-500 mt-1">
            Kelola tampilan layar masjid Anda
          </p>
        </div>

        {/* Live Preview Button */}
        <a
          href="/display"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-emerald-950 font-semibold rounded-xl hover:bg-slate-200 transition-all"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          Buka Display
        </a>
      </div>

      {/* Success Message */}
      {isSaved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl animate-theme-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-medium">Perubahan berhasil disimpan!</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: "theme", label: "Pilih Tema", icon: "palette" },
          { id: "assets", label: "Assets", icon: "perm_media" },
          { id: "ticker", label: "Running Text", icon: "subtitles" },
          { id: "schedule", label: "Jadwal Otomatis", icon: "schedule" },
          { id: "preview", label: "Preview", icon: "visibility" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${
                activeTab === tab.id
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "theme" && (
        <ThemeSelector
          selectedThemeId={selectedThemeId}
          onThemeSelect={setSelectedThemeId}
          onSave={handleSaveTheme}
          isLoading={isLoading}
        />
      )}

      {activeTab === "assets" && <ThemeAssetGallery />}

      {activeTab === "ticker" && <RunningTextManager />}

      {activeTab === "schedule" && (
        <ThemeScheduleManager
          schedules={schedules}
          onScheduleChange={setSchedules}
          onSave={handleSaveSchedules}
          isLoading={isLoading}
        />
      )}

      {activeTab === "preview" && selectedTheme && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">
                visibility
              </span>
              Preview: {selectedTheme.name}
            </h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-sm">
                  desktop_windows
                </span>
                Desktop
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-sm">
                  tablet
                </span>
                Tablet
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Preview Frame */}
            <div
              className="w-full aspect-video rounded-2xl overflow-hidden border-4 border-slate-200 shadow-inner"
              style={{ backgroundColor: selectedTheme.colors.bg }}
            >
              {/* Simulated Display */}
              <div className="w-full h-full p-6 flex flex-col relative">
                {/* Pattern */}
                {selectedTheme.ornaments.pattern && (
                  <div
                    className={`absolute inset-0 ${selectedTheme.ornaments.pattern}-pattern`}
                    style={{ opacity: selectedTheme.ornaments.patternOpacity }}
                  />
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <div className="h-4 w-32 rounded bg-white/30 mb-2" />
                    <div className="h-2 w-20 rounded bg-white/20" />
                  </div>
                  <div>
                    <div className="h-2 w-24 rounded bg-white/20 mb-1" />
                    <div
                      className="h-2 w-16 rounded"
                      style={{ backgroundColor: selectedTheme.colors.primary }}
                    />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                  <div className="text-center">
                    <div className="h-2 w-16 rounded bg-white/20 mx-auto mb-2" />
                    <div
                      className={`text-6xl font-bold ${selectedTheme.animation.clockAnimation === "glow" ? "animate-theme-glow" : ""}`}
                      style={{ color: selectedTheme.colors.text }}
                    >
                      12:30
                    </div>
                    <div
                      className="mt-4 inline-block px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${selectedTheme.colors.primary}30`,
                        color: selectedTheme.colors.primary,
                      }}
                    >
                      Menuju Dzuhur
                    </div>
                  </div>
                </div>

                {/* Prayer Bar */}
                <div className="flex gap-2 justify-center relative z-10">
                  {["S", "Z", "A", "M", "I"].map((p, i) => (
                    <div
                      key={p}
                      className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor:
                          i === 1
                            ? `${selectedTheme.colors.primary}`
                            : `${selectedTheme.colors.text}15`,
                        color: i === 1 ? "#fff" : selectedTheme.colors.text,
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Info */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <InfoCard
                icon="format_paint"
                label="Layout"
                value={selectedTheme.layout.type}
              />
              <InfoCard
                icon="animation"
                label="Transisi"
                value={selectedTheme.animation.transitionType}
              />
              <InfoCard
                icon="schedule"
                label="Durasi"
                value={`${selectedTheme.animation.transitionDuration}ms`}
              />
              <InfoCard
                icon="auto_awesome"
                label="Efek"
                value={
                  selectedTheme.animation.enableParticles
                    ? "Particles"
                    : "Standar"
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Info Card Component
// ============================================

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-emerald-600 text-sm">
          {icon}
        </span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-emerald-950 capitalize">{value}</p>
    </div>
  );
}

export default DisplaySettings;
