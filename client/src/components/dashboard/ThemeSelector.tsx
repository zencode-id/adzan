import { themes } from "../../lib/themes";

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
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">palette</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              onClick={() => onThemeSelect(theme.id)}
              className={`
                relative cursor-pointer group rounded-2xl overflow-hidden border-2 transition-all
                ${
                  selectedThemeId === theme.id
                    ? "border-emerald-500 ring-4 ring-emerald-500/10"
                    : "border-slate-100 hover:border-slate-300"
                }
              `}
            >
              {/* Theme Preview Box */}
              <div
                className="aspect-video relative overflow-hidden flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: theme.colors.bg }}
              >
                {/* Simulated content */}
                <div className="w-full space-y-2 relative z-10">
                  <div className="h-2 w-1/2 rounded bg-white/20 mx-auto" />
                  <div
                    className="h-6 w-3/4 rounded mx-auto"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div className="grid grid-cols-3 gap-1">
                    <div className="h-4 rounded bg-white/10" />
                    <div className="h-4 rounded bg-white/10" />
                    <div className="h-4 rounded bg-white/10" />
                  </div>
                </div>

                {/* Patterns/Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none islamic-pattern" />
              </div>

              {/* Theme Info */}
              <div className="p-4 bg-white flex justify-between items-center">
                <span className="font-bold text-emerald-950 text-sm">{theme.name}</span>
                {selectedThemeId === theme.id && (
                  <span className="material-symbols-outlined text-emerald-500 text-xl">
                    check_circle
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
