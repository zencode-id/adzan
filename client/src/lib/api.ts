const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://mosque-display-api.adzan.workers.dev/").replace(/\/$/, "") + "/api";

console.table({
  "Config Mode": import.meta.env.MODE,
  "VITE_API_URL": import.meta.env.VITE_API_URL || "Using Default",
  "Final API URL": API_BASE_URL
});

// Types
export interface MosqueInfo {
  id?: number;
  name: string;
  type: "masjid" | "musholla";
  address: {
    street: string;
    village: string;
    district: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  coordinates: {
    latitude: string;
    longitude: string;
  };
  timezone: string;
  phone?: string;
  email?: string;
  themeId?: string;
}

export interface MosqueInfoRaw {
  id: number;
  name: string;
  type: string;
  street: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
  phone: string;
  email: string;
  theme_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface DisplayContent {
  id?: number;
  content_type: string;
  title: string;
  content: string;
  media_url?: string;
  display_order: number;
  duration_seconds: number;
  is_active: boolean;
  created_at?: string;
}

export interface PrayerSettings {
  id?: number;
  calculation_method: string;
  madhab: string;
  fajr_adjustment: number;
  sunrise_adjustment: number;
  dhuhr_adjustment: number;
  asr_adjustment: number;
  maghrib_adjustment: number;
  isha_adjustment: number;
  high_latitude_rule: string;
  updated_at?: string;
}

export interface SystemEvent {
  id: number;
  title: string;
  description: string;
  event_type: "success" | "info" | "warning" | "error";
  created_at: string;
}

export interface Jadwal {
  id: number;
  tanggal: string;
  imsak: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Transform raw mosque data to structured format
export const transformMosqueData = (data: MosqueInfoRaw): MosqueInfo => {
  return {
    id: data.id,
    name: data.name,
    type: data.type as "masjid" | "musholla",
    address: {
      street: data.street || "",
      village: data.village || "",
      district: data.district || "",
      city: data.city || "",
      province: data.province || "",
      postalCode: data.postal_code || "",
      country: data.country || "Indonesia",
    },
    coordinates: {
      latitude: data.latitude || "0",
      longitude: data.longitude || "0",
    },
    timezone: data.timezone || "Asia/Jakarta (WIB - UTC+7)",
    phone: data.phone || "",
    email: data.email || "",
    themeId: data.theme_id || "emerald",
  };
};

// ============================================
// Mosque Settings API
// ============================================
export const mosqueApi = {
  async get(): Promise<MosqueInfo | null> {
    try {
      const raw = await apiCall<MosqueInfoRaw | null>("/mosque");
      return raw ? transformMosqueData(raw) : null;
    } catch (error) {
      console.error("Failed to fetch mosque settings:", error);
      return null;
    }
  },

  async update(
    data: MosqueInfo,
  ): Promise<{ success: boolean; data?: MosqueInfo }> {
    try {
      const response = await apiCall<{ success: boolean; data: MosqueInfoRaw }>(
        "/mosque",
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
      return {
        success: response.success,
        data: response.data ? transformMosqueData(response.data) : undefined,
      };
    } catch (error) {
      console.error("Failed to update mosque settings:", error);
      return { success: false };
    }
  },
};

// ============================================
// Jadwal API
// ============================================
export const jadwalApi = {
  async getAll(): Promise<Jadwal[]> {
    try {
      return await apiCall<Jadwal[]>("/jadwal");
    } catch (error) {
      console.error("Failed to fetch jadwal:", error);
      return [];
    }
  },

  async getToday(): Promise<Jadwal | null> {
    try {
      return await apiCall<Jadwal | null>("/jadwal/today");
    } catch (error) {
      console.error("Failed to fetch today jadwal:", error);
      return null;
    }
  },
};

// ============================================
// Announcements API
// ============================================
export const announcementsApi = {
  async getAll(): Promise<Announcement[]> {
    try {
      return await apiCall<Announcement[]>("/announcements");
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      return [];
    }
  },

  async create(
    data: Omit<Announcement, "id" | "created_at">,
  ): Promise<{ success: boolean; id?: number }> {
    try {
      return await apiCall<{ success: boolean; id: number }>("/announcements", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to create announcement:", error);
      return { success: false };
    }
  },

  async update(
    id: number,
    data: Partial<Announcement>,
  ): Promise<{ success: boolean }> {
    try {
      return await apiCall<{ success: boolean }>(`/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to update announcement:", error);
      return { success: false };
    }
  },

  async delete(id: number): Promise<{ success: boolean }> {
    try {
      return await apiCall<{ success: boolean }>(`/announcements/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      return { success: false };
    }
  },
};

// ============================================
// Display Content API
// ============================================
export const displayContentApi = {
  async getAll(): Promise<DisplayContent[]> {
    try {
      return await apiCall<DisplayContent[]>("/display-content");
    } catch (error) {
      console.error("Failed to fetch display content:", error);
      return [];
    }
  },

  async create(
    data: Omit<DisplayContent, "id" | "created_at">,
  ): Promise<{ success: boolean; id?: number }> {
    try {
      return await apiCall<{ success: boolean; id: number }>(
        "/display-content",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
    } catch (error) {
      console.error("Failed to create display content:", error);
      return { success: false };
    }
  },

  async update(
    id: number,
    data: Partial<DisplayContent>,
  ): Promise<{ success: boolean }> {
    try {
      return await apiCall<{ success: boolean }>(`/display-content/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to update display content:", error);
      return { success: false };
    }
  },

  async delete(id: number): Promise<{ success: boolean }> {
    try {
      return await apiCall<{ success: boolean }>(`/display-content/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete display content:", error);
      return { success: false };
    }
  },
};

// ============================================
// Prayer Settings API
// ============================================
export const prayerSettingsApi = {
  async get(): Promise<PrayerSettings | null> {
    try {
      return await apiCall<PrayerSettings | null>("/prayer-settings");
    } catch (error) {
      console.error("Failed to fetch prayer settings:", error);
      return null;
    }
  },

  async update(
    data: Partial<PrayerSettings>,
  ): Promise<{ success: boolean; data?: PrayerSettings }> {
    try {
      return await apiCall<{ success: boolean; data: PrayerSettings }>(
        "/prayer-settings",
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
    } catch (error) {
      console.error("Failed to update prayer settings:", error);
      return { success: false };
    }
  },
};

// ============================================
// System Events API
// ============================================
export const systemEventsApi = {
  async getAll(limit: number = 20): Promise<SystemEvent[]> {
    try {
      return await apiCall<SystemEvent[]>(`/system-events?limit=${limit}`);
    } catch (error) {
      console.error("Failed to fetch system events:", error);
      return [];
    }
  },

  async create(
    data: Omit<SystemEvent, "id" | "created_at">,
  ): Promise<{ success: boolean; id?: number }> {
    try {
      return await apiCall<{ success: boolean; id: number }>("/system-events", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to create system event:", error);
      return { success: false };
    }
  },
};

// Export all APIs
export const api = {
  mosque: mosqueApi,
  jadwal: jadwalApi,
  announcements: announcementsApi,
  displayContent: displayContentApi,
  prayerSettings: prayerSettingsApi,
  systemEvents: systemEventsApi,
};

export default api;
