// ============================================
// Ornament Layer Component
// ============================================

import type { ThemeConfig } from "../types";

interface OrnamentLayerProps {
  theme: ThemeConfig;
}

export function OrnamentLayer({ theme }: OrnamentLayerProps) {
  const { ornaments, colors } = theme;

  if (!ornaments.show || ornaments.style === "none") {
    return null;
  }

  // Pattern class based on ornament style
  const getPatternClass = (): string => {
    switch (ornaments.style) {
      case "islamic":
        return "islamic-pattern";
      case "geometric":
        return "geometric-pattern";
      case "floral":
        return "floral-pattern";
      case "minimal":
        return "minimal-pattern";
      default:
        return "";
    }
  };

  // Get position style for ornament items
  const getPositionStyle = (position: string): React.CSSProperties => {
    switch (position) {
      case "top-left":
        return { top: "2rem", left: "2rem" };
      case "top-right":
        return { top: "2rem", right: "2rem" };
      case "bottom-left":
        return { bottom: "2rem", left: "2rem" };
      case "bottom-right":
        return { bottom: "2rem", right: "2rem" };
      case "center":
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
      default:
        return {};
    }
  };

  // Get animation class
  const getAnimationClass = (animation?: string): string => {
    switch (animation) {
      case "float":
        return "animate-float";
      case "pulse":
        return "animate-pulse";
      case "rotate":
        return "animate-spin-slow";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Pattern overlay */}
      <div
        className={`absolute inset-0 ${getPatternClass()} pointer-events-none`}
        style={{ opacity: ornaments.opacity }}
      />

      {/* Individual ornament items */}
      {ornaments.items?.map((item, index) => (
        <div
          key={index}
          className={`absolute pointer-events-none ${getAnimationClass(item.animation)}`}
          style={{
            ...getPositionStyle(item.position),
            width: item.width,
            height: item.height,
            opacity: item.opacity ?? ornaments.opacity,
          }}
        >
          <img
            src={item.url}
            alt=""
            className="w-full h-full object-contain"
            style={{
              filter: `drop-shadow(0 0 20px ${colors.primary}40)`,
            }}
          />
        </div>
      ))}
    </>
  );
}

export default OrnamentLayer;
