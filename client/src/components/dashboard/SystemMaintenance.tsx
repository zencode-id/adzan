interface MaintenanceButtonProps {
  icon: string;
  iconColor?: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

function MaintenanceButton({
  icon,
  iconColor = "text-[var(--primary-gold)]",
  label,
  onClick,
  variant = "primary",
}: MaintenanceButtonProps) {
  const baseClasses =
    variant === "primary"
      ? "bg-emerald-800 hover:bg-emerald-700 border-emerald-700/50"
      : "bg-white/10 hover:bg-white/20 border-white/10";

  const textClasses = variant === "primary" ? "text-white" : "text-white/90";

  return (
    <button
      onClick={onClick}
      className={`w-full ${baseClasses} border flex items-center justify-between p-4 rounded-2xl transition-all group btn-press`}
    >
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        <span className={`font-semibold text-sm ${textClasses}`}>{label}</span>
      </div>
      <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-1 transition-transform">
        chevron_right
      </span>
    </button>
  );
}

interface SystemMaintenanceProps {
  onCheckUpdates?: () => void;
  onRestart?: () => void;
  onDownloadLogs?: () => void;
}

export function SystemMaintenance({
  onCheckUpdates,
  onRestart,
  onDownloadLogs,
}: SystemMaintenanceProps) {
  return (
    <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
      {/* Background Icon */}
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-9xl">engineering</span>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6">System Maintenance</h3>

        <div className="space-y-4">
          <MaintenanceButton
            icon="system_update"
            iconColor="text-[var(--primary-gold)]"
            label="Check for Updates"
            onClick={onCheckUpdates}
          />

          <MaintenanceButton
            icon="restart_alt"
            iconColor="text-orange-400"
            label="Restart System"
            onClick={onRestart}
          />

          <MaintenanceButton
            icon="download"
            iconColor="text-white"
            label="Download Logs"
            onClick={onDownloadLogs}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}

export default SystemMaintenance;
