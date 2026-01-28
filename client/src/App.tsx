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
  QuickStats,
  ThemeSelector,
  ThemeScheduleManager,
  ThemeAssetGallery,
  HijriCalendar,
  AdzanSettings,
} from "./components/dashboard";
import type { ScheduleFormData } from "./components/dashboard/ThemeScheduleManager";
import { toast } from "sonner";
import { useAdzan } from "./hooks/useAdzan";
import { useAutoTheme } from "./themes";
import { systemEventsApi, mosqueApi, type MosqueInfo } from "./lib/api";

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

// Wrapper component for AdzanSettings with useAdzan hook
function AdzanControlWrapper({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { state, playAdzan, stopAdzan } = useAdzan({
    prayerSettings: {
      latitude,
      longitude,
      calculationMethod: "Kemenag",
    },
    autoStart: true,
  });

  return (
    <AdzanSettings
      isPlaying={state.isPlaying}
      countdown={state.countdown}
      nextPrayer={state.nextPrayer}
      currentPrayer={state.currentPrayer}
      onPlay={playAdzan}
      onStop={stopAdzan}
    />
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("location");
  const [isOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);

  // Mosque and Theme State
  const { setTheme, setDefaultTheme } = useAutoTheme();
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState("emerald");
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [displayTab, setDisplayTab] = useState<"theme" | "schedule" | "assets">(
    "theme",
  );
  const [themeSchedules, setThemeSchedules] = useState<ScheduleFormData[]>([]);

  // Fetch mosque info on mount
  useEffect(() => {
    const fetchMosqueInfo = async () => {
      try {
        const info = await mosqueApi.get();
        if (info) {
          setMosqueInfo(info);
          setSelectedThemeId(info.themeId || "emerald");
          setDefaultTheme(info.themeId || "emerald");
          setTheme(info.themeId || "emerald");
        }
      } catch (error) {
        console.error("Failed to fetch mosque info:", error);
      }
    };

    fetchMosqueInfo();
  }, [setDefaultTheme, setTheme]);

  // Fetch system events when switching to system or dashboard page
  useEffect(() => {
    const fetchSystemEvents = async () => {
      if (currentPage === "system" || currentPage === "dashboard") {
        try {
          const events = await systemEventsApi.getAll(10);
          const formattedEvents: SystemEvent[] = events.map((e) => ({
            id: String(e.id),
            title: e.title,
            description: e.description,
            timestamp: formatTimestamp(e.created_at),
            type: e.event_type,
          }));
          setSystemEvents(formattedEvents);
        } catch (error) {
          console.error("Failed to fetch system events:", error);
        }
      }
    };

    fetchSystemEvents();
  }, [currentPage]);

  const handleThemeSave = async () => {
    if (!mosqueInfo) return;

    setIsSavingTheme(true);
    try {
      const updatedInfo = { ...mosqueInfo, themeId: selectedThemeId };
      await mosqueApi.update(updatedInfo);
      setMosqueInfo(updatedInfo);
      toast.success("Tema berhasil disimpan!");
    } catch (error) {
      console.error("Failed to save theme:", error);
      toast.error("Gagal menyimpan tema");
    } finally {
      setIsSavingTheme(false);
    }
  };

  // Format timestamp helper - defined before use
  // Database stores UTC time, need to convert to local timezone
  const formatTimestamp = (dateString: string): string => {
    // Parse as UTC if no timezone indicator present
    let date: Date;
    if (
      dateString.includes("Z") ||
      dateString.includes("+") ||
      dateString.includes("-")
    ) {
      date = new Date(dateString);
    } else {
      // Assume UTC if no timezone
      date = new Date(dateString + "Z");
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Display in local timezone (id-ID for Indonesian)
    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (diffDays === 0) {
      return `Hari ini, ${timeStr}`;
    } else if (diffDays === 1) {
      return `Kemarin, ${timeStr}`;
    } else {
      return `${diffDays} hari lalu`;
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
          <div className="space-y-8">
            {/* Quick Overview Stats */}
            <QuickStats />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Welcome & Preview */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
                    <span className="material-symbols-outlined text-[150px]">
                      mosque
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">
                      Selamat Datang, Admin
                    </h2>
                    <p className="text-white/70 max-w-lg mb-6">
                      Sistem monitoring dan kontrol display masjid Anda berjalan
                      dengan normal. Semua data tersinkronisasi dengan
                      Cloudflare D1.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentPage("location")}
                        className="px-6 py-2 bg-(--primary-gold) text-emerald-950 font-bold rounded-xl btn-press shadow-lg"
                      >
                        Atur Lokasi
                      </button>
                      <button
                        onClick={() => setCurrentPage("display")}
                        className="px-6 py-2 bg-white/10 border border-white/20 font-medium rounded-xl hover:bg-white/20 transition-all btn-press"
                      >
                        Lihat Display
                      </button>
                    </div>
                  </div>
                </div>

                {/* Integration with existing system components but tailored for overview */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">
                        history
                      </span>
                      Aktivitas Terakhir
                    </h3>
                    <button
                      onClick={() => setCurrentPage("system")}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="p-0">
                    <SystemEvents
                      events={systemEvents.slice(0, 5)}
                      showTitle={false}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Specs */}
              <div className="lg:col-span-4 space-y-8">
                {/* Hijri Calendar */}
                <HijriCalendar />

                <SecurityStatus />

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-emerald-950 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">
                      memory
                    </span>
                    Resource Device
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tight text-slate-400">
                        <span>CPU Load</span>
                        <span>28%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[28%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tight text-slate-400">
                        <span>RAM Usage</span>
                        <span>1.2 GB / 2.0 GB</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[60%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tight text-slate-400">
                        <span>Storage</span>
                        <span>22.4 GB / 32 GB</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-[76%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                  Kelola tema, jadwal otomatis, dan aset gambar untuk tampilan
                  layar masjid Anda.
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

            {/* Tabs Navigation */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setDisplayTab("theme")}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                    displayTab === "theme"
                      ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg align-middle mr-2">
                    palette
                  </span>
                  Pilih Tema
                </button>
                <button
                  onClick={() => setDisplayTab("schedule")}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                    displayTab === "schedule"
                      ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg align-middle mr-2">
                    schedule
                  </span>
                  Jadwal Otomatis
                </button>
                <button
                  onClick={() => setDisplayTab("assets")}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                    displayTab === "assets"
                      ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg align-middle mr-2">
                    image
                  </span>
                  Aset Gambar
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {displayTab === "theme" && (
                  <ThemeSelector
                    selectedThemeId={selectedThemeId}
                    onThemeSelect={setSelectedThemeId}
                    onSave={handleThemeSave}
                    isLoading={isSavingTheme}
                  />
                )}

                {displayTab === "schedule" && (
                  <ThemeScheduleManager
                    schedules={themeSchedules}
                    onScheduleChange={setThemeSchedules}
                    onSave={() =>
                      console.log("Saving schedules:", themeSchedules)
                    }
                    isLoading={false}
                  />
                )}

                {displayTab === "assets" && (
                  <ThemeAssetGallery themeLocalId={selectedThemeId} />
                )}
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
                        Pilih Tema
                      </h4>
                      <p className="text-sm text-slate-500">
                        Pilih tema yang sesuai atau atur jadwal otomatis
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">
                        Buka Display
                      </h4>
                      <p className="text-sm text-slate-500">
                        Klik tombol "Buka Display" untuk membuka layar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 mb-1">
                        Fullscreen
                      </h4>
                      <p className="text-sm text-slate-500">
                        Tekan F11 untuk mode fullscreen di TV/Monitor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "prayer":
        return (
          <div className="space-y-8">
            {/* Prayer Times Header */}
            <div className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
                <span className="material-symbols-outlined text-[150px]">
                  mosque
                </span>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">
                  Waktu Sholat Hari Ini
                </h2>
                <p className="text-white/70 max-w-lg">
                  Jadwal waktu sholat berdasarkan lokasi masjid. Adzan akan
                  berkumandang otomatis saat waktu sholat tiba.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Hijri Calendar */}
              <HijriCalendar />

              {/* Adzan Control - with mosque coordinates */}
              {mosqueInfo && (
                <div className="lg:col-span-2">
                  <AdzanControlWrapper
                    latitude={parseFloat(mosqueInfo.coordinates.latitude) || 0}
                    longitude={
                      parseFloat(mosqueInfo.coordinates.longitude) || 0
                    }
                  />
                </div>
              )}
              {!mosqueInfo && (
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-center">
                    Silakan atur lokasi masjid terlebih dahulu di menu{" "}
                    <strong>Pengaturan Lokasi</strong>.
                  </p>
                </div>
              )}
            </div>
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
                <DeviceSpecifications />
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
