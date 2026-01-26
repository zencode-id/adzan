
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({ icon, label, value, color = "text-emerald-950" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 text-slate-400 mb-2">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="schedule"
        label="Status"
        value="Aktif"
        color="text-emerald-600"
      />
      <StatCard
        icon="brightness_high"
        label="Tema"
        value="Dark"
      />
      <StatCard
        icon="aspect_ratio"
        label="Rasio"
        value="16:9"
      />
      <StatCard
        icon="sync"
        label="Refresh"
        value="1 detik"
      />
    </div>
  );
}
