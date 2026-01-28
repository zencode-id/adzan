// ============================================
// R2 Upload Service
// Cloudflare R2 integration for theme assets
// ============================================

import imageCompression from "browser-image-compression";
import { themeAssetsLocal, generateLocalId, now } from "./localDatabase";
import type { LocalThemeAsset } from "./localDatabase";

// Constants
const API_BASE_URL =
  (
    import.meta.env.VITE_API_URL ||
    "https://mosque-display-api.adzan.workers.dev"
  ).replace(/\/$/, "") + "/api";

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  localId?: string;
  error?: string;
}

export interface RemoteFile {
  key: string;
  size: number;
  uploaded: string;
  httpMetadata?: {
    contentType?: string;
  };
  url?: string;
}

// ============================================
// File Validation Utilities
// ============================================
export const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
  ];

  if (file.size > maxSize) {
    return { valid: false, error: "File too large (max 10MB)" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Tipe file tidak didukung" };
  }

  return { valid: true };
};

// ============================================
// Image Processing Utilities
// ============================================
export const imageUtils = {
  // Get image dimensions
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  },

  // Resize image using canvas (fallback if browser-image-compression fails)
  resizeImage(
    file: File,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          file.type,
          quality,
        );
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  },
};

// ============================================
// XMLHttpRequest wrapper with progress support
// ============================================
function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.responseType = "text"; // Change to text for manual parsing or Response creation
    xhr.timeout = 60000; // 60s timeout

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      // Create a proper Response object from XHR result
      const options = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers({
          "Content-Type":
            xhr.getResponseHeader("Content-Type") || "application/json",
        }),
      };

      const response = new Response(xhr.responseText, options);
      resolve(response);
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out after 60s"));

    xhr.send(formData);
  });
}

// ============================================
// Main Upload Service
// ============================================
export const r2Upload = {
  // Upload a single file to R2 via worker
  async uploadFile(
    file: File,
    options: {
      folder?: string;
      themeId?: number;
      themeLocalId?: string;
      assetType?: LocalThemeAsset["assetType"];
      onProgress?: (progress: number) => void;
      compress?: boolean;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {},
  ): Promise<UploadResult> {
    try {
      const {
        folder = "theme-assets",
        themeId = 0,
        themeLocalId = "",
        assetType = "background",
        onProgress,
        compress = true, // Default: compress images
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85,
      } = options;

      // Compress image if enabled and file is an image
      let fileToUpload: File | Blob = file;
      if (
        compress &&
        file.type.startsWith("image/") &&
        !file.type.includes("gif")
      ) {
        try {
          console.log(
            `Compressing image: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
          );

          // Use browser-image-compression library
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1, // Max file size in MB
            maxWidthOrHeight: Math.max(maxWidth, maxHeight),
            useWebWorker: true,
            fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
            initialQuality: quality,
          });

          // Only use compressed version if it's smaller
          if (compressedFile.size < file.size) {
            fileToUpload = compressedFile;
            console.log(
              `Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`,
            );
          }
        } catch (e) {
          console.warn("Compression failed, using original file:", e);
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload, file.name);
      formData.append("folder", folder);

      if (themeId) formData.append("themeId", themeId.toString());
      if (themeLocalId) formData.append("themeLocalId", themeLocalId);
      if (assetType) formData.append("assetType", assetType);

      // Use XHR for progress support
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
      if (localId && localId !== "manual-delete") {
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

  // List all files from R2
  async listFiles(
    limit = 100,
  ): Promise<{ success: boolean; files?: RemoteFile[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/files?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      return { success: true, files: data.files };
    } catch (error) {
      console.error("List files error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch files",
      };
    }
  },

  // List uploaded assets (legacy/specific)
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

      return await response.json();
    } catch (error) {
      console.error("List assets error:", error);
      return [];
    }
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
