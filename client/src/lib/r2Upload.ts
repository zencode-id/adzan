// ============================================
// R2 Upload Service
// Cloudflare R2 integration for theme assets
// ============================================

import { themeAssetsLocal, generateLocalId, now } from "./localDatabase";
import type { LocalThemeAsset } from "./localDatabase";

const API_BASE_URL =
  (
    import.meta.env.VITE_API_URL ||
    "https://mosque-display-api.adzan.workers.dev/"
  ).replace(/\/$/, "") + "/api";

// Upload result type
export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
  localId?: string;
}

// Upload progress callback
export type UploadProgressCallback = (progress: number) => void;

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

// Generate unique filename
function generateFileName(file: File, prefix: string = "asset"): string {
  const ext = file.name.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}.${ext}`;
}

// ============================================
// R2 Upload Functions
// ============================================

export const r2Upload = {
  // Upload single file to R2
  async uploadFile(
    file: File,
    options: {
      folder?: string;
      themeId?: number;
      themeLocalId?: string;
      assetType?: LocalThemeAsset["assetType"];
      onProgress?: UploadProgressCallback;
    } = {},
  ): Promise<UploadResult> {
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const {
      folder = "theme-assets",
      themeId = 0,
      themeLocalId = "",
      assetType = "background",
      onProgress,
    } = options;

    const fileName = generateFileName(file, assetType);
    const key = `${folder}/${fileName}`;

    try {
      // Use FormData for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);
      formData.append("assetType", assetType);
      if (themeId) formData.append("themeId", themeId.toString());
      if (themeLocalId) formData.append("themeLocalId", themeLocalId);

      // Upload to server (which will forward to R2)
      const response = await uploadWithProgress(
        `${API_BASE_URL}/upload`,
        formData,
        onProgress,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();

      // Save to local database - server already has the record, so we use upsert
      // to mark it as synced immediately and avoid redundant sync triggers.
      const localId = result.localId || generateLocalId();
      await themeAssetsLocal.upsert({
        localId,
        themeId,
        themeLocalId,
        assetType,
        fileUrl: result.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        position: "center",
        zIndex: 0,
        opacity: 1,
        isActive: true,
        displayOrder: 0,
        syncStatus: "synced",
        updatedAt: now(),
        syncedAt: now(),
        remoteId: result.id,
      });

      // Cache the blob locally
      await themeAssetsLocal.cacheBlob(localId, file);

      return {
        success: true,
        url: result.url,
        key: result.key,
        localId,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  },

  // Upload multiple files
  async uploadFiles(
    files: File[],
    options: {
      folder?: string;
      themeId?: number;
      themeLocalId?: string;
      assetType?: LocalThemeAsset["assetType"];
      onProgress?: (fileIndex: number, progress: number) => void;
    } = {},
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(files[i], {
        ...options,
        onProgress: (progress) => options.onProgress?.(i, progress),
      });
      results.push(result);
    }

    return results;
  },

  // Delete file from R2
  async deleteFile(
    key: string,
    localId?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/upload/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      // Remove from local database if localId provided
      if (localId) {
        await themeAssetsLocal.delete(localId);
      }

      return { success: true };
    } catch (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  },

  // Get presigned URL for direct upload (if needed)
  async getPresignedUrl(
    fileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, contentType }),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Presign error:", error);
      return null;
    }
  },

  // List uploaded assets
  async listAssets(
    options: {
      folder?: string;
      assetType?: string;
    } = {},
  ): Promise<
    { key: string; url: string; size: number; lastModified: string }[]
  > {
    try {
      const params = new URLSearchParams();
      if (options.folder) params.append("folder", options.folder);
      if (options.assetType) params.append("assetType", options.assetType);

      const response = await fetch(
        `${API_BASE_URL}/upload?${params.toString()}`,
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("List assets error:", error);
      return [];
    }
  },
};

// ============================================
// Upload with progress tracking
// ============================================
async function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress?: UploadProgressCallback,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      resolve(
        new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: {
            "Content-Type":
              xhr.getResponseHeader("Content-Type") || "application/json",
          },
        }),
      );
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.send(formData);
  });
}

// ============================================
// Image processing utilities
// ============================================
export const imageUtils = {
  // Resize image before upload
  async resizeImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.85,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          file.type === "image/png" ? "image/png" : "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  },

  // Create thumbnail
  async createThumbnail(file: File, size: number = 200): Promise<Blob> {
    return this.resizeImage(file, size, size, 0.7);
  },

  // Get image dimensions
  async getImageDimensions(
    file: File,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  },

  // Convert to WebP (if supported)
  async convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              // Fallback to original
              resolve(file);
            }
          },
          "image/webp",
          quality,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  },
};

// ============================================
// Offline-first upload queue
// ============================================
interface PendingUpload {
  id: string;
  file: File;
  options: {
    folder?: string;
    themeId?: number;
    themeLocalId?: string;
    assetType?: LocalThemeAsset["assetType"];
  };
  createdAt: number;
  retryCount: number;
}

const pendingUploads: PendingUpload[] = [];

export const uploadQueue = {
  // Add to queue (for offline support)
  add(file: File, options: PendingUpload["options"]): string {
    const id = generateLocalId();
    pendingUploads.push({
      id,
      file,
      options,
      createdAt: now(),
      retryCount: 0,
    });
    return id;
  },

  // Process queue when online
  async processQueue(
    onProgress?: (id: string, progress: number) => void,
  ): Promise<Map<string, UploadResult>> {
    const results = new Map<string, UploadResult>();

    for (const pending of [...pendingUploads]) {
      const result = await r2Upload.uploadFile(pending.file, {
        ...pending.options,
        onProgress: (progress) => onProgress?.(pending.id, progress),
      });

      results.set(pending.id, result);

      if (result.success) {
        // Remove from queue on success
        const index = pendingUploads.findIndex((p) => p.id === pending.id);
        if (index > -1) {
          pendingUploads.splice(index, 1);
        }
      } else {
        // Increment retry count
        pending.retryCount++;
      }
    }

    return results;
  },

  // Get pending count
  getPendingCount(): number {
    return pendingUploads.length;
  },

  // Clear queue
  clear(): void {
    pendingUploads.length = 0;
  },
};

export default r2Upload;
