import SyncStatusBadge from "./SyncStatusBadge";

interface HeaderProps {
  title: string;
  description: string;
  isOnline?: boolean;
  onRefresh?: () => void;
}

export function Header({ title, description, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 glass-effect border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
      <div>
        <h2 className="text-2xl font-bold text-emerald-950">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <SyncStatusBadge />

        <div className="w-px h-10 bg-slate-200 mx-2" />

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="bg-slate-100 p-2 rounded-full text-slate-600 hover:bg-slate-200 transition-colors btn-press"
          title="Refresh"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
