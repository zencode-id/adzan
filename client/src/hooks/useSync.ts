import { useState, useEffect, useCallback } from "react";
import {
  syncService,
  type SyncState,
  type SyncResult,
  type SyncServiceState,
} from "../lib/syncService";
import { getPendingChangesCount } from "../lib/localDatabase";

// ============================================
// useSync Hook
// ============================================
export interface UseSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  syncState: SyncState;
  pendingChanges: number;
  lastSyncTime: Date | null;
  syncNow: () => Promise<SyncResult>;
  formatLastSync: () => string;
}

export function useSync(): UseSyncReturn {
  const [state, setState] = useState<SyncServiceState>(syncService.getState());
  const [pendingChanges, setPendingChanges] = useState<number>(0);

  // Subscribe to sync service state changes
  useEffect(() => {
    const unsubscribe = syncService.subscribe((newState) => {
      setState(newState);
    });

    // Start auto sync every 60 seconds
    syncService.startAutoSync(60000);

    return () => {
      unsubscribe();
      syncService.stopAutoSync();
    };
  }, []);

  // Update pending changes count periodically
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await getPendingChangesCount();
      setPendingChanges(count);
    };

    updatePendingCount();

    // Update every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, [state.isSyncing]); // Re-check after sync completes

  // Sync now function
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    return await syncService.syncNow();
  }, []);

  // Format last sync time
  const formatLastSync = useCallback((): string => {
    if (!state.lastSyncTime) {
      return "Never";
    }

    const now = new Date();
    const diff = now.getTime() - state.lastSyncTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} min ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return state.lastSyncTime.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }, [state.lastSyncTime]);

  return {
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    syncState: state.syncState,
    pendingChanges,
    lastSyncTime: state.lastSyncTime,
    syncNow,
    formatLastSync,
  };
}

export default useSync;
