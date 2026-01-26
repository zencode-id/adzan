// Indonesian Regions Service - Hybrid (Online + Offline)
// Online: Uses API wilayah.id
// Offline: Falls back to local data

import {
  provinces as localProvinces,
  cities as localCities,
  type Province,
  type City,
} from "./indonesiaRegions";

// Cache for API data
let cachedProvinces: Province[] | null = null;
const cachedCities: Map<string, City[]> = new Map();

// API Base URL (can be changed for different providers)
const API_BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Fetch provinces - tries online first, falls back to offline
export async function fetchProvinces(): Promise<Province[]> {
  // Return cached if available
  if (cachedProvinces) {
    return cachedProvinces;
  }

  // Try online
  if (isOnline()) {
    try {
      const response = await fetch(`${API_BASE_URL}/provinces.json`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        cachedProvinces = data.map((item: { id: string; name: string }) => ({
          id: item.id,
          name: item.name,
        }));
        console.log("✅ Provinces fetched from API");
        return cachedProvinces!;
      }
    } catch (error) {
      console.warn(
        "⚠️ Failed to fetch provinces online, using offline data:",
        error,
      );
    }
  }

  // Fallback to offline
  console.log("📦 Using offline provinces data");
  return localProvinces;
}

// Fetch cities by province - tries online first, falls back to offline
export async function fetchCitiesByProvince(
  provinceId: string,
): Promise<City[]> {
  // Return cached if available
  if (cachedCities.has(provinceId)) {
    return cachedCities.get(provinceId)!;
  }

  // Try online
  if (isOnline()) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/regencies/${provinceId}.json`,
        {
          signal: AbortSignal.timeout(5000),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const cities: City[] = data.map(
          (item: { id: string; name: string }) => ({
            id: item.id,
            provinceId: provinceId,
            name: item.name.replace(/^(KABUPATEN|KOTA)\s+/i, ""),
            type: item.name.toUpperCase().startsWith("KOTA")
              ? ("kota" as const)
              : ("kabupaten" as const),
          }),
        );
        cachedCities.set(provinceId, cities);
        console.log(`✅ Cities for province ${provinceId} fetched from API`);
        return cities;
      }
    } catch (error) {
      console.warn(
        `⚠️ Failed to fetch cities online for province ${provinceId}, using offline data:`,
        error,
      );
    }
  }

  // Fallback to offline
  console.log(`📦 Using offline cities data for province ${provinceId}`);
  return localCities.filter((city) => city.provinceId === provinceId);
}

// Fetch districts (kecamatan) by city
export async function fetchDistrictsByCity(
  cityId: string,
): Promise<{ id: string; name: string }[]> {
  if (!isOnline()) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/districts/${cityId}.json`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.map((item: { id: string; name: string }) => ({
        id: item.id,
        name: item.name,
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch districts:", error);
  }

  return [];
}

// Fetch villages (kelurahan/desa) by district
export async function fetchVillagesByDistrict(
  districtId: string,
): Promise<{ id: string; name: string }[]> {
  if (!isOnline()) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/villages/${districtId}.json`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );

    if (response.ok) {
      const data = await response.json();
      return data.map((item: { id: string; name: string }) => ({
        id: item.id,
        name: item.name,
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch villages:", error);
  }

  return [];
}

// Clear cache (useful for testing or refreshing data)
export function clearRegionCache(): void {
  cachedProvinces = null;
  cachedCities.clear();
}

// Preload all data for offline use
export async function preloadRegionsData(): Promise<void> {
  console.log("🔄 Preloading regions data for offline use...");

  const provinces = await fetchProvinces();

  // Preload cities for each province (this might take a while)
  for (const province of provinces) {
    await fetchCitiesByProvince(province.id);
  }

  console.log("✅ Regions data preloaded successfully");
}

// Format city name with type prefix
export function formatCityName(city: City): string {
  return `${city.type === "kota" ? "Kota" : "Kab."} ${city.name}`;
}

export default {
  isOnline,
  fetchProvinces,
  fetchCitiesByProvince,
  fetchDistrictsByCity,
  fetchVillagesByDistrict,
  clearRegionCache,
  preloadRegionsData,
  formatCityName,
};
