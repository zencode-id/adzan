import { useState } from "react";
import { toast } from "sonner";
import { systemEventsApi } from "../../lib/api";

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

  const handleDownloadLogs = async () => {
    setIsDownloading(true);
    try {
      // Fetch all system events
      const events = await systemEventsApi.getAll(100);

      if (events.length === 0) {
        toast.info("Tidak ada log untuk diunduh");
        return;
      }

      // Format as text file
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

      // Create and download file
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
    } catch (error) {
      console.error("Failed to download logs:", error);
      toast.error("Gagal mengunduh log");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      // Force reload data from server
      window.location.reload();
    } catch (error) {
      toast.error("Gagal menyinkronkan data");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear localStorage
      const keysToKeep = ["mosque_id"]; // Keep essential data
      const allKeys = Object.keys(localStorage);
      let cleared = 0;

      for (const key of allKeys) {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
          cleared++;
        }
      }

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear cache if available
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      toast.success(`Cache berhasil dibersihkan (${cleared} item)`);

      // Log the event
      await systemEventsApi.create({
        title: "Cache dibersihkan",
        description: `${cleared} item cache dihapus`,
        event_type: "info",
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.error("Gagal membersihkan cache");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
      {/* Background Icon */}
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-9xl">engineering</span>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6">Pemeliharaan Sistem</h3>

        <div className="space-y-4">
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
      </div>
    </div>
  );
}

export default SystemMaintenance;
