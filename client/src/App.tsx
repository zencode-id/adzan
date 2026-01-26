import { useState, useEffect } from "react";
import {
  Sidebar,
  Header,
  GaugeChart,
  DeviceSpecifications,
  SystemMaintenance,
  SecurityStatus,
  SystemEvents,
  LocationSettings,
} from "./components/dashboard";
import { systemEventsApi, type MosqueInfo } from "./lib/api";

// Page header configurations
const pageConfig: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard",
    description:
      "Overview of your mosque display system status and activities.",
  },
  location: {
    title: "Pengaturan Lokasi",
    description:
      "Kelola nama masjid/musholla dan alamat lengkap untuk perhitungan waktu sholat.",
  },
  announcements: {
    title: "Pengumuman",
    description: "Kelola dan jadwalkan pengumuman untuk ditampilkan di layar.",
  },
  display: {
    title: "Konten Display",
    description: "Konfigurasi konten yang akan ditampilkan di layar.",
  },
  prayer: {
    title: "Kalkulasi Waktu Sholat",
    description: "Konfigurasi metode perhitungan waktu sholat dan penyesuaian.",
  },
  system: {
    title: "Informasi Sistem",
    description: "Monitor status teknis dan kelola perangkat keras display.",
  },
};

interface SystemEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "success" | "info" | "warning" | "error";
}

function App() {
  const [currentPage, setCurrentPage] = useState("location");
  const [isOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);

  // Format timestamp helper - defined before use
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  // Fetch system events on mount and when page changes to system
  useEffect(() => {
    const fetchEvents = async () => {
      const events = await systemEventsApi.getAll(10);
      const formattedEvents: SystemEvent[] = events.map((e) => ({
        id: String(e.id),
        title: e.title,
        description: e.description,
        timestamp: formatTimestamp(e.created_at),
        type: e.event_type,
      }));
      setSystemEvents(formattedEvents);
    };

    if (currentPage === "system") {
      fetchEvents();
    }
  }, [currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Refresh system events if on system page
    if (currentPage === "system") {
      const events = await systemEventsApi.getAll(10);
      const formattedEvents: SystemEvent[] = events.map((e) => ({
        id: String(e.id),
        title: e.title,
        description: e.description,
        timestamp: formatTimestamp(e.created_at),
        type: e.event_type,
      }));
      setSystemEvents(formattedEvents);
    }

    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCheckUpdates = () => {
    alert("Checking for updates...");
  };

  const handleRestart = () => {
    if (confirm("Are you sure you want to restart the system?")) {
      alert("System is restarting...");
    }
  };

  const handleDownloadLogs = () => {
    alert("Downloading system logs...");
  };

  const handleLocationSave = (data: MosqueInfo) => {
    console.log("Location saved:", data);
  };

  const { title, description } =
    pageConfig[currentPage] || pageConfig.dashboard;

  const renderContent = () => {
    switch (currentPage) {
      case "location":
        return <LocationSettings onSave={handleLocationSave} />;

      case "dashboard":
        return (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-slate-200 mb-4">
              dashboard
            </span>
            <h3 className="text-xl font-bold text-slate-400">Dashboard</h3>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        );

      case "announcements":
        return (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-slate-200 mb-4">
              campaign
            </span>
            <h3 className="text-xl font-bold text-slate-400">Pengumuman</h3>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        );

      case "display":
        return (
          <div className="space-y-8">
            {/* Preview Card */}
            <div className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
                <span className="material-symbols-outlined text-[200px]">
                  tv
                </span>
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                    Display Active
                  </span>
                </div>

                <h2 className="text-3xl font-bold mb-2">
                  Layar Display Masjid
                </h2>
                <p className="text-white/70 max-w-xl mb-6">
                  Tampilan utama yang akan ditampilkan di TV/Monitor masjid.
                  Berisi jam realtime, jadwal sholat, nama masjid, dan running
                  text pengumuman.
                </p>

                <div className="flex items-center gap-4">
                  <a
                    href="#/display"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-(--primary-gold) text-emerald-950 font-semibold rounded-xl hover:bg-[#e5c04a] transition-all btn-press shadow-lg"
                  >
                    <span className="material-symbols-outlined">
                      open_in_new
                    </span>
                    Buka Display (Fullscreen)
                  </a>

                  <a
                    href="#/display"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 font-medium rounded-xl hover:bg-white/20 transition-all btn-press"
                  >
                    <span className="material-symbols-outlined">
                      visibility
                    </span>
                    Preview
                  </a>
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
                <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">
                    help
                  </span>
                  Cara Menggunakan Display
                </h3>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">
                        Buka Display
                      </h4>
                      <p className="text-sm text-slate-500">
                        Klik tombol "Buka Display" untuk membuka layar di tab
                        baru
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">
                        Fullscreen
                      </h4>
                      <p className="text-sm text-slate-500">
                        Tekan F11 untuk mode fullscreen di browser
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">
                        Tampilkan di TV
                      </h4>
                      <p className="text-sm text-slate-500">
                        Hubungkan ke TV/Monitor via HDMI dan biarkan berjalan
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <span className="material-symbols-outlined">schedule</span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Status
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">Aktif</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <span className="material-symbols-outlined">
                    brightness_high
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Tema
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-950">Dark</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <span className="material-symbols-outlined">
                    aspect_ratio
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Rasio
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-950">16:9</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <span className="material-symbols-outlined">update</span>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Refresh
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-950">1 detik</p>
              </div>
            </div>
          </div>
        );

      case "prayer":
        return (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-8xl text-slate-200 mb-4">
              schedule
            </span>
            <h3 className="text-xl font-bold text-slate-400">
              Kalkulasi Waktu Sholat
            </h3>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        );

      case "system":
        return (
          <>
            {/* Gauge Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GaugeChart
                value={28}
                label="CPU Load"
                description="Stable Performance"
                color="emerald"
              />
              <GaugeChart
                value={44}
                maxValue={100}
                label="Temperature"
                unit="°C"
                description="Optimal Range"
                color="gold"
              />
              <GaugeChart
                value={76}
                label="Storage Usage"
                description="22.4 GB / 32 GB"
                color="blue"
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <DeviceSpecifications
                  serialNumber="MQ-8892-XT"
                  specifications={{
                    firmwareVersion: "v2.4.12-stable",
                    ipAddress: "192.168.1.105",
                    macAddress: "00:1A:2B:3C:4D:5E",
                    lastBoot: "12 Days, 4 Hours ago",
                    signalStrength: "-52 dBm",
                    signalStatus: "Excellent",
                    memory: "1.2 GB / 2.0 GB",
                  }}
                />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <SystemMaintenance
                  onCheckUpdates={handleCheckUpdates}
                  onRestart={handleRestart}
                  onDownloadLogs={handleDownloadLogs}
                />
                <SecurityStatus />
              </div>
            </div>

            {/* System Events from API */}
            <SystemEvents events={systemEvents} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-(--bg-light) text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeItem={currentPage} onItemClick={setCurrentPage} />

      {/* Main Content */}
      <main className="grow relative flex flex-col overflow-y-auto">
        {/* Islamic Pattern Background */}
        <div className="fixed inset-0 islamic-pattern pointer-events-none" />

        {/* Header */}
        <Header
          title={title}
          description={description}
          isOnline={isOnline}
          onRefresh={handleRefresh}
        />

        {/* Content */}
        <div
          className={`p-8 space-y-8 relative z-0 transition-opacity ${isRefreshing ? "opacity-50" : "opacity-100"}`}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
