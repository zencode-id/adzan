// ============================================
// Enhanced Theme Selector Component
// With live preview and detailed theme info
// ============================================

import { useState } from "react";
import { builtinThemes, type ThemeConfig } from "../../themes";

interface ThemeSelectorProps {
  selectedThemeId: string;
  onThemeSelect: (themeId: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function ThemeSelector({
  selectedThemeId,
  onThemeSelect,
  onSave,
  isLoading = false,
}: ThemeSelectorProps) {
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);

  const selectedTheme = builtinThemes.find((t) => t.id === selectedThemeId);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            palette
          </span>
          Pilih Tema Display
        </h3>
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all btn-press shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          Simpan Tema
        </button>
      </div>

      <div className="p-8">
        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {builtinThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedThemeId === theme.id}
              onSelect={() => onThemeSelect(theme.id)}
              onPreview={() => setPreviewTheme(theme)}
              onPreviewEnd={() => setPreviewTheme(null)}
            />
          ))}
        </div>

        {/* Selected Theme Info */}
        {selectedTheme && (
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-6">
              {/* Theme Preview */}
              <div
                className="w-48 aspect-video rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: selectedTheme.colors.bg }}
              >
                <ThemePreviewMini theme={selectedTheme} />
              </div>

              {/* Theme Details */}
              <div className="flex-1">
                <h4 className="text-lg font-bold text-emerald-950">
                  {selectedTheme.name}
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedTheme.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <ThemeInfoBadge
                    icon="format_paint"
                    label="Layout"
                    value={selectedTheme.layout.type}
                  />
                  <ThemeInfoBadge
                    icon="animation"
                    label="Transisi"
                    value={selectedTheme.animation.transitionType}
                  />
                  <ThemeInfoBadge
                    icon="auto_awesome"
                    label="Clock Anim"
                    value={selectedTheme.animation.clockAnimation || "none"}
                  />
                  <ThemeInfoBadge
                    icon="star"
                    label="Particles"
                    value={
                      selectedTheme.animation.enableParticles ? "active" : "off"
                    }
                  />
                </div>

                {/* Color Palette */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Palet Warna
                  </p>
                  <div className="flex gap-2">
                    <ColorSwatch
                      color={selectedTheme.colors.primary}
                      label="Primary"
                    />
                    <ColorSwatch
                      color={selectedTheme.colors.secondary}
                      label="Secondary"
                    />
                    <ColorSwatch
                      color={selectedTheme.colors.accent}
                      label="Accent"
                    />
                    <ColorSwatch color={selectedTheme.colors.bg} label="BG" />
                    <ColorSwatch
                      color={selectedTheme.colors.text}
                      label="Text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Preview Modal */}
      {previewTheme && (
        <ThemePreviewModal
          theme={previewTheme}
          onClose={() => setPreviewTheme(null)}
        />
      )}
    </div>
  );
}

// ============================================
// Theme Card Component
// ============================================

interface ThemeCardProps {
  theme: ThemeConfig;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onPreviewEnd: () => void;
}

function ThemeCard({ theme, isSelected, onSelect, onPreview }: ThemeCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer group rounded-2xl overflow-hidden border-2 transition-all
        ${
          isSelected
            ? "border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.02]"
            : "border-slate-100 hover:border-slate-300 hover:shadow-lg"
        }
      `}
    >
      {/* Theme Preview Box */}
      <div
        className="aspect-video relative overflow-hidden"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <ThemePreviewMini theme={theme} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Preview fullscreen"
          >
            <span className="material-symbols-outlined text-white text-sm">
              fullscreen
            </span>
          </button>
        </div>
      </div>

      {/* Theme Info */}
      <div className="p-4 bg-white flex justify-between items-center">
        <div>
          <span className="font-bold text-emerald-950 text-sm block">
            {theme.name}
          </span>
          <span className="text-xs text-slate-400">
            {theme.layout.type} layout
          </span>
        </div>
        {isSelected && (
          <span className="material-symbols-outlined text-emerald-500 text-xl">
            check_circle
          </span>
        )}
      </div>

      {/* Animation Badge */}
      {theme.animation.enableParticles && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 rounded-full">
          <span className="material-symbols-outlined text-yellow-400 text-xs">
            auto_awesome
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Mini Theme Preview
// ============================================

interface ThemePreviewMiniProps {
  theme: ThemeConfig;
}

function ThemePreviewMini({ theme }: ThemePreviewMiniProps) {
  const { colors, ornaments } = theme;

  return (
    <div className="w-full h-full relative p-3 flex flex-col">
      {/* Pattern Overlay */}
      {ornaments.pattern && (
        <div
          className={`absolute inset-0 ${ornaments.pattern}-pattern`}
          style={{ opacity: ornaments.patternOpacity }}
        />
      )}

      {/* Simulated Header */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="h-1.5 w-16 rounded bg-white/30" />
        <div className="h-1.5 w-10 rounded bg-white/20" />
      </div>

      {/* Simulated Clock */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div
          className="text-2xl font-bold tracking-tight"
          style={{ color: colors.text }}
        >
          12:30
        </div>
      </div>

      {/* Simulated Prayer Times */}
      <div className="flex gap-1 justify-center relative z-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-3 w-6 rounded"
            style={{
              backgroundColor: i === 3 ? colors.primary : `${colors.text}20`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Theme Info Badge
// ============================================

interface ThemeInfoBadgeProps {
  icon: string;
  label: string;
  value: string;
}

function ThemeInfoBadge({ icon, label, value }: ThemeInfoBadgeProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
      <span className="material-symbols-outlined text-emerald-600 text-sm">
        {icon}
      </span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xs font-semibold text-emerald-950 capitalize">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Color Swatch
// ============================================

interface ColorSwatchProps {
  color: string;
  label: string;
}

function ColorSwatch({ color, label }: ColorSwatchProps) {
  return (
    <div className="group relative">
      <div
        className="w-8 h-8 rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
        title={`${label}: ${color}`}
      />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

// ============================================
// Theme Preview Modal
// ============================================

interface ThemePreviewModalProps {
  theme: ThemeConfig;
  onClose: () => void;
}

function ThemePreviewModal({ theme, onClose }: ThemePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.colors.bg }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        >
          <span className="material-symbols-outlined text-white">close</span>
        </button>

        {/* Theme Name Badge */}
        <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-black/50 rounded-xl">
          <span className="text-white font-bold">{theme.name}</span>
        </div>

        {/* Preview Content */}
        <div className="w-full h-full p-8 flex flex-col">
          {/* Pattern */}
          {theme.ornaments.pattern && (
            <div
              className={`absolute inset-0 ${theme.ornaments.pattern}-pattern`}
              style={{ opacity: theme.ornaments.patternOpacity }}
            />
          )}

          {/* Header */}
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ color: theme.colors.text }}
              >
                Masjid Al-Ikhlas
              </h2>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                Jakarta Selatan, DKI Jakarta
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                Senin, 27 Januari 2026
              </p>
              <p className="text-sm" style={{ color: theme.colors.primary }}>
                7 Rajab 1447 H
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="text-center">
              <p
                className="text-sm uppercase tracking-widest mb-2"
                style={{ color: theme.colors.textMuted }}
              >
                Waktu Sekarang
              </p>
              <div
                className={`text-8xl font-bold ${theme.animation.clockAnimation === "glow" ? "animate-theme-glow" : ""}`}
                style={{ color: theme.colors.text }}
              >
                12:30:45
              </div>
              <div className="mt-6">
                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${theme.colors.primary}30`,
                    color: theme.colors.primary,
                  }}
                >
                  Menuju Dzuhur • 00:45:30
                </span>
              </div>
            </div>
          </div>

          {/* Prayer Times Bar */}
          <div className="flex justify-center gap-4 relative z-10">
            {["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"].map(
              (prayer, i) => (
                <div
                  key={prayer}
                  className="px-4 py-3 rounded-xl text-center"
                  style={{
                    backgroundColor:
                      i === 1
                        ? `${theme.colors.primary}30`
                        : `${theme.colors.text}10`,
                    borderColor: i === 1 ? theme.colors.primary : "transparent",
                    borderWidth: i === 1 ? 2 : 0,
                  }}
                >
                  <p
                    className="text-xs font-medium"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {prayer}
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{
                      color: i === 1 ? theme.colors.primary : theme.colors.text,
                    }}
                  >
                    {["04:30", "12:15", "15:30", "18:00", "19:15"][i]}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeSelector;
