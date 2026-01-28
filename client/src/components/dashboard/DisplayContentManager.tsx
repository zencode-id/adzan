import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit,
  Image,
  Video,
  FileText,
  Code,
  GripVertical,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { displayContentApi, type DisplayContent } from "../../lib/api";

type ContentType = "image" | "video" | "text" | "html";

interface DisplayContentManagerProps {
  onContentChange?: () => void;
}

export function DisplayContentManager({
  onContentChange,
}: DisplayContentManagerProps) {
  const [contents, setContents] = useState<DisplayContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<
    Omit<DisplayContent, "id" | "created_at">
  >({
    content_type: "text",
    title: "",
    content: "",
    media_url: "",
    display_order: 0,
    duration_seconds: 10,
    is_active: true,
  });

  const contentTypes: {
    type: ContentType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { type: "image", label: "Gambar", icon: <Image className="w-4 h-4" /> },
    { type: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
    { type: "text", label: "Teks", icon: <FileText className="w-4 h-4" /> },
    { type: "html", label: "HTML", icon: <Code className="w-4 h-4" /> },
  ];

  // Load contents
  const loadContents = async () => {
    setIsLoading(true);
    try {
      const data = await displayContentApi.getAll();
      setContents(data);
    } catch (error) {
      console.error("Failed to load contents:", error);
      toast.error("Gagal memuat konten");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const resetForm = () => {
    setFormData({
      content_type: "text",
      title: "",
      content: "",
      media_url: "",
      display_order: contents.length,
      duration_seconds: 10,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: DisplayContent) => {
    setFormData({
      content_type: item.content_type,
      title: item.title,
      content: item.content,
      media_url: item.media_url || "",
      display_order: item.display_order,
      duration_seconds: item.duration_seconds,
      is_active: item.is_active,
    });
    setEditingId(item.id || null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Judul harus diisi");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const result = await displayContentApi.update(editingId, formData);
        if (result.success) {
          toast.success("Konten berhasil diperbarui");
          resetForm();
          loadContents();
          onContentChange?.();
        } else {
          toast.error("Gagal memperbarui konten");
        }
      } else {
        const result = await displayContentApi.create({
          ...formData,
          display_order: contents.length,
        });
        if (result.success) {
          toast.success("Konten berhasil ditambahkan");
          resetForm();
          loadContents();
          onContentChange?.();
        } else {
          toast.error("Gagal menambahkan konten");
        }
      }
    } catch (error) {
      console.error("Failed to save content:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await displayContentApi.delete(id);
      if (result.success) {
        toast.success("Konten berhasil dihapus");
        setDeleteConfirmId(null);
        loadContents();
        onContentChange?.();
      } else {
        toast.error("Gagal menghapus konten");
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
      toast.error("Terjadi kesalahan");
    }
  };

  const handleToggleActive = async (item: DisplayContent) => {
    try {
      const result = await displayContentApi.update(item.id!, {
        ...item,
        is_active: !item.is_active,
      });
      if (result.success) {
        toast.success(
          item.is_active ? "Konten dinonaktifkan" : "Konten diaktifkan",
        );
        loadContents();
      }
    } catch (error) {
      console.error("Failed to toggle content:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "html":
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat konten...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-emerald-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">
                view_carousel
              </span>
              Konten Display
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Kelola konten yang ditampilkan di layar (slideshow, video, teks)
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Konten
          </button>
        </div>

        {/* Content List */}
        <div className="divide-y divide-slate-100">
          {contents.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
                view_carousel
              </span>
              <p className="text-slate-400">Belum ada konten display</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                + Tambah konten pertama
              </button>
            </div>
          ) : (
            contents.map((item, index) => (
              <div
                key={item.id}
                className={`px-8 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors ${
                  !item.is_active ? "opacity-50" : ""
                }`}
              >
                {/* Drag Handle */}
                <div className="text-slate-300 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order Number */}
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                  {index + 1}
                </div>

                {/* Type Icon */}
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  {getTypeIcon(item.content_type)}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-emerald-950 truncate">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {item.content_type.charAt(0).toUpperCase() +
                      item.content_type.slice(1)}{" "}
                    • {item.duration_seconds}s
                  </p>
                </div>

                {/* Preview (for images) */}
                {item.content_type === "image" && item.media_url && (
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.is_active
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                    title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {item.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(item.id || null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirmId === item.id && (
                  <div className="absolute right-8 bg-white border border-red-200 rounded-xl shadow-lg p-4 z-10">
                    <p className="text-sm text-slate-600 mb-3">
                      Hapus konten ini?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-emerald-950">
                {editingId ? "Edit Konten" : "Tambah Konten"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jenis Konten
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, content_type: type.type })
                      }
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                        formData.content_type === type.type
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {type.icon}
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Judul
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Masukkan judul konten"
                />
              </div>

              {/* Media URL (for image/video) */}
              {(formData.content_type === "image" ||
                formData.content_type === "video") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL Media
                  </label>
                  <input
                    type="url"
                    value={formData.media_url}
                    onChange={(e) =>
                      setFormData({ ...formData, media_url: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {/* Content (for text/html) */}
              {(formData.content_type === "text" ||
                formData.content_type === "html") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konten
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    placeholder={
                      formData.content_type === "html"
                        ? "<div>Kode HTML...</div>"
                        : "Masukkan teks konten"
                    }
                  />
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durasi Tampil (detik)
                </label>
                <input
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_seconds: parseInt(e.target.value) || 10,
                    })
                  }
                  min={1}
                  max={300}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Aktifkan konten
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.is_active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      formData.is_active ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? "Perbarui" : "Simpan"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayContentManager;
