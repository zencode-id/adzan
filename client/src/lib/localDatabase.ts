import Dexie, { type Table } from "dexie";

// ============================================
// Sync Status Types
// ============================================
export type SyncStatus = "synced" | "pending" | "conflict" | "error";

// ============================================
// Database Record Types (with sync metadata)
// ============================================
export interface LocalMosqueSettings {
  id?: number;
  localId: string; // UUID for offline-first
  name: string;
  type: "masjid" | "musholla";
  street?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  latitude?: string;
  longitude?: string;
  timezone: string;
  phone?: string;
  email?: string;
  defaultThemeId?: number;
  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number; // timestamp
  syncedAt?: number; // last successful sync
  remoteId?: number; // ID from server
}

export interface LocalAnnouncement {
  id?: number;
  localId: string;
  title: string;
  content?: string;
  type: "info" | "warning" | "success" | "error";
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

export interface LocalPrayerSettings {
  id?: number;
  localId: string;
  calculationMethod: string;
  madhab: string;
  fajrAdjustment: number;
  sunriseAdjustment: number;
  dhuhrAdjustment: number;
  asrAdjustment: number;
  maghribAdjustment: number;
  ishaAdjustment: number;
  highLatitudeRule: string;
  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

export interface LocalDisplayContent {
  id?: number;
  localId: string;
  contentType: string;
  title?: string;
  content?: string;
  mediaUrl?: string;
  displayOrder: number;
  durationSeconds: number;
  isActive: boolean;
  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

// ============================================
// Theme Types (for offline support)
// ============================================
export interface LocalTheme {
  id?: number;
  localId: string;
  name: string;
  slug: string;
  description?: string;
  previewImageUrl?: string;
  isBuiltin: boolean;
  isActive: boolean;
  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

export interface LocalThemeSettings {
  id?: number;
  localId: string;
  themeId: number; // remoteId of the theme
  themeLocalId: string; // localId of the theme

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  textSecondaryColor: string;

  // Background
  bgType: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradient: string;
  bgImageUrl?: string;
  bgOverlayColor: string;
  bgOverlayOpacity: number;

  // Typography
  fontFamily: string;
  clockFontSize: string;
  clockFontWeight: string;
  headerFontSize: string;
  prayerFontSize: string;

  // Layout
  layoutType: "classic" | "modern" | "minimal" | "fullscreen";
  showHeader: boolean;
  showDate: boolean;
  showHijriDate: boolean;
  showCountdown: boolean;
  showQuote: boolean;
  showPrayerBar: boolean;

  // Ornaments
  showOrnaments: boolean;
  ornamentStyle: "islamic" | "geometric" | "floral" | "none";
  ornamentOpacity: number;

  // Clock style
  clockStyle: "digital" | "analog";
  clockSeparator: string;
  clockShowSeconds: boolean;

  // Animation
  clockAnimation: "none" | "pulse" | "glow";
  transitionType: "fade" | "slide" | "zoom" | "crossfade";
  transitionDuration: number;

  // Prayer bar
  prayerBarStyle: "horizontal" | "vertical" | "grid";
  prayerBarPosition: "top" | "bottom";
  highlightCurrentPrayer: boolean;

  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

export interface LocalThemeSchedule {
  id?: number;
  localId: string;
  themeId: number;
  themeLocalId: string;
  name?: string;

  scheduleType: "time" | "prayer" | "date_range";

  // Time-based
  startTime?: string;
  endTime?: string;

  // Prayer-based
  prayerTrigger?: "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";
  offsetMinutes: number;
  durationMinutes: number;

  // Date range
  startDate?: string;
  endDate?: string;

  daysOfWeek: number[]; // [0,1,2,3,4,5,6]
  priority: number;
  isActive: boolean;

  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

export interface LocalThemeAsset {
  id?: number;
  localId: string;
  themeId: number;
  themeLocalId: string;

  assetType: "background" | "ornament" | "icon" | "illustration";
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;

  position: string;
  positionX?: string;
  positionY?: string;
  width?: string;
  height?: string;

  zIndex: number;
  opacity: number;
  animation?: "none" | "float" | "pulse" | "rotate";

  isActive: boolean;
  displayOrder: number;

  // For caching
  cachedBlobUrl?: string;

  // Sync metadata
  syncStatus: SyncStatus;
  updatedAt: number;
  syncedAt?: number;
  remoteId?: number;
}

export interface SyncQueueItem {
  id?: number;
  table: string;
  localId: string;
  action: "create" | "update" | "delete";
  data?: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

// ============================================
// Dexie Database Class
// ============================================
export class MosqueDatabase extends Dexie {
  mosqueSettings!: Table<LocalMosqueSettings>;
  announcements!: Table<LocalAnnouncement>;
  prayerSettings!: Table<LocalPrayerSettings>;
  displayContent!: Table<LocalDisplayContent>;
  themes!: Table<LocalTheme>;
  themeSettings!: Table<LocalThemeSettings>;
  themeSchedules!: Table<LocalThemeSchedule>;
  themeAssets!: Table<LocalThemeAsset>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("MosqueOfflineDB");

    // Version 1: Original tables
    this.version(1).stores({
      mosqueSettings: "++id, localId, syncStatus, updatedAt, remoteId",
      announcements: "++id, localId, syncStatus, updatedAt, remoteId, isActive",
      prayerSettings: "++id, localId, syncStatus, updatedAt, remoteId",
      displayContent:
        "++id, localId, syncStatus, updatedAt, remoteId, displayOrder",
      syncQueue: "++id, table, localId, action, createdAt",
    });

    // Version 2: Add theme tables
    this.version(2).stores({
      mosqueSettings: "++id, localId, syncStatus, updatedAt, remoteId",
      announcements: "++id, localId, syncStatus, updatedAt, remoteId, isActive",
      prayerSettings: "++id, localId, syncStatus, updatedAt, remoteId",
      displayContent:
        "++id, localId, syncStatus, updatedAt, remoteId, displayOrder",
      themes: "++id, localId, slug, syncStatus, updatedAt, remoteId, isActive",
      themeSettings:
        "++id, localId, themeId, themeLocalId, syncStatus, updatedAt, remoteId",
      themeSchedules:
        "++id, localId, themeId, themeLocalId, scheduleType, isActive, syncStatus, updatedAt, remoteId",
      themeAssets:
        "++id, localId, themeId, themeLocalId, assetType, syncStatus, updatedAt, remoteId",
      syncQueue: "++id, table, localId, action, createdAt",
    });
  }
}

// Create database instance
export const localDb = new MosqueDatabase();

// ============================================
// Helper Functions
// ============================================

// Generate UUID for offline records
export function generateLocalId(): string {
  return crypto.randomUUID();
}

// Get current timestamp
export function now(): number {
  return Date.now();
}

// ============================================
// Mosque Settings Operations
// ============================================
export const mosqueSettingsLocal = {
  async get(): Promise<LocalMosqueSettings | undefined> {
    return await localDb.mosqueSettings.toCollection().first();
  },

  async save(
    data: Omit<
      LocalMosqueSettings,
      "id" | "localId" | "syncStatus" | "updatedAt"
    >,
  ): Promise<void> {
    const existing = await this.get();

    if (existing) {
      // Update existing
      await localDb.mosqueSettings.update(existing.id!, {
        ...data,
        syncStatus: "pending",
        updatedAt: now(),
      });

      // Add to sync queue
      await addToSyncQueue("mosqueSettings", existing.localId, "update", data);
    } else {
      // Create new
      const localId = generateLocalId();
      await localDb.mosqueSettings.add({
        ...data,
        localId,
        syncStatus: "pending",
        updatedAt: now(),
        country: data.country || "Indonesia",
        timezone: data.timezone || "Asia/Jakarta (WIB - UTC+7)",
      });

      // Add to sync queue
      await addToSyncQueue("mosqueSettings", localId, "create", data);
    }
  },

  async markSynced(localId: string, remoteId: number): Promise<void> {
    const record = await localDb.mosqueSettings
      .where("localId")
      .equals(localId)
      .first();
    if (record) {
      await localDb.mosqueSettings.update(record.id!, {
        syncStatus: "synced",
        syncedAt: now(),
        remoteId,
      });
    }
  },
};

// ============================================
// Sync Queue Operations
// ============================================
export async function addToSyncQueue(
  table: string,
  localId: string,
  action: "create" | "update" | "delete",
  data?: Record<string, unknown>,
): Promise<void> {
  await localDb.syncQueue.add({
    table,
    localId,
    action,
    data,
    createdAt: now(),
    retryCount: 0,
  });
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return await localDb.syncQueue.orderBy("createdAt").toArray();
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  await localDb.syncQueue.delete(id);
}

export async function incrementRetryCount(
  id: number,
  error: string,
): Promise<void> {
  const item = await localDb.syncQueue.get(id);
  if (item) {
    await localDb.syncQueue.update(id, {
      retryCount: item.retryCount + 1,
      lastError: error,
    });
  }
}

// ============================================
// Get Pending Changes Count
// ============================================
export async function getPendingChangesCount(): Promise<number> {
  return await localDb.syncQueue.count();
}

// ============================================
// Sync Status Helpers
// ============================================
export async function getAllPendingRecords(): Promise<{
  mosqueSettings: LocalMosqueSettings[];
  announcements: LocalAnnouncement[];
  prayerSettings: LocalPrayerSettings[];
  displayContent: LocalDisplayContent[];
}> {
  return {
    mosqueSettings: await localDb.mosqueSettings
      .where("syncStatus")
      .equals("pending")
      .toArray(),
    announcements: await localDb.announcements
      .where("syncStatus")
      .equals("pending")
      .toArray(),
    prayerSettings: await localDb.prayerSettings
      .where("syncStatus")
      .equals("pending")
      .toArray(),
    displayContent: await localDb.displayContent
      .where("syncStatus")
      .equals("pending")
      .toArray(),
  };
}

// ============================================
// Theme Asset Operations (with Blob Caching)
// ============================================

// Blob storage for cached images
export interface CachedBlob {
  id?: number;
  assetLocalId: string;
  blob: Blob;
  mimeType: string;
  cachedAt: number;
  expiresAt: number; // Cache expiry
}

// Extend database for blob storage (version 3)
localDb.version(3).stores({
  mosqueSettings: "++id, localId, syncStatus, updatedAt, remoteId",
  announcements: "++id, localId, syncStatus, updatedAt, remoteId, isActive",
  prayerSettings: "++id, localId, syncStatus, updatedAt, remoteId",
  displayContent:
    "++id, localId, syncStatus, updatedAt, remoteId, displayOrder",
  themes: "++id, localId, slug, syncStatus, updatedAt, remoteId, isActive",
  themeSettings:
    "++id, localId, themeId, themeLocalId, syncStatus, updatedAt, remoteId",
  themeSchedules:
    "++id, localId, themeId, themeLocalId, scheduleType, isActive, syncStatus, updatedAt, remoteId",
  themeAssets:
    "++id, localId, themeId, themeLocalId, assetType, syncStatus, updatedAt, remoteId",
  cachedBlobs: "++id, assetLocalId, cachedAt, expiresAt",
  syncQueue: "++id, table, localId, action, createdAt",
});

// Theme Asset Local Operations
export const themeAssetsLocal = {
  // Get all assets for a theme
  async getByTheme(themeLocalId: string): Promise<LocalThemeAsset[]> {
    return await localDb.themeAssets
      .where("themeLocalId")
      .equals(themeLocalId)
      .toArray();
  },

  // Get assets by type
  async getByType(
    assetType: LocalThemeAsset["assetType"],
  ): Promise<LocalThemeAsset[]> {
    return await localDb.themeAssets
      .where("assetType")
      .equals(assetType)
      .toArray();
  },

  // Get single asset
  async get(localId: string): Promise<LocalThemeAsset | undefined> {
    return await localDb.themeAssets.where("localId").equals(localId).first();
  },

  // Save new asset
  async save(
    data: Omit<LocalThemeAsset, "id" | "localId" | "syncStatus" | "updatedAt">,
  ): Promise<string> {
    const localId = generateLocalId();
    await localDb.themeAssets.add({
      ...data,
      localId,
      syncStatus: "pending",
      updatedAt: now(),
    });
    await addToSyncQueue(
      "themeAssets",
      localId,
      "create",
      data as Record<string, unknown>,
    );
    return localId;
  },

  // Update asset
  async update(localId: string, data: Partial<LocalThemeAsset>): Promise<void> {
    const existing = await this.get(localId);
    if (existing) {
      await localDb.themeAssets.update(existing.id!, {
        ...data,
        syncStatus: "pending",
        updatedAt: now(),
      });
      await addToSyncQueue(
        "themeAssets",
        localId,
        "update",
        data as Record<string, unknown>,
      );
    }
  },

  // Delete asset
  async delete(localId: string): Promise<void> {
    const existing = await this.get(localId);
    if (existing) {
      // Also delete cached blob
      await this.deleteCachedBlob(localId);
      await localDb.themeAssets.delete(existing.id!);
      await addToSyncQueue("themeAssets", localId, "delete");
    }
  },

  // Mark as synced
  async markSynced(localId: string, remoteId: number): Promise<void> {
    const record = await this.get(localId);
    if (record) {
      await localDb.themeAssets.update(record.id!, {
        syncStatus: "synced",
        syncedAt: now(),
        remoteId,
      });
    }
  },

  // Upsert from server (don't add to sync queue)
  async upsert(data: LocalThemeAsset): Promise<void> {
    const existing = await this.get(data.localId);
    if (existing) {
      await localDb.themeAssets.update(existing.id!, {
        ...data,
        updatedAt: now(),
      });
    } else {
      await localDb.themeAssets.add({
        ...data,
        updatedAt: now(),
      });
    }
  },

  // ============================================
  // Blob Caching Functions
  // ============================================

  // Cache a blob for offline use
  async cacheBlob(
    assetLocalId: string,
    blob: Blob,
    ttlHours: number = 24 * 7, // 1 week default
  ): Promise<string> {
    const cachedAt = now();
    const expiresAt = cachedAt + ttlHours * 60 * 60 * 1000;

    // Remove old cache if exists
    await this.deleteCachedBlob(assetLocalId);

    // Store new blob
    await (
      localDb as unknown as { cachedBlobs: Table<CachedBlob> }
    ).cachedBlobs.add({
      assetLocalId,
      blob,
      mimeType: blob.type,
      cachedAt,
      expiresAt,
    });

    // Update asset with cached blob URL
    const blobUrl = URL.createObjectURL(blob);
    await this.update(assetLocalId, { cachedBlobUrl: blobUrl });

    return blobUrl;
  },

  // Get cached blob
  async getCachedBlob(assetLocalId: string): Promise<Blob | null> {
    const cached = await (
      localDb as unknown as { cachedBlobs: Table<CachedBlob> }
    ).cachedBlobs
      .where("assetLocalId")
      .equals(assetLocalId)
      .first();

    if (!cached) return null;

    // Check expiry
    if (cached.expiresAt < now()) {
      await this.deleteCachedBlob(assetLocalId);
      return null;
    }

    return cached.blob;
  },

  // Delete cached blob
  async deleteCachedBlob(assetLocalId: string): Promise<void> {
    const cached = await (
      localDb as unknown as { cachedBlobs: Table<CachedBlob> }
    ).cachedBlobs
      .where("assetLocalId")
      .equals(assetLocalId)
      .first();

    if (cached) {
      await (
        localDb as unknown as { cachedBlobs: Table<CachedBlob> }
      ).cachedBlobs.delete(cached.id!);
    }
  },

  // Get blob URL (from cache or fetch from network)
  async getBlobUrl(asset: LocalThemeAsset): Promise<string> {
    // Try cached blob first
    const cachedBlob = await this.getCachedBlob(asset.localId);
    if (cachedBlob) {
      return URL.createObjectURL(cachedBlob);
    }

    // Fetch from network and cache
    try {
      const response = await fetch(asset.fileUrl);
      if (response.ok) {
        const blob = await response.blob();
        return await this.cacheBlob(asset.localId, blob);
      }
    } catch (error) {
      console.error("Failed to fetch and cache asset:", error);
    }

    // Fallback to direct URL
    return asset.fileUrl;
  },

  // Preload all assets for a theme (for offline use)
  async preloadThemeAssets(themeLocalId: string): Promise<void> {
    const assets = await this.getByTheme(themeLocalId);

    for (const asset of assets) {
      if (asset.isActive && asset.fileUrl) {
        await this.getBlobUrl(asset);
      }
    }
  },

  // Clear expired cache
  async clearExpiredCache(): Promise<number> {
    const currentTime = now();
    const expired = await (
      localDb as unknown as { cachedBlobs: Table<CachedBlob> }
    ).cachedBlobs
      .where("expiresAt")
      .below(currentTime)
      .toArray();

    for (const item of expired) {
      await (
        localDb as unknown as { cachedBlobs: Table<CachedBlob> }
      ).cachedBlobs.delete(item.id!);
    }

    return expired.length;
  },

  // Get cache stats
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem: number | null;
  }> {
    const items = await (
      localDb as unknown as { cachedBlobs: Table<CachedBlob> }
    ).cachedBlobs.toArray();

    let totalSize = 0;
    let oldestItem: number | null = null;

    for (const item of items) {
      totalSize += item.blob.size;
      if (!oldestItem || item.cachedAt < oldestItem) {
        oldestItem = item.cachedAt;
      }
    }

    return {
      totalItems: items.length,
      totalSize,
      oldestItem,
    };
  },
};

// ============================================
// Theme Operations
// ============================================
export const themesLocal = {
  async getAll(): Promise<LocalTheme[]> {
    return await localDb.themes.toArray();
  },

  async getActive(): Promise<LocalTheme | undefined> {
    return await localDb.themes.where("isActive").equals(1).first();
  },

  async get(localId: string): Promise<LocalTheme | undefined> {
    return await localDb.themes.where("localId").equals(localId).first();
  },

  async save(
    data: Omit<LocalTheme, "id" | "localId" | "syncStatus" | "updatedAt">,
  ): Promise<string> {
    const localId = generateLocalId();
    await localDb.themes.add({
      ...data,
      localId,
      syncStatus: "pending",
      updatedAt: now(),
    });
    await addToSyncQueue(
      "themes",
      localId,
      "create",
      data as Record<string, unknown>,
    );
    return localId;
  },

  // Upsert from server
  async upsert(data: LocalTheme): Promise<void> {
    const existing = await this.get(data.localId);
    if (existing) {
      await localDb.themes.update(existing.id!, {
        ...data,
        updatedAt: now(),
      });
    } else {
      await localDb.themes.add({
        ...data,
        updatedAt: now(),
      });
    }
  },

  async setActive(localId: string): Promise<void> {
    // Deactivate all themes
    await localDb.themes.toCollection().modify({ isActive: false });

    // Activate selected theme
    const theme = await this.get(localId);
    if (theme) {
      await localDb.themes.update(theme.id!, { isActive: true });
    }
  },
};

export default localDb;
