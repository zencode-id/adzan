import {
  localDb,
  getPendingSyncItems,
  removeSyncQueueItem,
  incrementRetryCount,
  getPendingChangesCount,
  mosqueSettingsLocal,
  type SyncQueueItem,
} from "./localDatabase";

// ============================================
// Sync Service Types (Updated Check)
// ============================================
export type SyncState = "idle" | "syncing" | "success" | "error" | "offline";

export interface RemoteMosqueData {
  id: number;
  name: string;
  type: "masjid" | "musholla";
  street?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country: string;
  latitude?: string;
  longitude?: string;
  timezone: string;
  phone?: string;
  email?: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

// ============================================
// API Configuration
// ============================================
const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://mosque-display-api.kantorsunsal.workers.dev/").replace(/\/$/, "");

// ============================================
// Sync Service Class
// ============================================
class SyncService {
  private _isOnline: boolean = navigator.onLine;
  private _isSyncing: boolean = false;
  private _lastSyncTime: Date | null = null;
  private _syncState: SyncState = "idle";
  private _listeners: Set<(state: SyncServiceState) => void> = new Set();
  private _autoSyncInterval: number | null = null;

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this._isOnline = true;
      this._notifyListeners();
      // Auto sync when coming back online
      this.syncNow();
    });

    window.addEventListener("offline", () => {
      this._isOnline = false;
      this._syncState = "offline";
      this._notifyListeners();
    });
  }

  // ============================================
  // State Getters
  // ============================================
  get isOnline(): boolean {
    return this._isOnline;
  }

  get isSyncing(): boolean {
    return this._isSyncing;
  }

  get lastSyncTime(): Date | null {
    return this._lastSyncTime;
  }

  get syncState(): SyncState {
    return this._syncState;
  }

  // ============================================
  // Subscribe to state changes
  // ============================================
  subscribe(callback: (state: SyncServiceState) => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  private _notifyListeners() {
    const state = this.getState();
    this._listeners.forEach((cb) => cb(state));
  }

  getState(): SyncServiceState {
    return {
      isOnline: this._isOnline,
      isSyncing: this._isSyncing,
      lastSyncTime: this._lastSyncTime,
      syncState: this._syncState,
    };
  }

  // ============================================
  // Manual Sync
  // ============================================
  async syncNow(): Promise<SyncResult> {
    if (!this._isOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ["Device is offline"],
      };
    }

    if (this._isSyncing) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ["Sync already in progress"],
      };
    }

    this._isSyncing = true;
    this._syncState = "syncing";
    this._notifyListeners();

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get pending items from sync queue
      const pendingItems = await getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          await this._processSyncItem(item);
          await removeSyncQueueItem(item.id!);
          result.synced++;
        } catch (error) {
          result.failed++;
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push(`${item.table}/${item.localId}: ${errorMsg}`);
          await incrementRetryCount(item.id!, errorMsg);
        }
      }

      // Pull latest data from server
      await this._pullFromServer();

      this._lastSyncTime = new Date();
      this._syncState = result.failed > 0 ? "error" : "success";
      result.success = result.failed === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : "Sync failed",
      );
      this._syncState = "error";
    } finally {
      this._isSyncing = false;
      this._notifyListeners();
    }

    return result;
  }

  // ============================================
  // Process individual sync item
  // ============================================
  private async _processSyncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this._getEndpoint(item.table);

    switch (item.action) {
      case "create": {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.data),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // Update local record with remote ID
        if (result.id || result.data?.id) {
          const remoteId = result.id || result.data.id;
          await this._updateLocalRemoteId(item.table, item.localId, remoteId);
        }
        break;
      }

      case "update": {
        // Find remote ID
        const localRecord = await (localDb as any)[item.table].where("localId").equals(item.localId).first();
        const remoteId = localRecord?.remoteId;

        if (!remoteId && item.table !== "mosqueSettings") {
          throw new Error("Cannot update record without remote ID");
        }

        const url = (remoteId && item.table !== "mosqueSettings")
          ? `${API_BASE_URL}${endpoint}/${remoteId}`
          : `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.data),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        break;
      }

      case "delete": {
        const deleteResponse = await fetch(
          `${API_BASE_URL}${endpoint}/${item.data?.remoteId}`,
          {
            method: "DELETE",
          },
        );

        if (!deleteResponse.ok && deleteResponse.status !== 404) {
          throw new Error(`HTTP ${deleteResponse.status}`);
        }
        break;
      }
    }
  }

  // ============================================
  // Pull data from server
  // ============================================
  private async _pullFromServer(): Promise<void> {
    try {
      // 1. Pull mosque settings
      const mosqueResponse = await fetch(`${API_BASE_URL}/api/mosque`);
      if (mosqueResponse.ok) {
        const mosqueData = await mosqueResponse.json();
        if (mosqueData) {
          await this._mergeRemoteMosqueSettings(mosqueData);
        }
      }

      // 2. Pull announcements (could expand to other tables)
      // This is basic sync - for smarter sync, use dedicated /sync/pull endpoint
    } catch (error) {
      console.warn("Failed to pull from server:", error);
    }
  }

  private async _updateLocalRemoteId(table: string, localId: string, remoteId: number): Promise<void> {
    const tableInstance = (localDb as any)[table];
    if (tableInstance) {
      const record = await tableInstance.where("localId").equals(localId).first();
      if (record) {
        await tableInstance.update(record.id!, {
          syncStatus: "synced",
          syncedAt: Date.now(),
          remoteId: remoteId
        });
      }
    }
  }

  // ============================================
  // Merge remote data with local
  // ============================================
  private async _mergeRemoteMosqueSettings(
    remote: RemoteMosqueData,
  ): Promise<void> {
    const local = await mosqueSettingsLocal.get();

    if (!local) {
      // No local data, use remote
      await localDb.mosqueSettings.add({
        localId: crypto.randomUUID(),
        name: remote.name,
        type: remote.type,
        street: remote.street,
        village: remote.village,
        district: remote.district,
        city: remote.city,
        province: remote.province,
        postalCode: remote.postal_code,
        country: remote.country,
        latitude: remote.latitude,
        longitude: remote.longitude,
        timezone: remote.timezone,
        phone: remote.phone,
        email: remote.email,
        syncStatus: "synced",
        updatedAt: Date.now(),
        syncedAt: Date.now(),
        remoteId: remote.id,
      });
    } else if (local.syncStatus === "synced") {
      // Local is synced, can safely update with remote
      const remoteUpdated = new Date(remote.updated_at).getTime();
      if (remoteUpdated > (local.syncedAt || 0)) {
        await localDb.mosqueSettings.update(local.id!, {
          name: remote.name,
          type: remote.type,
          street: remote.street,
          village: remote.village,
          district: remote.district,
          city: remote.city,
          province: remote.province,
          postalCode: remote.postal_code,
          country: remote.country,
          latitude: remote.latitude,
          longitude: remote.longitude,
          timezone: remote.timezone,
          phone: remote.phone,
          email: remote.email,
          syncStatus: "synced",
          syncedAt: Date.now(),
          remoteId: remote.id,
        });
      }
    }
    // If local has pending changes, don't overwrite
  }

  // ============================================
  // Start auto sync
  // ============================================
  startAutoSync(intervalMs: number = 60000): void {
    if (this._autoSyncInterval) {
      clearInterval(this._autoSyncInterval);
    }

    this._autoSyncInterval = window.setInterval(() => {
      if (this._isOnline && !this._isSyncing) {
        this.syncNow();
      }
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this._autoSyncInterval) {
      clearInterval(this._autoSyncInterval);
      this._autoSyncInterval = null;
    }
  }

  // ============================================
  // Get endpoint for table
  // ============================================
  private _getEndpoint(table: string): string {
    const endpoints: Record<string, string> = {
      mosqueSettings: "/api/mosque",
      announcements: "/api/announcements",
      prayerSettings: "/api/prayer-settings",
      displayContent: "/api/display-content",
    };
    return endpoints[table] || `/${table}`;
  }

  // ============================================
  // Get pending changes count
  // ============================================
  async getPendingCount(): Promise<number> {
    return await getPendingChangesCount();
  }
}

// ============================================
// Types
// ============================================
export interface SyncServiceState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncState: SyncState;
}

// ============================================
// Singleton instance
// ============================================
export const syncService = new SyncService();

export default syncService;
