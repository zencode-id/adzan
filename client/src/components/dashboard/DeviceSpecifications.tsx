import { useState, useEffect } from "react";

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

interface SystemInfo {
  browser: string;
  os: string;
  screenResolution: string;
  language: string;
  timezone: string;
  onlineStatus: "Online" | "Offline";
  memoryUsage: string;
  cores: string;
  connection: string;
  connectionStatus: "Excellent" | "Good" | "Poor";
}

function getSystemInfo(): SystemInfo {
  // Browser info
  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = `Chrome ${match ? match[1] : ""}`;
  } else if (userAgent.includes("Firefox")) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = `Firefox ${match ? match[1] : ""}`;
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg")) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = `Edge ${match ? match[1] : ""}`;
  }

  // OS info
  let os = "Unknown";
  if (userAgent.includes("Windows NT 10")) os = "Windows 10/11";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS X")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS") || userAgent.includes("iPhone"))
    os = "iOS";

  // Screen resolution
  const screenResolution = `${window.screen.width} × ${window.screen.height}`;

  // Language
  const language = navigator.language || "id-ID";

  // Timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Online status
  const onlineStatus = navigator.onLine ? "Online" : "Offline";

  // Memory (if available)
  let memoryUsage = "N/A";
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory) {
    memoryUsage = `${nav.deviceMemory} GB RAM`;
  }

  // CPU cores
  const cores = navigator.hardwareConcurrency
    ? `${navigator.hardwareConcurrency} Cores`
    : "N/A";

  // Connection type
  let connection = "Unknown";
  let connectionStatus: "Excellent" | "Good" | "Poor" = "Good";
  const conn = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number };
    }
  ).connection;
  if (conn) {
    const effectiveType = conn.effectiveType || "";
    if (effectiveType === "4g") {
      connection = "4G / WiFi";
      connectionStatus = "Excellent";
    } else if (effectiveType === "3g") {
      connection = "3G";
      connectionStatus = "Good";
    } else if (effectiveType === "2g" || effectiveType === "slow-2g") {
      connection = "2G (Slow)";
      connectionStatus = "Poor";
    } else {
      connection = effectiveType || "WiFi";
      connectionStatus = "Good";
    }
    if (conn.downlink) {
      connection += ` (${conn.downlink} Mbps)`;
    }
  } else if (navigator.onLine) {
    connection = "Connected";
    connectionStatus = "Excellent";
  }

  return {
    browser,
    os,
    screenResolution,
    language,
    timezone,
    onlineStatus,
    memoryUsage,
    cores,
    connection,
    connectionStatus,
  };
}

export function DeviceSpecifications() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(() =>
    getSystemInfo(),
  );
  const [uptime, setUptime] = useState("Loading...");

  useEffect(() => {
    // Calculate page uptime
    const startTime = Date.now();
    const updateUptime = () => {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setUptime(`${hours}h ${minutes % 60}m aktif`);
      } else if (minutes > 0) {
        setUptime(`${minutes}m ${seconds % 60}s aktif`);
      } else {
        setUptime(`${seconds}s aktif`);
      }
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);

    // Listen for online/offline changes
    const handleOnline = () => setSystemInfo(getSystemInfo());
    const handleOffline = () => setSystemInfo(getSystemInfo());
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const connectionBadgeVariant = {
    Excellent: "success" as const,
    Good: "warning" as const,
    Poor: "error" as const,
  };

  const specItems = [
    { icon: "web", label: "Browser", value: systemInfo.browser },
    { icon: "computer", label: "Sistem Operasi", value: systemInfo.os },
    {
      icon: "monitor",
      label: "Resolusi Layar",
      value: systemInfo.screenResolution,
    },
    { icon: "schedule", label: "Session", value: uptime },
    {
      icon: "wifi",
      label: "Koneksi",
      value: systemInfo.connection,
      badge: {
        text: systemInfo.connectionStatus,
        variant: connectionBadgeVariant[systemInfo.connectionStatus],
      },
    },
    { icon: "memory", label: "CPU", value: systemInfo.cores },
    { icon: "language", label: "Bahasa", value: systemInfo.language },
    { icon: "schedule", label: "Zona Waktu", value: systemInfo.timezone },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-hover">
      {/* Header */}
      <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            info
          </span>
          Informasi Sistem
        </h3>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
            systemInfo.onlineStatus === "Online"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {systemInfo.onlineStatus}
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
