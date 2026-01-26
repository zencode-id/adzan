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

export interface SyncQueueItem {
  id?: number;
  table: string;
  localId: string;
  action: "create" | "update" | "delete";
  data?: any;
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
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("MosqueOfflineDB");

    this.version(1).stores({
      mosqueSettings: "++id, localId, syncStatus, updatedAt, remoteId",
      announcements: "++id, localId, syncStatus, updatedAt, remoteId, isActive",
      prayerSettings: "++id, localId, syncStatus, updatedAt, remoteId",
      displayContent:
        "++id, localId, syncStatus, updatedAt, remoteId, displayOrder",
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
  data?: any,
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

export default localDb;
