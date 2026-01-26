interface SpecificationItemProps {
  icon: string;
  label: string;
  value: string;
  badge?: {
    text: string;
    variant: "success" | "warning" | "error";
  };
}

const badgeVariants = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-orange-100 text-orange-700",
  error: "bg-red-100 text-red-700",
};

function SpecificationItem({
  icon,
  label,
  value,
  badge,
}: SpecificationItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p className="font-bold text-emerald-950">{value}</p>
          {badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${badgeVariants[badge.variant]}`}
            >
              {badge.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeviceSpecificationsProps {
  serialNumber?: string;
  specifications?: {
    firmwareVersion: string;
    ipAddress: string;
    macAddress: string;
    lastBoot: string;
    signalStrength: string;
    signalStatus: "Excellent" | "Good" | "Poor";
    memory: string;
  };
}

export function DeviceSpecifications({
  serialNumber = "MQ-8892-XT",
  specifications = {
    firmwareVersion: "v2.4.12-stable",
    ipAddress: "192.168.1.105",
    macAddress: "00:1A:2B:3C:4D:5E",
    lastBoot: "12 Days, 4 Hours ago",
    signalStrength: "-52 dBm",
    signalStatus: "Excellent",
    memory: "1.2 GB / 2.0 GB",
  },
}: DeviceSpecificationsProps) {
  const signalBadgeVariant = {
    Excellent: "success" as const,
    Good: "warning" as const,
    Poor: "error" as const,
  };

  const specItems = [
    {
      icon: "terminal",
      label: "Firmware Version",
      value: specifications.firmwareVersion,
    },
    { icon: "lan", label: "IP Address", value: specifications.ipAddress },
    { icon: "router", label: "MAC Address", value: specifications.macAddress },
    { icon: "update", label: "Last Boot", value: specifications.lastBoot },
    {
      icon: "wifi",
      label: "Signal Strength",
      value: specifications.signalStrength,
      badge: {
        text: specifications.signalStatus,
        variant: signalBadgeVariant[specifications.signalStatus],
      },
    },
    { icon: "memory", label: "Memory (RAM)", value: specifications.memory },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-hover">
      {/* Header */}
      <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            settings_ethernet
          </span>
          Device Specifications
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Serial: {serialNumber}
        </span>
      </div>

      {/* Specifications Grid */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
        {specItems.map((item, index) => (
          <SpecificationItem
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            badge={item.badge}
          />
        ))}
      </div>
    </div>
  );
}

export default DeviceSpecifications;
