// ============================================
// Theme Schedule Manager Component
// For managing automatic theme switching schedules
// ============================================

import { useState } from "react";
import { builtinThemes, type ThemeConfig } from "../../themes";

// Local schedule form data (simpler than full ThemeScheduleConfig)
export interface ScheduleFormData {
  themeId: string;
  type: "time" | "date" | "prayer";
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  prayer?: string;
  priority: number;
}

interface ThemeScheduleManagerProps {
  schedules: ScheduleFormData[];
  onScheduleChange: (schedules: ScheduleFormData[]) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function ThemeScheduleManager({
  schedules,
  onScheduleChange,
  onSave,
  isLoading = false,
}: ThemeScheduleManagerProps) {
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleFormData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAddSchedule = () => {
    setIsAddingNew(true);
    setEditingSchedule({
      themeId: builtinThemes[0].id,
      type: "time",
      startTime: "06:00",
      endTime: "18:00",
      priority: schedules.length + 1,
    });
  };

  const handleSaveSchedule = (schedule: ScheduleFormData) => {
    if (isAddingNew) {
      onScheduleChange([...schedules, schedule]);
    } else {
      const index = schedules.findIndex(
        (s) =>
          s.themeId === editingSchedule?.themeId &&
          s.type === editingSchedule?.type,
      );
      if (index >= 0) {
        const updated = [...schedules];
        updated[index] = schedule;
        onScheduleChange(updated);
      }
    }
    setEditingSchedule(null);
    setIsAddingNew(false);
  };

  const handleDeleteSchedule = (index: number) => {
    const updated = schedules.filter((_, i) => i !== index);
    onScheduleChange(updated);
  };

  const getThemeById = (id: string): ThemeConfig | undefined => {
    return builtinThemes.find((t) => t.id === id);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            schedule
          </span>
          Jadwal Tema Otomatis
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-emerald-950 font-semibold rounded-xl hover:bg-slate-200 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Jadwal
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all btn-press shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">
                sync
              </span>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            Simpan
          </button>
        </div>
      </div>

      <div className="p-8">
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
              event_busy
            </span>
            <p className="text-slate-500">Belum ada jadwal tema</p>
            <p className="text-sm text-slate-400 mt-1">
              Tambahkan jadwal untuk mengganti tema secara otomatis berdasarkan
              waktu, tanggal, atau waktu sholat
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule, index) => {
              const theme = getThemeById(schedule.themeId);
              if (!theme) return null;

              return (
                <ScheduleCard
                  key={`${schedule.themeId}-${schedule.type}-${index}`}
                  schedule={schedule}
                  theme={theme}
                  onEdit={() => {
                    setEditingSchedule(schedule);
                    setIsAddingNew(false);
                  }}
                  onDelete={() => handleDeleteSchedule(index)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <ScheduleEditModal
          schedule={editingSchedule}
          themes={builtinThemes}
          isNew={isAddingNew}
          onSave={handleSaveSchedule}
          onCancel={() => {
            setEditingSchedule(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Schedule Card Component
// ============================================

interface ScheduleCardProps {
  schedule: ScheduleFormData;
  theme: ThemeConfig;
  onEdit: () => void;
  onDelete: () => void;
}

function ScheduleCard({
  schedule,
  theme,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const getScheduleIcon = () => {
    switch (schedule.type) {
      case "time":
        return "schedule";
      case "date":
        return "calendar_month";
      case "prayer":
        return "mosque";
      default:
        return "schedule";
    }
  };

  const getScheduleDescription = () => {
    switch (schedule.type) {
      case "time":
        return `${schedule.startTime} - ${schedule.endTime}`;
      case "date":
        return `${schedule.startDate} s/d ${schedule.endDate}`;
      case "prayer":
        return `Setelah ${schedule.prayer}`;
      default:
        return "";
    }
  };

  const getTypeLabel = () => {
    switch (schedule.type) {
      case "time":
        return "Waktu Harian";
      case "date":
        return "Rentang Tanggal";
      case "prayer":
        return "Waktu Sholat";
      default:
        return schedule.type;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors group">
      {/* Theme Preview */}
      <div
        className="w-16 h-12 rounded-xl shrink-0 flex items-center justify-center"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <span
          className="text-xs font-bold"
          style={{ color: theme.colors.text }}
        >
          {theme.name.substring(0, 2)}
        </span>
      </div>

      {/* Schedule Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-950">{theme.name}</span>
          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
            {getTypeLabel()}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          <span className="material-symbols-outlined text-sm">
            {getScheduleIcon()}
          </span>
          <span>{getScheduleDescription()}</span>
          {schedule.priority && (
            <>
              <span className="text-slate-300">•</span>
              <span>Prioritas: {schedule.priority}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          title="Edit"
        >
          <span className="material-symbols-outlined text-slate-600 text-sm">
            edit
          </span>
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          title="Hapus"
        >
          <span className="material-symbols-outlined text-red-500 text-sm">
            delete
          </span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// Schedule Edit Modal
// ============================================

interface ScheduleEditModalProps {
  schedule: ScheduleFormData;
  themes: ThemeConfig[];
  isNew: boolean;
  onSave: (schedule: ScheduleFormData) => void;
  onCancel: () => void;
}

function ScheduleEditModal({
  schedule,
  themes,
  isNew,
  onSave,
  onCancel,
}: ScheduleEditModalProps) {
  const [formData, setFormData] = useState<ScheduleFormData>(schedule);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-emerald-950">
            {isNew ? "Tambah Jadwal Baru" : "Edit Jadwal"}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Theme Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pilih Tema
            </label>
            <select
              value={formData.themeId}
              onChange={(e) =>
                setFormData({ ...formData, themeId: e.target.value })
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipe Jadwal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["time", "date", "prayer"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`
                    p-3 rounded-xl border-2 text-center transition-all
                    ${
                      formData.type === type
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300"
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-lg">
                    {type === "time"
                      ? "schedule"
                      : type === "date"
                        ? "calendar_month"
                        : "mosque"}
                  </span>
                  <p className="text-xs font-medium mt-1 capitalize">
                    {type === "time"
                      ? "Waktu"
                      : type === "date"
                        ? "Tanggal"
                        : "Sholat"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Time-based fields */}
          {formData.type === "time" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Waktu Mulai
                </label>
                <input
                  type="time"
                  value={formData.startTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Waktu Selesai
                </label>
                <input
                  type="time"
                  value={formData.endTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
          )}

          {/* Date-based fields */}
          {formData.type === "date" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
          )}

          {/* Prayer-based fields */}
          {formData.type === "prayer" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Setelah Waktu Sholat
              </label>
              <select
                value={formData.prayer || ""}
                onChange={(e) =>
                  setFormData({ ...formData, prayer: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="">Pilih waktu sholat</option>
                <option value="subuh">Subuh</option>
                <option value="terbit">Terbit (Matahari)</option>
                <option value="dzuhur">Dzuhur</option>
                <option value="ashar">Ashar</option>
                <option value="maghrib">Maghrib</option>
                <option value="isya">Isya</option>
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prioritas (semakin tinggi = lebih diutamakan)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.priority || 1}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {isNew ? "Tambah" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ThemeScheduleManager;
