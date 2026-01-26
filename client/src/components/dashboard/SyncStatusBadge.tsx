import { useSync } from "../../hooks/useSync";

// ============================================
// Sync Status Badge Component
// ============================================
export function SyncStatusBadge() {
  const {
    isOnline,
    isSyncing,
    syncState,
    pendingChanges,
    syncNow,
    formatLastSync,
  } = useSync();

  // Determine badge color and icon based on state
  const getBadgeConfig = () => {
    if (!isOnline) {
      return {
        icon: "cloud_off",
        color: "bg-gray-500",
        textColor: "text-gray-100",
        label: "Offline",
        animate: false,
      };
    }

    if (isSyncing) {
      return {
        icon: "sync",
        color: "bg-blue-500",
        textColor: "text-blue-100",
        label: "Syncing...",
        animate: true,
      };
    }

    if (pendingChanges > 0) {
      return {
        icon: "cloud_upload",
        color: "bg-amber-500",
        textColor: "text-amber-100",
        label: `${pendingChanges} pending`,
        animate: false,
      };
    }

    if (syncState === "error") {
      return {
        icon: "cloud_alert",
        color: "bg-red-500",
        textColor: "text-red-100",
        label: "Sync Error",
        animate: false,
      };
    }

    // Synced
    return {
      icon: "cloud_done",
      color: "bg-emerald-500",
      textColor: "text-emerald-100",
      label: "Synced",
      animate: false,
    };
  };

  const config = getBadgeConfig();

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} ${config.textColor} text-sm font-medium`}
      >
        <span
          className={`material-symbols-outlined text-lg ${config.animate ? "animate-spin" : ""}`}
        >
          {config.icon}
        </span>
        <span>{config.label}</span>
      </div>

      {/* Sync Button */}
      {isOnline && !isSyncing && (
        <button
          onClick={() => syncNow()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm font-medium transition-all"
          title={`Last sync: ${formatLastSync()}`}
        >
          <span className="material-symbols-outlined text-lg">sync</span>
          <span className="hidden sm:inline">Sync Now</span>
        </button>
      )}

      {/* Last Sync Time (tooltip on hover) */}
      {syncState === "success" && (
        <span className="text-xs text-white/50 hidden md:inline">
          Last: {formatLastSync()}
        </span>
      )}
    </div>
  );
}

export default SyncStatusBadge;
