// ============================================
// Theme Asset Gallery Component
// For displaying and managing uploaded theme assets
// ============================================

import { useState, useEffect, useCallback } from "react";
import {
  themeAssetsLocal,
  type LocalThemeAsset,
} from "../../lib/localDatabase";
import { r2Upload } from "../../lib/r2Upload";
import { ThemeAssetUploader } from "./ThemeAssetUploader";

interface ThemeAssetGalleryProps {
  themeId?: number;
  themeLocalId?: string;
  onAssetSelect?: (asset: LocalThemeAsset) => void;
  selectedAssetId?: string;
}

export function ThemeAssetGallery({
  themeId,
  themeLocalId,
  onAssetSelect,
  selectedAssetId,
}: ThemeAssetGalleryProps) {
  const [assets, setAssets] = useState<LocalThemeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<LocalThemeAsset["assetType"]>("background");
  const [showUploader, setShowUploader] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load assets
  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      let loadedAssets: LocalThemeAsset[];
      if (themeLocalId) {
        loadedAssets = await themeAssetsLocal.getByTheme(themeLocalId);
        loadedAssets = loadedAssets.filter((a) => a.assetType === activeTab);
      } else {
        loadedAssets = await themeAssetsLocal.getByType(activeTab);
      }
      setAssets(loadedAssets);
    } catch (error) {
      console.error("Failed to load assets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [themeLocalId, activeTab]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleDelete = async (asset: LocalThemeAsset) => {
    try {
      // Delete from R2 if synced
      if (asset.fileUrl) {
        const key = asset.fileUrl.split("/").pop();
        if (key) {
          await r2Upload.deleteFile(`theme-assets/${key}`, asset.localId);
        }
      } else {
        await themeAssetsLocal.delete(asset.localId);
      }
      loadAssets();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  const handleToggleActive = async (asset: LocalThemeAsset) => {
    try {
      await themeAssetsLocal.update(asset.localId, {
        isActive: !asset.isActive,
      });
      loadAssets();
    } catch (error) {
      console.error("Failed to toggle asset:", error);
    }
  };

  const assetTypes: {
    type: LocalThemeAsset["assetType"];
    label: string;
    icon: string;
  }[] = [
    { type: "background", label: "Background", icon: "wallpaper" },
    { type: "ornament", label: "Ornament", icon: "interests" },
    { type: "icon", label: "Icon", icon: "emoji_symbols" },
    { type: "illustration", label: "Ilustrasi", icon: "draw" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-emerald-950 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">
            perm_media
          </span>
          Asset Library
        </h3>
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
        >
          <span className="material-symbols-outlined text-sm">
            {showUploader ? "close" : "add"}
          </span>
          {showUploader ? "Tutup" : "Upload"}
        </button>
      </div>

      {/* Uploader */}
      {showUploader && (
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <ThemeAssetUploader
            themeId={themeId}
            themeLocalId={themeLocalId}
            assetType={activeTab}
            onUploadComplete={() => {
              loadAssets();
            }}
            onError={(error) => {
              console.error("Upload error:", error);
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-6">
        {assetTypes.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
              ${
                activeTab === tab.type
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
            `}
          >
            <span className="material-symbols-outlined text-sm">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">
              progress_activity
            </span>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
              perm_media
            </span>
            <p className="text-slate-500">Belum ada {activeTab}</p>
            <p className="text-sm text-slate-400 mt-1">
              Upload gambar untuk menambahkan ke library
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.localId}
                asset={asset}
                isSelected={selectedAssetId === asset.localId}
                onSelect={() => onAssetSelect?.(asset)}
                onToggleActive={() => handleToggleActive(asset)}
                onDelete={() => setDeleteConfirm(asset.localId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-red-600">
                  delete
                </span>
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                Hapus Asset?
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Asset akan dihapus secara permanen dari library dan storage.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const asset = assets.find(
                      (a) => a.localId === deleteConfirm,
                    );
                    if (asset) handleDelete(asset);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Asset Card Component
// ============================================

interface AssetCardProps {
  asset: LocalThemeAsset;
  isSelected: boolean;
  onSelect: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

function AssetCard({
  asset,
  isSelected,
  onSelect,
  onToggleActive,
  onDelete,
}: AssetCardProps) {
  const [imageUrl, setImageUrl] = useState<string>(asset.fileUrl);

  // Get cached blob URL if available
  useEffect(() => {
    const loadCachedUrl = async () => {
      try {
        const url = await themeAssetsLocal.getBlobUrl(asset);
        setImageUrl(url);
      } catch {
        setImageUrl(asset.fileUrl);
      }
    };
    loadCachedUrl();
  }, [asset]);

  return (
    <div
      onClick={onSelect}
      className={`
        relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all
        ${
          isSelected
            ? "border-emerald-500 ring-4 ring-emerald-500/20"
            : "border-slate-200 hover:border-slate-300"
        }
        ${!asset.isActive ? "opacity-50" : ""}
      `}
    >
      {/* Image */}
      <div className="aspect-square bg-slate-100">
        <img
          src={imageUrl}
          alt={asset.fileName || "Asset"}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = asset.fileUrl;
          }}
        />
      </div>

      {/* Overlay on Hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive();
          }}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          title={asset.isActive ? "Nonaktifkan" : "Aktifkan"}
        >
          <span className="material-symbols-outlined text-white text-sm">
            {asset.isActive ? "visibility_off" : "visibility"}
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 bg-white/20 rounded-lg hover:bg-red-500/50 transition-colors"
          title="Hapus"
        >
          <span className="material-symbols-outlined text-white text-sm">
            delete
          </span>
        </button>
      </div>

      {/* Status Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {asset.syncStatus === "pending" && (
          <span className="px-1.5 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded">
            PENDING
          </span>
        )}
        {!asset.isActive && (
          <span className="px-1.5 py-0.5 bg-slate-500 text-white text-[10px] font-bold rounded">
            INACTIVE
          </span>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <span className="material-symbols-outlined text-emerald-500 text-xl bg-white rounded-full">
            check_circle
          </span>
        </div>
      )}

      {/* File Info */}
      <div className="p-2 bg-white">
        <p className="text-xs text-slate-600 truncate">
          {asset.fileName || "Unnamed"}
        </p>
        {asset.fileSize && (
          <p className="text-[10px] text-slate-400">
            {(asset.fileSize / 1024).toFixed(1)} KB
          </p>
        )}
      </div>
    </div>
  );
}

export default ThemeAssetGallery;
