import { useState, useEffect } from "react";
import { toast } from "sonner";
import { mosqueApi, type MosqueInfo } from "../../lib/api";
import {
  fetchProvinces,
  fetchCitiesByProvince,
  fetchDistrictsByCity,
  fetchVillagesByDistrict,
  formatCityName,
  isOnline,
} from "../../lib/regionsService";
import { type Province, type City } from "../../lib/indonesiaRegions";

interface LocationSettingsProps {
  onSave?: (data: MosqueInfo) => void;
}

const defaultMosqueInfo: MosqueInfo = {
  name: "Masjid Al-Ikhlas",
  type: "masjid",
  address: {
    street: "Jl. Raya Kebayoran Lama No. 123",
    village: "Kelurahan Kebayoran Lama Utara",
    district: "Kecamatan Kebayoran Lama",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postalCode: "12210",
    country: "Indonesia",
  },
  coordinates: {
    latitude: "-6.2442",
    longitude: "106.7822",
  },
  timezone: "Asia/Jakarta (WIB - UTC+7)",
  phone: "+62 21 1234 5678",
  email: "info@masjidalikhlash.id",
};

interface District {
  id: string;
  name: string;
}

interface Village {
  id: string;
  name: string;
}

export function LocationSettings({ onSave }: LocationSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo>(defaultMosqueInfo);
  const [editForm, setEditForm] = useState<MosqueInfo>(defaultMosqueInfo);
  const [error, setError] = useState<string | null>(null);

  // Region data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(isOnline());

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      const data = await fetchProvinces();
      setProvinces(data);
    };
    loadProvinces();
  }, []);

  // Fetch mosque data on mount
  useEffect(() => {
    const fetchMosqueData = async () => {
      setIsLoading(true);
      try {
        const data = await mosqueApi.get();
        if (data) {
          setMosqueInfo(data);
          setEditForm(data);
        }
      } catch (err) {
        console.error("Failed to fetch mosque data:", err);
        setError("Gagal mengambil data masjid");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMosqueData();
  }, []);

  // Update cities when province changes
  useEffect(() => {
    const loadCities = async () => {
      if (selectedProvinceId) {
        setIsLoadingRegions(true);
        const data = await fetchCitiesByProvince(selectedProvinceId);
        setCities(data);
        setIsLoadingRegions(false);
      } else {
        setCities([]);
      }
      setDistricts([]);
      setVillages([]);
      setSelectedDistrictId("");
    };
    loadCities();
  }, [selectedProvinceId]);

  // Update districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedCityId) {
        setIsLoadingRegions(true);
        const data = await fetchDistrictsByCity(selectedCityId);
        setDistricts(data);
        setIsLoadingRegions(false);
      } else {
        setDistricts([]);
      }
      setVillages([]);
    };
    loadDistricts();
  }, [selectedCityId]);

  // Update villages when district changes
  useEffect(() => {
    const loadVillages = async () => {
      if (selectedDistrictId) {
        setIsLoadingRegions(true);
        const data = await fetchVillagesByDistrict(selectedDistrictId);
        setVillages(data);
        setIsLoadingRegions(false);
      } else {
        setVillages([]);
      }
    };
    loadVillages();
  }, [selectedDistrictId]);

  // Set initial province when editing
  useEffect(() => {
    if (isEditing && editForm.address.province && provinces.length > 0) {
      const province = provinces.find(
        (p) => p.name.toLowerCase() === editForm.address.province.toLowerCase(),
      );
      if (province) {
        setSelectedProvinceId(province.id);
      }
    }
  }, [isEditing, editForm.address.province, provinces]);

  const handleEdit = () => {
    setEditForm(mosqueInfo);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm(mosqueInfo);
    setIsEditing(false);
    setError(null);
    setSelectedProvinceId("");
    setSelectedCityId("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await mosqueApi.update(editForm);
      if (result.success && result.data) {
        setMosqueInfo(result.data);
        setIsEditing(false);
        onSave?.(result.data);
        toast.success("Lokasi masjid berhasil disimpan");
      } else {
        setError("Gagal menyimpan perubahan");
        toast.error("Gagal menyimpan lokasi");
      }
    } catch (err) {
      console.error("Failed to save mosque data:", err);
      setError("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEditForm({
            ...editForm,
            coordinates: {
              latitude: position.coords.latitude.toFixed(4),
              longitude: position.coords.longitude.toFixed(4),
            },
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Gagal mendeteksi lokasi. Pastikan GPS aktif.");
        },
      );
    } else {
      alert("Browser tidak mendukung geolocation");
    }
  };

  const fullAddress = `${mosqueInfo.address.street}, ${mosqueInfo.address.village}, ${mosqueInfo.address.district}, ${mosqueInfo.address.city}, ${mosqueInfo.address.province} ${mosqueInfo.address.postalCode}, ${mosqueInfo.address.country}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-emerald-600 animate-pulse">
            mosque
          </span>
          <p className="mt-4 text-slate-500">Memuat data masjid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Network Status Indicator */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
          networkStatus
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            networkStatus ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span>
          {networkStatus
            ? "🌐 Online - Data wilayah dari API"
            : "📦 Offline - Menggunakan data lokal"}
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
          <span className="material-symbols-outlined">error</span>
          <p className="font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Mosque Identity Card */}
      <div className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-(--primary-gold) rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Background Icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <span className="material-symbols-outlined text-[200px]">mosque</span>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-(--primary-gold) animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                  {mosqueInfo.type === "masjid" ? "Masjid" : "Musholla"}{" "}
                  Terdaftar
                </span>
              </div>

              {/* Name */}
              <h2 className="text-4xl font-bold mb-2 tracking-tight">
                {mosqueInfo.name}
              </h2>

              {/* Full Address */}
              <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
                {fullAddress}
              </p>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all btn-press"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                <span className="font-medium text-sm">Edit</span>
              </button>
            )}
          </div>

          {/* Quick Info */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <span className="material-symbols-outlined text-lg">
                  schedule
                </span>
                <span className="text-xs font-medium uppercase tracking-wider">
                  Zona Waktu
                </span>
              </div>
              <p className="font-bold text-sm">{mosqueInfo.timezone}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <span className="material-symbols-outlined text-lg">
                  my_location
                </span>
                <span className="text-xs font-medium uppercase tracking-wider">
                  Koordinat
                </span>
              </div>
              <p className="font-bold text-sm">
                {mosqueInfo.coordinates.latitude},{" "}
                {mosqueInfo.coordinates.longitude}
              </p>
            </div>

            {mosqueInfo.phone && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <span className="material-symbols-outlined text-lg">
                    call
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Telepon
                  </span>
                </div>
                <p className="font-bold text-sm">{mosqueInfo.phone}</p>
              </div>
            )}

            {mosqueInfo.email && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <span className="material-symbols-outlined text-lg">
                    mail
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Email
                  </span>
                </div>
                <p className="font-bold text-sm truncate">{mosqueInfo.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form or Details */}
      {isEditing ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">
                edit_location_alt
              </span>
              Edit Informasi Lokasi
            </h3>
            {isLoadingRegions && (
              <span className="text-sm text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-lg">
                  sync
                </span>
                Memuat data wilayah...
              </span>
            )}
          </div>

          <div className="p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Nama Masjid/Musholla
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  placeholder="Nama masjid atau musholla"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Jenis
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      type: e.target.value as "masjid" | "musholla",
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                >
                  <option value="masjid">Masjid</option>
                  <option value="musholla">Musholla</option>
                </select>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h4 className="text-sm font-bold text-emerald-950 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-emerald-600">
                  home
                </span>
                Alamat Lengkap
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provinsi */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Provinsi
                  </label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => {
                      const provinceId = e.target.value;
                      setSelectedProvinceId(provinceId);
                      setSelectedCityId("");
                      const province = provinces.find(
                        (p) => p.id === provinceId,
                      );
                      setEditForm({
                        ...editForm,
                        address: {
                          ...editForm.address,
                          province: province?.name || "",
                          city: "",
                          district: "",
                        },
                      });
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kota/Kabupaten */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Kota/Kabupaten
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => {
                      const cityId = e.target.value;
                      setSelectedCityId(cityId);
                      const city = cities.find((c) => c.id === cityId);
                      setEditForm({
                        ...editForm,
                        address: {
                          ...editForm.address,
                          city: city ? formatCityName(city) : "",
                          district: "",
                        },
                      });
                    }}
                    disabled={!selectedProvinceId || isLoadingRegions}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingRegions
                        ? "Memuat..."
                        : selectedProvinceId
                          ? "-- Pilih Kota/Kabupaten --"
                          : "-- Pilih Provinsi Dulu --"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {formatCityName(city)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kecamatan */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Kecamatan
                  </label>
                  {districts.length > 0 ? (
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => {
                        const distId = e.target.value;
                        setSelectedDistrictId(distId);
                        const dist = districts.find((d) => d.id === distId);
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            district: dist?.name || "",
                            village: "", // Reset village
                          },
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    >
                      <option value="">-- Pilih Kecamatan --</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editForm.address.district}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            district: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                      placeholder={selectedCityId ? "Memuat..." : "Kecamatan"}
                    />
                  )}
                </div>

                {/* Kelurahan/Desa */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Kelurahan/Desa
                  </label>
                  {villages.length > 0 ? (
                    <select
                      value={editForm.address.village}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            village: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    >
                      <option value="">-- Pilih Kelurahan/Desa --</option>
                      {villages.map((village) => (
                        <option key={village.id} value={village.name}>
                          {village.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editForm.address.village}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            village: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                      placeholder={
                        selectedDistrictId ? "Memuat..." : "Kelurahan atau desa"
                      }
                    />
                  )}
                </div>

                {/* Jalan */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Alamat Jalan
                  </label>
                  <input
                    type="text"
                    value={editForm.address.street}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        address: {
                          ...editForm.address,
                          street: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                  />
                </div>

                {/* Kode Pos */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={editForm.address.postalCode}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        address: {
                          ...editForm.address,
                          postalCode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="Kode pos"
                  />
                </div>

                {/* Negara */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Negara
                  </label>
                  <input
                    type="text"
                    value={editForm.address.country}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        address: {
                          ...editForm.address,
                          country: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="Indonesia"
                  />
                </div>
              </div>
            </div>

            {/* Coordinates */}
            <div>
              <h4 className="text-sm font-bold text-emerald-950 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-emerald-600">
                  pin_drop
                </span>
                Koordinat GPS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={editForm.coordinates.latitude}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        coordinates: {
                          ...editForm.coordinates,
                          latitude: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="-6.2088"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={editForm.coordinates.longitude}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        coordinates: {
                          ...editForm.coordinates,
                          longitude: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="106.8456"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleDetectLocation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-all btn-press"
                  >
                    <span className="material-symbols-outlined text-lg">
                      my_location
                    </span>
                    <span>Deteksi Lokasi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-bold text-emerald-950 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-emerald-600">
                  contact_phone
                </span>
                Kontak
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="+62 21 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="info@masjid.id"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-all btn-press disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all btn-press shadow-lg shadow-emerald-600/25 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      sync
                    </span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">
                      save
                    </span>
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Address Details Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-hover">
            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">
                  home
                </span>
                Detail Alamat
              </h3>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">signpost</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Jalan
                  </p>
                  <p className="font-bold text-emerald-950">
                    {mosqueInfo.address.street}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">
                    holiday_village
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Kelurahan/Desa
                  </p>
                  <p className="font-bold text-emerald-950">
                    {mosqueInfo.address.village}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined">
                    location_city
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Kecamatan
                  </p>
                  <p className="font-bold text-emerald-950">
                    {mosqueInfo.address.district}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Kota/Kabupaten
                  </p>
                  <p className="font-bold text-emerald-950">
                    {mosqueInfo.address.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                  <span className="material-symbols-outlined">map</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Provinsi
                  </p>
                  <p className="font-bold text-emerald-950">
                    {mosqueInfo.address.province}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                  <span className="material-symbols-outlined">
                    markunread_mailbox
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Kode Pos
                  </p>
                  <p className="font-bold text-emerald-950">
                    {mosqueInfo.address.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-hover">
            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-emerald-950 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">
                  map
                </span>
                Lokasi di Peta
              </h3>
              <a
                href={`https://www.google.com/maps?q=${mosqueInfo.coordinates.latitude},${mosqueInfo.coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>Buka di Google Maps</span>
                <span className="material-symbols-outlined text-lg">
                  open_in_new
                </span>
              </a>
            </div>

            <div className="p-4">
              <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden relative flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-emerald-300 mb-2">
                    pin_drop
                  </span>
                  <p className="text-slate-500 text-sm font-medium">
                    {mosqueInfo.coordinates.latitude},{" "}
                    {mosqueInfo.coordinates.longitude}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${mosqueInfo.coordinates.latitude},${mosqueInfo.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      map
                    </span>
                    Lihat di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LocationSettings;
