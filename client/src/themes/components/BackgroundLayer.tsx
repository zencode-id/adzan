// ============================================
// Background Layer Component
// ============================================

import type { ThemeConfig } from "../types";

interface BackgroundLayerProps {
  theme: ThemeConfig;
}

export function BackgroundLayer({ theme }: BackgroundLayerProps) {
  const { background, colors } = theme;

  // Generate background style
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (background.type) {
      case "solid":
        return { backgroundColor: background.value };

      case "gradient":
        return { background: background.value };

      case "image":
        return {
          backgroundImage: `url(${background.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        };

      default:
        return { backgroundColor: colors.bg };
    }
  };

  return (
    <>
      {/* Main Background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={getBackgroundStyle()}
      />

      {/* Overlay for image backgrounds */}
      {background.type === "image" && background.overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: background.overlay,
            opacity: background.overlayOpacity ?? 0.5,
          }}
        />
      )}

      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] transform translate-x-1/2 -translate-y-1/2 opacity-20"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px] transform -translate-x-1/2 translate-y-1/2 opacity-15"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
    </>
  );
}

export default BackgroundLayer;
