import { useEffect, useState, useCallback } from "react";
import { useAutoTheme } from "../../themes";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  loading?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  color = "text-emerald-950",
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 text-slate-400 mb-2">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
      ) : (
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      )}
    </div>
  );
}

interface StorageInfo {
  fileCount: number;
  totalSize: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function QuickStats() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentTheme } = useAutoTheme();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchStorageInfo = useCallback(async () => {
    try {
      const API_URL = (
        import.meta.env.VITE_API_URL ||
        "https://mosque-display-api.adzan.workers.dev"
      ).replace(/\/$/, "");
      const response = await fetch(`${API_URL}/api/files`);
      const data = await response.json();

      const files = data.files || [];
      const totalBytes = files.reduce(
        (sum: number, f: { size: number }) => sum + f.size,
        0,
      );

      setStorageInfo({
        fileCount: files.length,
        totalSize: formatBytes(totalBytes),
      });
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
      setStorageInfo({ fileCount: 0, totalSize: "0 B" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageInfo();
  }, [fetchStorageInfo]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={isOnline ? "wifi" : "wifi_off"}
        label="Status"
        value={isOnline ? "Online" : "Offline"}
        color={isOnline ? "text-emerald-600" : "text-rose-600"}
      />
      <StatCard
        icon="palette"
        label="Tema"
        value={currentTheme?.name || "Lampu"}
        color="text-amber-600"
      />
      <StatCard
        icon="cloud_upload"
        label="File R2"
        value={storageInfo ? `${storageInfo.fileCount} file` : "-"}
        color="text-blue-600"
        loading={loading}
      />
      <StatCard
        icon="storage"
        label="Storage"
        value={storageInfo?.totalSize || "-"}
        color="text-purple-600"
        loading={loading}
      />
    </div>
  );
}
