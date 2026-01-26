interface SecurityItemProps {
  label: string;
  status: string;
  isSecure?: boolean;
}

function SecurityItem({ label, status, isSecure = true }: SecurityItemProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span
        className={`font-bold ${isSecure ? "text-emerald-600" : "text-red-600"}`}
      >
        {status}
      </span>
    </div>
  );
}

interface SecurityStatusProps {
  items?: {
    label: string;
    status: string;
    isSecure: boolean;
  }[];
}

export function SecurityStatus({
  items = [
    { label: "Firewall", status: "Active", isSecure: true },
    { label: "SSL Certificate", status: "Valid", isSecure: true },
    { label: "Access Control", status: "Admin Only", isSecure: true },
  ],
}: SecurityStatusProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm card-hover">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-blue-500 text-xl">
          verified_user
        </span>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Security Status
        </h4>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <SecurityItem
            key={index}
            label={item.label}
            status={item.status}
            isSecure={item.isSecure}
          />
        ))}
      </div>
    </div>
  );
}

export default SecurityStatus;
