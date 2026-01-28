import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { systemEventsApi } from "../../lib/api";
import { r2Upload, type RemoteFile } from "../../lib/r2Upload";

interface MaintenanceButtonProps {
  icon: string;
  iconColor?: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

function MaintenanceButton({
  icon,
  iconColor = "text-[var(--primary-gold)]",
  label,
  onClick,
  variant = "primary",
  loading = false,
}: MaintenanceButtonProps) {
  const baseClasses =
    variant === "primary"
      ? "bg-emerald-800 hover:bg-emerald-700 border-emerald-700/50"
      : "bg-white/10 hover:bg-white/20 border-white/10";

  const textClasses = variant === "primary" ? "text-white" : "text-white/90";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full ${baseClasses} border flex items-center justify-between p-4 rounded-2xl transition-all group btn-press disabled:opacity-50`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`material-symbols-outlined ${iconColor} ${loading ? "animate-spin" : ""}`}
        >
          {loading ? "progress_activity" : icon}
        </span>
        <span className={`font-semibold text-sm ${textClasses}`}>{label}</span>
      </div>
      <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-1 transition-transform">
        chevron_right
      </span>
    </button>
  );
}

export function SystemMaintenance() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<RemoteFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const result = await r2Upload.listFiles(10);
      if (result.success) {
        setFiles(result.files || []);
      }
    } catch {
      console.error("Failed to fetch files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const result = await r2Upload.uploadFile(file, {
          folder: "uploads",
          onProgress: (progress) => {
            const overallProgress = Math.round(
              ((i + progress / 100) / selectedFiles.length) * 100,
            );
            setUploadProgress(overallProgress);
          },
        });

        if (result.success) {
          toast.success(`${file.name} berhasil diupload`);
        } else {
          toast.error(`Gagal upload ${file.name}: ${result.error}`);
        }
      }
      fetchFiles(); // Refresh list after all uploads
    } catch {
      toast.error("Gagal mengupload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFile = async (key: string) => {
    if (!confirm("Hapus file ini secara permanen?")) return;

    try {
      const result = await r2Upload.deleteFile(key, "manual-delete");
      if (result.success) {
        toast.success("File berhasil dihapus");
        fetchFiles();
      } else {
        toast.error("Gagal menghapus file");
      }
    } catch {
      toast.error("Gagal menghapus file");
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDownloadLogs = async () => {
    setIsDownloading(true);
    try {
      const events = await systemEventsApi.getAll(100);

      if (events.length === 0) {
        toast.info("Tidak ada log untuk diunduh");
        return;
      }

      const logContent = events
        .map(
          (e) =>
            `[${e.created_at}] [${e.event_type.toUpperCase()}] ${e.title}\n  ${e.description || "-"}`,
        )
        .join("\n\n");

      const header = `===========================================
MOSQUE DISPLAY SYSTEM LOGS
Generated: ${new Date().toLocaleString("id-ID")}
Total Events: ${events.length}
===========================================\n\n`;

      const blob = new Blob([header + logContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Log berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh log");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      window.location.reload();
    } catch {
      toast.error("Gagal menyinkronkan data");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const keysToKeep = ["mosque_id"];
      const allKeys = Object.keys(localStorage);
      let cleared = 0;

      for (const key of allKeys) {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
          cleared++;
        }
      }

      sessionStorage.clear();

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      toast.success(`Cache berhasil dibersihkan (${cleared} item)`);

      await systemEventsApi.create({
        title: "Cache dibersihkan",
        description: `${cleared} item cache dihapus`,
        event_type: "info",
      });
    } catch {
      console.error("Failed to clear cache");
      toast.error("Gagal membersihkan cache");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-9xl">engineering</span>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6">Pemeliharaan Sistem</h3>

        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/mp4,video/webm"
            multiple
            className="hidden"
          />

          <MaintenanceButton
            icon="cloud_upload"
            iconColor="text-blue-400"
            label={
              isUploading
                ? `Uploading... ${uploadProgress}%`
                : "Upload File ke R2"
            }
            onClick={handleUploadClick}
            loading={isUploading}
          />

          <MaintenanceButton
            icon="sync"
            iconColor="text-[var(--primary-gold)]"
            label="Sinkronkan Data"
            onClick={handleSyncData}
            loading={isSyncing}
          />

          <MaintenanceButton
            icon="delete_sweep"
            iconColor="text-orange-400"
            label="Bersihkan Cache"
            onClick={handleClearCache}
            loading={isClearing}
          />

          <MaintenanceButton
            icon="download"
            iconColor="text-white"
            label="Unduh Log Sistem"
            onClick={handleDownloadLogs}
            variant="secondary"
            loading={isDownloading}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-300">
              Recent Uploads (R2)
            </h4>
            <button
              onClick={fetchFiles}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span
                className={`material-symbols-outlined text-sm ${isLoadingFiles ? "animate-spin" : ""}`}
              >
                refresh
              </span>
            </button>
          </div>

          <div className="space-y-3">
            {isLoadingFiles && files.length === 0 ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-10 bg-white/5 rounded-xl"></div>
                <div className="h-10 bg-white/5 rounded-xl"></div>
              </div>
            ) : files.length === 0 ? (
              <p className="text-xs text-white/40 italic">
                Belum ada file di storage
              </p>
            ) : (
              files.map((file) => (
                <div
                  key={file.key}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-emerald-400 text-lg">
                      {file.httpMetadata?.contentType?.startsWith("image/")
                        ? "image"
                        : "draft"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate pr-2">
                        {file.key.split("/").pop()}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {formatBytes(file.size)} •{" "}
                        {new Date(file.uploaded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`${(import.meta.env.VITE_API_URL || "https://mosque-display-api.adzan.workers.dev").replace(/\/$/, "")}/api/files/${file.key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        open_in_new
                      </span>
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.key)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
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

export default SystemMaintenance;
