import { Volume2, VolumeX, Play, Square, Bell } from "lucide-react";

interface AdzanControlProps {
  isEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  countdown: string;
  nextPrayer: { name: string; time: Date } | null;
  currentPrayer: string | null;
  onToggleEnabled: () => void;
  onPlay: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
}

export function AdzanControl({
  isEnabled,
  isPlaying,
  volume,
  countdown,
  nextPrayer,
  currentPrayer,
  onToggleEnabled,
  onPlay,
  onStop,
  onVolumeChange,
}: AdzanControlProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-slate-400">
          <Bell className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Adzan
          </span>
        </div>

        {/* Enable/Disable Toggle */}
        <button
          onClick={onToggleEnabled}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isEnabled ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              isEnabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Current Prayer */}
      <div className="mb-4">
        <p className="text-sm text-slate-500">Waktu sekarang</p>
        <p className="text-lg font-semibold text-slate-700">
          {currentPrayer || "—"}
        </p>
      </div>

      {/* Next Prayer & Countdown */}
      {nextPrayer && (
        <div className="bg-emerald-50 rounded-xl p-4 mb-4">
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

      {/* Controls */}
      <div className="space-y-4">
        {/* Play/Stop Button */}
        <div className="flex gap-2">
          <button
            onClick={isPlaying ? onStop : onPlay}
            disabled={!isEnabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              isEnabled
                ? isPlaying
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Test Adzan</span>
              </>
            )}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 80)}
            className="text-slate-400 hover:text-slate-600"
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            disabled={!isEnabled}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
          />
          <span className="text-sm text-slate-500 w-10 text-right">
            {volume}%
          </span>
        </div>
      </div>

      {/* Status */}
      {!isEnabled && (
        <p className="text-xs text-slate-400 text-center mt-4">
          Aktifkan untuk mendengar adzan otomatis
        </p>
      )}
    </div>
  );
}

export default AdzanControl;
