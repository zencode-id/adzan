// ============================================
// Running Text Settings Component
// Manage ticker/marquee text configuration
// ============================================

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Types
export interface RunningTextItem {
  id?: number;
  content: string;
  displayOrder: number;
  isActive: boolean;
  showIcon: boolean;
  icon: string;
}

export interface RunningTextSettings {
  showRunningText: boolean;
  speed: number; // 30=slow, 50=normal, 80=fast
  bgColor: string | null;
  textColor: string | null;
  fontSize: string;
  fontFamily: string;
  spacing: number; // spacing in rem (0.5=rapat, 0.75=normal, 1=renggang)
  separator: string; // separator character between items
}

interface RunningTextManagerProps {
  onSave?: () => void;
}

// Available icons for text items
const AVAILABLE_ICONS = [
  { icon: "📢", label: "Pengumuman" },
  { icon: "🕌", label: "Masjid" },
  { icon: "📍", label: "Lokasi" },
  { icon: "🌙", label: "Bulan" },
  { icon: "⭐", label: "Bintang" },
  { icon: "🧹", label: "Kebersihan" },
  { icon: "📵", label: "HP Silent" },
  { icon: "👟", label: "Sandal" },
  { icon: "🤲", label: "Doa" },
  { icon: "📖", label: "Al-Quran" },
  { icon: "💰", label: "Infaq" },
  { icon: "🎉", label: "Acara" },
];

// Available font families
const FONT_OPTIONS = [
  { value: "inherit", label: "Ikuti Tema" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
];

// Font size options
const FONT_SIZE_OPTIONS = [
  { value: "0.875rem", label: "Kecil" },
  { value: "1rem", label: "Normal" },
  { value: "1.25rem", label: "Sedang" },
  { value: "1.5rem", label: "Besar" },
  { value: "1.75rem", label: "Sangat Besar" },
];

// Speed presets
const SPEED_PRESETS = [
  { value: 30, label: "Lambat" },
  { value: 50, label: "Normal" },
  { value: 80, label: "Cepat" },
  { value: 120, label: "Sangat Cepat" },
];

// Spacing presets
const SPACING_PRESETS = [
  { value: 0.5, label: "Rapat" },
  { value: 0.75, label: "Normal" },
  { value: 1, label: "Renggang" },
  { value: 1.5, label: "Sangat Renggang" },
];

// Separator options
const SEPARATOR_OPTIONS = [
  { value: "•", label: "Titik (•)" },
  { value: "|", label: "Garis (|)" },
  { value: "★", label: "Bintang (★)" },
  { value: "◆", label: "Diamond (◆)" },
  { value: "—", label: "Dash (—)" },
  { value: "♦", label: "Wajik (♦)" },
  { value: "✦", label: "Star (✦)" },
  { value: " ", label: "Spasi" },
];

export function RunningTextManager({ onSave }: RunningTextManagerProps) {
  const [settings, setSettings] = useState<RunningTextSettings>({
    showRunningText: true,
    speed: 50,
    bgColor: null,
    textColor: null,
    fontSize: "1.25rem",
    fontFamily: "inherit",
    spacing: 0.75,
    separator: "•",
  });

  const [items, setItems] = useState<RunningTextItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<RunningTextItem | null>(null);
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemIcon, setNewItemIcon] = useState("📢");

  // Load settings and items from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load running text items
      const response = await fetch("/api/running-text");
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          setItems(
            data.items.map((item: Record<string, unknown>) => ({
              id: item.id,
              content: item.content,
              displayOrder: item.display_order ?? item.displayOrder ?? 0,
              isActive: item.is_active ?? item.isActive ?? true,
              showIcon: item.show_icon ?? item.showIcon ?? true,
              icon: item.icon ?? "📢",
            })),
          );
        }
        if (data.settings) {
          setSettings({
            showRunningText: data.settings.show_running_text ?? true,
            speed: data.settings.running_text_speed ?? 50,
            bgColor: data.settings.running_text_bg_color,
            textColor: data.settings.running_text_text_color,
            fontSize: data.settings.running_text_font_size ?? "1.25rem",
            fontFamily: data.settings.running_text_font_family ?? "inherit",
            spacing: data.settings.running_text_spacing ?? 0.75,
            separator: data.settings.running_text_separator ?? "•",
          });
        }
      }
    } catch (error) {
      console.error("Failed to load running text data:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/running-text/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Pengaturan running text berhasil disimpan!");
        onSave?.();
      } else {
        toast.error("Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemContent.trim()) {
      toast.error("Konten tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/running-text/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newItemContent.trim(),
          icon: newItemIcon,
          displayOrder: items.length,
          isActive: true,
          showIcon: true,
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems([...items, newItem]);
        setNewItemContent("");
        setNewItemIcon("📢");
        toast.success("Teks berhasil ditambahkan!");
      } else {
        toast.error("Gagal menambahkan teks");
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Gagal menambahkan teks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (item: RunningTextItem) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/running-text/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        setItems(items.map((i) => (i.id === item.id ? item : i)));
        setEditingItem(null);
        toast.success("Teks berhasil diupdate!");
      } else {
        toast.error("Gagal mengupdate teks");
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Gagal mengupdate teks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Yakin ingin menghapus teks ini?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/running-text/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast.success("Teks berhasil dihapus!");
      } else {
        toast.error("Gagal menghapus teks");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Gagal menghapus teks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = async (item: RunningTextItem) => {
    handleUpdateItem({ ...item, isActive: !item.isActive });
  };

  return (
    <div className="space-y-8">
      {/* Settings Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
          <h3 className="font-bold text-emerald-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              settings
            </span>
            Pengaturan Running Text
          </h3>
        </div>

        <div className="p-8 space-y-6">
          {/* Toggle On/Off */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600">
                subtitles
              </span>
              <div>
                <p className="font-medium text-emerald-950">
                  Tampilkan Running Text
                </p>
                <p className="text-sm text-slate-500">
                  Aktifkan teks berjalan di layar display
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  showRunningText: !settings.showRunningText,
                })
              }
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.showRunningText ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.showRunningText ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Speed Control */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-medium text-emerald-950">
              <span className="material-symbols-outlined text-sm">speed</span>
              Kecepatan
            </label>
            <div className="flex gap-2">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() =>
                    setSettings({ ...settings, speed: preset.value })
                  }
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                    settings.speed === preset.value
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={settings.speed}
              onChange={(e) =>
                setSettings({ ...settings, speed: parseInt(e.target.value) })
              }
              className="w-full accent-emerald-500"
            />
            <p className="text-sm text-slate-500 text-center">
              {settings.speed} pixel/detik
            </p>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-medium text-emerald-950">
              <span className="material-symbols-outlined text-sm">
                format_size
              </span>
              Ukuran Font
            </label>
            <div className="flex gap-2 flex-wrap">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setSettings({ ...settings, fontSize: option.value })
                  }
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    settings.fontSize === option.value
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-medium text-emerald-950">
              <span className="material-symbols-outlined text-sm">
                text_fields
              </span>
              Jenis Font
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                setSettings({ ...settings, fontFamily: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium text-emerald-950">
                <span className="material-symbols-outlined text-sm">
                  format_color_fill
                </span>
                Warna Background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.bgColor || "#10b981"}
                  onChange={(e) =>
                    setSettings({ ...settings, bgColor: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                />
                <button
                  onClick={() => setSettings({ ...settings, bgColor: null })}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Reset (Ikuti Tema)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium text-emerald-950">
                <span className="material-symbols-outlined text-sm">
                  format_color_text
                </span>
                Warna Teks
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.textColor || "#ffffff"}
                  onChange={(e) =>
                    setSettings({ ...settings, textColor: e.target.value })
                  }
                  className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer"
                />
                <button
                  onClick={() => setSettings({ ...settings, textColor: null })}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Reset (Ikuti Tema)
                </button>
              </div>
            </div>
          </div>

          {/* Spacing Control */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-medium text-emerald-950">
              <span className="material-symbols-outlined text-sm">
                horizontal_distribute
              </span>
              Kerapatan Teks
            </label>
            <div className="flex gap-2">
              {SPACING_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() =>
                    setSettings({ ...settings, spacing: preset.value })
                  }
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                    settings.spacing === preset.value
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Separator Control */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-medium text-emerald-950">
              <span className="material-symbols-outlined text-sm">
                more_horiz
              </span>
              Pemisah Antar Teks
            </label>
            <div className="flex gap-2 flex-wrap">
              {SEPARATOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setSettings({ ...settings, separator: option.value })
                  }
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    settings.separator === option.value
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    save
                  </span>
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
          <h3 className="font-bold text-emerald-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              visibility
            </span>
            Preview Running Text
          </h3>
        </div>

        <div className="p-8">
          <div
            className="rounded-xl py-4 px-6 overflow-hidden"
            style={{
              backgroundColor: settings.bgColor || "#10b981",
            }}
          >
            <div
              className="animate-marquee whitespace-nowrap"
              style={{
                fontSize: settings.fontSize,
                fontFamily: settings.fontFamily,
                color: settings.textColor || "#ffffff",
                animationDuration: `${100 / (settings.speed / 50)}s`,
              }}
            >
              {items
                .filter((item) => item.isActive)
                .map((item, index) => (
                  <span key={item.id || index}>
                    <span
                      className="font-semibold"
                      style={{ margin: `0 ${settings.spacing}rem` }}
                    >
                      {item.showIcon && item.icon} {item.content}
                    </span>
                    {index < items.filter((i) => i.isActive).length - 1 && (
                      <span
                        className="opacity-50"
                        style={{ margin: `0 ${settings.spacing}rem` }}
                      >
                        {settings.separator}
                      </span>
                    )}
                  </span>
                ))}
              {items.filter((i) => i.isActive).length === 0 && (
                <span className="font-semibold">
                  Belum ada teks. Tambahkan teks di bawah.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Text Items Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
          <h3 className="font-bold text-emerald-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">
              list
            </span>
            Daftar Teks
          </h3>
        </div>

        <div className="p-8 space-y-4">
          {/* Add New Item */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-4">
            <p className="font-medium text-emerald-950">Tambah Teks Baru</p>
            <div className="flex gap-2">
              {/* Icon Selector */}
              <div className="relative group">
                <button className="w-12 h-12 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-2xl hover:bg-slate-50 transition-colors">
                  {newItemIcon}
                </button>
                <div className="absolute left-0 top-full mt-2 hidden group-hover:grid grid-cols-4 gap-1 p-2 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.icon}
                      onClick={() => setNewItemIcon(item.icon)}
                      className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-xl transition-colors"
                      title={item.label}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <input
                type="text"
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                placeholder="Masukkan teks yang ingin ditampilkan..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />

              {/* Add Button */}
              <button
                onClick={handleAddItem}
                disabled={isLoading || !newItemContent.trim()}
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Tambah
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 block">
                  subtitles_off
                </span>
                <p>Belum ada teks. Tambahkan teks baru di atas.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.isActive
                      ? "bg-white border-slate-200"
                      : "bg-slate-50 border-slate-100 opacity-60"
                  }`}
                >
                  {/* Icon */}
                  <span className="text-2xl">{item.icon}</span>

                  {/* Content */}
                  {editingItem?.id === item.id && editingItem ? (
                    <input
                      type="text"
                      value={editingItem.content}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          content: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-emerald-500 bg-white focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <p className="flex-1 text-emerald-950">{item.content}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {editingItem?.id === item.id && editingItem ? (
                      <>
                        <button
                          onClick={() => handleUpdateItem(editingItem)}
                          className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            check
                          </span>
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            close
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleItem(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isActive
                              ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                          title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {item.isActive ? "visibility" : "visibility_off"}
                          </span>
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => item.id && handleDeleteItem(item.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RunningTextManager;
