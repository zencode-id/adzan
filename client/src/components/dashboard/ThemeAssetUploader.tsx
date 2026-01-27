// ============================================
// Theme Asset Uploader Component
// For uploading backgrounds, ornaments, and other theme assets
// ============================================

import { useState, useRef, useCallback } from "react";
import {
  r2Upload,
  validateFile,
  imageUtils,
  type UploadResult,
} from "../../lib/r2Upload";
import type { LocalThemeAsset } from "../../lib/localDatabase";

interface ThemeAssetUploaderProps {
  themeId?: number;
  themeLocalId?: string;
  assetType?: LocalThemeAsset["assetType"];
  onUploadComplete?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export function ThemeAssetUploader({
  themeId = 0,
  themeLocalId = "",
  assetType = "background",
  onUploadComplete,
  onError,
  maxFiles = 5,
  acceptedTypes = "image/*",
}: ThemeAssetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<
    {
      id: string;
      file: File;
      progress: number;
      status: "pending" | "uploading" | "complete" | "error";
      result?: UploadResult;
      preview?: string;
    }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process single upload
  const processUpload = useCallback(
    async (id: string, file: File) => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  status: "error" as const,
                  result: { success: false, error: validation.error },
                }
              : u,
          ),
        );
        onError?.(validation.error || "Invalid file");
        return;
      }

      // Update to uploading status
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: "uploading" as const } : u,
        ),
      );

      // Optionally resize large images
      let fileToUpload: File | Blob = file;
      try {
        const dimensions = await imageUtils.getImageDimensions(file);
        if (dimensions.width > 1920 || dimensions.height > 1080) {
          fileToUpload = await imageUtils.resizeImage(file);
        }
      } catch {
        // Use original file if resize fails
      }

      // Upload
      const result = await r2Upload.uploadFile(
        fileToUpload instanceof Blob
          ? new File([fileToUpload], file.name, { type: file.type })
          : fileToUpload,
        {
          themeId,
          themeLocalId,
          assetType,
          onProgress: (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, progress } : u)),
            );
          },
        },
      );

      // Update status
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: result.success ? "complete" : "error",
                progress: result.success ? 100 : u.progress,
                result,
              }
            : u,
        ),
      );

      if (result.success) {
        onUploadComplete?.(result);
      } else {
        onError?.(result.error || "Upload failed");
      }
    },
    [themeId, themeLocalId, assetType, onUploadComplete, onError],
  );

  // Handle file selection
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).slice(0, maxFiles);

      // Create upload entries with previews
      const newUploads = await Promise.all(
        fileArray.map(async (file) => {
          const preview = URL.createObjectURL(file);
          return {
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: "pending" as const,
            preview,
          };
        }),
      );

      setUploads((prev) => [...prev, ...newUploads]);

      // Start uploading each file
      for (const upload of newUploads) {
        await processUpload(upload.id, upload.file);
      }
    },
    [maxFiles, processUpload],
  );

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove upload from list
  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((u) => u.id !== id);
    });
  };

  // Retry failed upload
  const retryUpload = async (id: string) => {
    const upload = uploads.find((u) => u.id === id);
    if (upload) {
      await processUpload(id, upload.file);
    }
  };

  // Get asset type label
  const getAssetTypeLabel = () => {
    switch (assetType) {
      case "background":
        return "Background";
      case "ornament":
        return "Ornament";
      case "icon":
        return "Icon";
      case "illustration":
        return "Illustration";
      default:
        return "Asset";
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={maxFiles > 1}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isDragging ? "bg-emerald-100" : "bg-slate-100"}
            `}
          >
            <span
              className={`
                material-symbols-outlined text-3xl
                ${isDragging ? "text-emerald-600" : "text-slate-400"}
              `}
            >
              {isDragging ? "file_download" : "cloud_upload"}
            </span>
          </div>

          <div>
            <p className="font-semibold text-emerald-950">
              {isDragging ? "Drop files here" : `Upload ${getAssetTypeLabel()}`}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Drag & drop atau klik untuk memilih file
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Max {maxFiles} files • JPG, PNG, WebP, GIF, SVG • Max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <UploadItem
              key={upload.id}
              upload={upload}
              onRemove={() => removeUpload(upload.id)}
              onRetry={() => retryUpload(upload.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Upload Item Component
// ============================================

interface UploadItemProps {
  upload: {
    id: string;
    file: File;
    progress: number;
    status: "pending" | "uploading" | "complete" | "error";
    result?: UploadResult;
    preview?: string;
  };
  onRemove: () => void;
  onRetry: () => void;
}

function UploadItem({ upload, onRemove, onRetry }: UploadItemProps) {
  const { file, progress, status, result, preview } = upload;

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all
        ${
          status === "error"
            ? "bg-red-50 border-red-200"
            : status === "complete"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-white border-slate-200"
        }
      `}
    >
      {/* Preview */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">
              image
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-emerald-950 truncate">{file.name}</p>
        <p className="text-xs text-slate-500">
          {(file.size / 1024).toFixed(1)} KB
        </p>

        {/* Progress Bar */}
        {status === "uploading" && (
          <div className="mt-2">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{progress}%</p>
          </div>
        )}

        {/* Error Message */}
        {status === "error" && result?.error && (
          <p className="text-xs text-red-600 mt-1">{result.error}</p>
        )}
      </div>

      {/* Status Icon / Actions */}
      <div className="flex items-center gap-2">
        {status === "uploading" && (
          <span className="material-symbols-outlined text-emerald-600 animate-spin">
            progress_activity
          </span>
        )}

        {status === "complete" && (
          <span className="material-symbols-outlined text-emerald-600">
            check_circle
          </span>
        )}

        {status === "error" && (
          <button
            onClick={onRetry}
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
            title="Retry"
          >
            <span className="material-symbols-outlined text-red-600">
              refresh
            </span>
          </button>
        )}

        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
          title="Remove"
        >
          <span className="material-symbols-outlined text-slate-400">
            close
          </span>
        </button>
      </div>
    </div>
  );
}

export default ThemeAssetUploader;
