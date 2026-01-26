// Data Wilayah Indonesia - Offline First
// Sumber: Kemendagri RI

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
  type: "kabupaten" | "kota";
}

// Daftar Provinsi Indonesia
export const provinces: Province[] = [
  { id: "11", name: "Aceh" },
  { id: "12", name: "Sumatera Utara" },
  { id: "13", name: "Sumatera Barat" },
  { id: "14", name: "Riau" },
  { id: "15", name: "Jambi" },
  { id: "16", name: "Sumatera Selatan" },
  { id: "17", name: "Bengkulu" },
  { id: "18", name: "Lampung" },
  { id: "19", name: "Kepulauan Bangka Belitung" },
  { id: "21", name: "Kepulauan Riau" },
  { id: "31", name: "DKI Jakarta" },
  { id: "32", name: "Jawa Barat" },
  { id: "33", name: "Jawa Tengah" },
  { id: "34", name: "DI Yogyakarta" },
  { id: "35", name: "Jawa Timur" },
  { id: "36", name: "Banten" },
  { id: "51", name: "Bali" },
  { id: "52", name: "Nusa Tenggara Barat" },
  { id: "53", name: "Nusa Tenggara Timur" },
  { id: "61", name: "Kalimantan Barat" },
  { id: "62", name: "Kalimantan Tengah" },
  { id: "63", name: "Kalimantan Selatan" },
  { id: "64", name: "Kalimantan Timur" },
  { id: "65", name: "Kalimantan Utara" },
  { id: "71", name: "Sulawesi Utara" },
  { id: "72", name: "Sulawesi Tengah" },
  { id: "73", name: "Sulawesi Selatan" },
  { id: "74", name: "Sulawesi Tenggara" },
  { id: "75", name: "Gorontalo" },
  { id: "76", name: "Sulawesi Barat" },
  { id: "81", name: "Maluku" },
  { id: "82", name: "Maluku Utara" },
  { id: "91", name: "Papua" },
  { id: "92", name: "Papua Barat" },
  { id: "93", name: "Papua Selatan" },
  { id: "94", name: "Papua Tengah" },
  { id: "95", name: "Papua Pegunungan" },
  { id: "96", name: "Papua Barat Daya" },
];

// Daftar Kota/Kabupaten (Sample - bisa diperluas)
export const cities: City[] = [
  // DKI Jakarta
  { id: "3101", provinceId: "31", name: "Kepulauan Seribu", type: "kabupaten" },
  { id: "3171", provinceId: "31", name: "Jakarta Selatan", type: "kota" },
  { id: "3172", provinceId: "31", name: "Jakarta Timur", type: "kota" },
  { id: "3173", provinceId: "31", name: "Jakarta Pusat", type: "kota" },
  { id: "3174", provinceId: "31", name: "Jakarta Barat", type: "kota" },
  { id: "3175", provinceId: "31", name: "Jakarta Utara", type: "kota" },

  // Jawa Barat
  { id: "3201", provinceId: "32", name: "Bogor", type: "kabupaten" },
  { id: "3202", provinceId: "32", name: "Sukabumi", type: "kabupaten" },
  { id: "3203", provinceId: "32", name: "Cianjur", type: "kabupaten" },
  { id: "3204", provinceId: "32", name: "Bandung", type: "kabupaten" },
  { id: "3205", provinceId: "32", name: "Garut", type: "kabupaten" },
  { id: "3206", provinceId: "32", name: "Tasikmalaya", type: "kabupaten" },
  { id: "3207", provinceId: "32", name: "Ciamis", type: "kabupaten" },
  { id: "3208", provinceId: "32", name: "Kuningan", type: "kabupaten" },
  { id: "3209", provinceId: "32", name: "Cirebon", type: "kabupaten" },
  { id: "3210", provinceId: "32", name: "Majalengka", type: "kabupaten" },
  { id: "3211", provinceId: "32", name: "Sumedang", type: "kabupaten" },
  { id: "3212", provinceId: "32", name: "Indramayu", type: "kabupaten" },
  { id: "3213", provinceId: "32", name: "Subang", type: "kabupaten" },
  { id: "3214", provinceId: "32", name: "Purwakarta", type: "kabupaten" },
  { id: "3215", provinceId: "32", name: "Karawang", type: "kabupaten" },
  { id: "3216", provinceId: "32", name: "Bekasi", type: "kabupaten" },
  { id: "3217", provinceId: "32", name: "Bandung Barat", type: "kabupaten" },
  { id: "3218", provinceId: "32", name: "Pangandaran", type: "kabupaten" },
  { id: "3271", provinceId: "32", name: "Bogor", type: "kota" },
  { id: "3272", provinceId: "32", name: "Sukabumi", type: "kota" },
  { id: "3273", provinceId: "32", name: "Bandung", type: "kota" },
  { id: "3274", provinceId: "32", name: "Cirebon", type: "kota" },
  { id: "3275", provinceId: "32", name: "Bekasi", type: "kota" },
  { id: "3276", provinceId: "32", name: "Depok", type: "kota" },
  { id: "3277", provinceId: "32", name: "Cimahi", type: "kota" },
  { id: "3278", provinceId: "32", name: "Tasikmalaya", type: "kota" },
  { id: "3279", provinceId: "32", name: "Banjar", type: "kota" },

  // Jawa Tengah
  { id: "3301", provinceId: "33", name: "Cilacap", type: "kabupaten" },
  { id: "3302", provinceId: "33", name: "Banyumas", type: "kabupaten" },
  { id: "3303", provinceId: "33", name: "Purbalingga", type: "kabupaten" },
  { id: "3304", provinceId: "33", name: "Banjarnegara", type: "kabupaten" },
  { id: "3305", provinceId: "33", name: "Kebumen", type: "kabupaten" },
  { id: "3306", provinceId: "33", name: "Purworejo", type: "kabupaten" },
  { id: "3307", provinceId: "33", name: "Wonosobo", type: "kabupaten" },
  { id: "3308", provinceId: "33", name: "Magelang", type: "kabupaten" },
  { id: "3309", provinceId: "33", name: "Boyolali", type: "kabupaten" },
  { id: "3310", provinceId: "33", name: "Klaten", type: "kabupaten" },
  { id: "3311", provinceId: "33", name: "Sukoharjo", type: "kabupaten" },
  { id: "3312", provinceId: "33", name: "Wonogiri", type: "kabupaten" },
  { id: "3313", provinceId: "33", name: "Karanganyar", type: "kabupaten" },
  { id: "3314", provinceId: "33", name: "Sragen", type: "kabupaten" },
  { id: "3315", provinceId: "33", name: "Grobogan", type: "kabupaten" },
  { id: "3316", provinceId: "33", name: "Blora", type: "kabupaten" },
  { id: "3317", provinceId: "33", name: "Rembang", type: "kabupaten" },
  { id: "3318", provinceId: "33", name: "Pati", type: "kabupaten" },
  { id: "3319", provinceId: "33", name: "Kudus", type: "kabupaten" },
  { id: "3320", provinceId: "33", name: "Jepara", type: "kabupaten" },
  { id: "3321", provinceId: "33", name: "Demak", type: "kabupaten" },
  { id: "3322", provinceId: "33", name: "Semarang", type: "kabupaten" },
  { id: "3323", provinceId: "33", name: "Temanggung", type: "kabupaten" },
  { id: "3324", provinceId: "33", name: "Kendal", type: "kabupaten" },
  { id: "3325", provinceId: "33", name: "Batang", type: "kabupaten" },
  { id: "3326", provinceId: "33", name: "Pekalongan", type: "kabupaten" },
  { id: "3327", provinceId: "33", name: "Pemalang", type: "kabupaten" },
  { id: "3328", provinceId: "33", name: "Tegal", type: "kabupaten" },
  { id: "3329", provinceId: "33", name: "Brebes", type: "kabupaten" },
  { id: "3371", provinceId: "33", name: "Magelang", type: "kota" },
  { id: "3372", provinceId: "33", name: "Surakarta", type: "kota" },
  { id: "3373", provinceId: "33", name: "Salatiga", type: "kota" },
  { id: "3374", provinceId: "33", name: "Semarang", type: "kota" },
  { id: "3375", provinceId: "33", name: "Pekalongan", type: "kota" },
  { id: "3376", provinceId: "33", name: "Tegal", type: "kota" },

  // DI Yogyakarta
  { id: "3401", provinceId: "34", name: "Kulon Progo", type: "kabupaten" },
  { id: "3402", provinceId: "34", name: "Bantul", type: "kabupaten" },
  { id: "3403", provinceId: "34", name: "Gunungkidul", type: "kabupaten" },
  { id: "3404", provinceId: "34", name: "Sleman", type: "kabupaten" },
  { id: "3471", provinceId: "34", name: "Yogyakarta", type: "kota" },

  // Jawa Timur
  { id: "3501", provinceId: "35", name: "Pacitan", type: "kabupaten" },
  { id: "3502", provinceId: "35", name: "Ponorogo", type: "kabupaten" },
  { id: "3503", provinceId: "35", name: "Trenggalek", type: "kabupaten" },
  { id: "3504", provinceId: "35", name: "Tulungagung", type: "kabupaten" },
  { id: "3505", provinceId: "35", name: "Blitar", type: "kabupaten" },
  { id: "3506", provinceId: "35", name: "Kediri", type: "kabupaten" },
  { id: "3507", provinceId: "35", name: "Malang", type: "kabupaten" },
  { id: "3508", provinceId: "35", name: "Lumajang", type: "kabupaten" },
  { id: "3509", provinceId: "35", name: "Jember", type: "kabupaten" },
  { id: "3510", provinceId: "35", name: "Banyuwangi", type: "kabupaten" },
  { id: "3511", provinceId: "35", name: "Bondowoso", type: "kabupaten" },
  { id: "3512", provinceId: "35", name: "Situbondo", type: "kabupaten" },
  { id: "3513", provinceId: "35", name: "Probolinggo", type: "kabupaten" },
  { id: "3514", provinceId: "35", name: "Pasuruan", type: "kabupaten" },
  { id: "3515", provinceId: "35", name: "Sidoarjo", type: "kabupaten" },
  { id: "3516", provinceId: "35", name: "Mojokerto", type: "kabupaten" },
  { id: "3517", provinceId: "35", name: "Jombang", type: "kabupaten" },
  { id: "3518", provinceId: "35", name: "Nganjuk", type: "kabupaten" },
  { id: "3519", provinceId: "35", name: "Madiun", type: "kabupaten" },
  { id: "3520", provinceId: "35", name: "Magetan", type: "kabupaten" },
  { id: "3521", provinceId: "35", name: "Ngawi", type: "kabupaten" },
  { id: "3522", provinceId: "35", name: "Bojonegoro", type: "kabupaten" },
  { id: "3523", provinceId: "35", name: "Tuban", type: "kabupaten" },
  { id: "3524", provinceId: "35", name: "Lamongan", type: "kabupaten" },
  { id: "3525", provinceId: "35", name: "Gresik", type: "kabupaten" },
  { id: "3526", provinceId: "35", name: "Bangkalan", type: "kabupaten" },
  { id: "3527", provinceId: "35", name: "Sampang", type: "kabupaten" },
  { id: "3528", provinceId: "35", name: "Pamekasan", type: "kabupaten" },
  { id: "3529", provinceId: "35", name: "Sumenep", type: "kabupaten" },
  { id: "3571", provinceId: "35", name: "Kediri", type: "kota" },
  { id: "3572", provinceId: "35", name: "Blitar", type: "kota" },
  { id: "3573", provinceId: "35", name: "Malang", type: "kota" },
  { id: "3574", provinceId: "35", name: "Probolinggo", type: "kota" },
  { id: "3575", provinceId: "35", name: "Pasuruan", type: "kota" },
  { id: "3576", provinceId: "35", name: "Mojokerto", type: "kota" },
  { id: "3577", provinceId: "35", name: "Madiun", type: "kota" },
  { id: "3578", provinceId: "35", name: "Surabaya", type: "kota" },
  { id: "3579", provinceId: "35", name: "Batu", type: "kota" },

  // Banten
  { id: "3601", provinceId: "36", name: "Pandeglang", type: "kabupaten" },
  { id: "3602", provinceId: "36", name: "Lebak", type: "kabupaten" },
  { id: "3603", provinceId: "36", name: "Tangerang", type: "kabupaten" },
  { id: "3604", provinceId: "36", name: "Serang", type: "kabupaten" },
  { id: "3671", provinceId: "36", name: "Tangerang", type: "kota" },
  { id: "3672", provinceId: "36", name: "Cilegon", type: "kota" },
  { id: "3673", provinceId: "36", name: "Serang", type: "kota" },
  { id: "3674", provinceId: "36", name: "Tangerang Selatan", type: "kota" },

  // Bali
  { id: "5101", provinceId: "51", name: "Jembrana", type: "kabupaten" },
  { id: "5102", provinceId: "51", name: "Tabanan", type: "kabupaten" },
  { id: "5103", provinceId: "51", name: "Badung", type: "kabupaten" },
  { id: "5104", provinceId: "51", name: "Gianyar", type: "kabupaten" },
  { id: "5105", provinceId: "51", name: "Klungkung", type: "kabupaten" },
  { id: "5106", provinceId: "51", name: "Bangli", type: "kabupaten" },
  { id: "5107", provinceId: "51", name: "Karangasem", type: "kabupaten" },
  { id: "5108", provinceId: "51", name: "Buleleng", type: "kabupaten" },
  { id: "5171", provinceId: "51", name: "Denpasar", type: "kota" },

  // Sumatera Utara (sample)
  { id: "1271", provinceId: "12", name: "Medan", type: "kota" },
  { id: "1275", provinceId: "12", name: "Binjai", type: "kota" },
  { id: "1276", provinceId: "12", name: "Pematangsiantar", type: "kota" },

  // Sumatera Barat (sample)
  { id: "1371", provinceId: "13", name: "Padang", type: "kota" },
  { id: "1373", provinceId: "13", name: "Bukittinggi", type: "kota" },

  // Sumatera Selatan (sample)
  { id: "1671", provinceId: "16", name: "Palembang", type: "kota" },

  // Lampung (sample)
  { id: "1871", provinceId: "18", name: "Bandar Lampung", type: "kota" },

  // Kalimantan Selatan (sample)
  { id: "6371", provinceId: "63", name: "Banjarmasin", type: "kota" },

  // Kalimantan Timur (sample)
  { id: "6471", provinceId: "64", name: "Balikpapan", type: "kota" },
  { id: "6472", provinceId: "64", name: "Samarinda", type: "kota" },

  // Sulawesi Selatan (sample)
  { id: "7371", provinceId: "73", name: "Makassar", type: "kota" },

  // Sulawesi Utara (sample)
  { id: "7171", provinceId: "71", name: "Manado", type: "kota" },
];

// Helper functions
export function getProvinces(): Province[] {
  return provinces.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCitiesByProvince(provinceId: string): City[] {
  return cities
    .filter((city) => city.provinceId === provinceId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getProvinceById(id: string): Province | undefined {
  return provinces.find((p) => p.id === id);
}

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

export function getProvinceByName(name: string): Province | undefined {
  return provinces.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

export function getCityByName(
  name: string,
  provinceId?: string,
): City | undefined {
  if (provinceId) {
    return cities.find(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c.provinceId === provinceId,
    );
  }
  return cities.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function formatCityName(city: City): string {
  return `${city.type === "kota" ? "Kota" : "Kab."} ${city.name}`;
}

export default {
  provinces,
  cities,
  getProvinces,
  getCitiesByProvince,
  getProvinceById,
  getCityById,
  getProvinceByName,
  getCityByName,
  formatCityName,
};
