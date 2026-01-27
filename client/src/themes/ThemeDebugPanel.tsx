// ============================================
// Theme Debug Panel
// For debugging and monitoring theme resolution
// ============================================

import { useAutoTheme } from "./useThemeHooks";
import type { ThemeConfig } from "./types";

interface ThemeDebugPanelProps {
  show?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function ThemeDebugPanel({
  show = true,
  position = "bottom-right",
}: ThemeDebugPanelProps) {
  const {
    currentTheme,
    previousTheme,
    isTransitioning,
    schedules,
    scheduleEvaluations,
    nextChange,
    enableAutoResolve,
    setEnableAutoResolve,
    resolveNow,
  } = useAutoTheme();

  if (!show) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 16, left: 16 },
    "top-right": { top: 16, right: 16 },
    "bottom-left": { bottom: 16, left: 16 },
    "bottom-right": { bottom: 16, right: 16 },
  };

  return (
    <div
      style={{
        position: "fixed",
        ...positionStyles[position],
        zIndex: 9999,
        width: 320,
        maxHeight: "80vh",
        overflow: "auto",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "#fff",
        borderRadius: 12,
        padding: 16,
        fontSize: 12,
        fontFamily: "monospace",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: 14 }}>🎨 Theme Debug</span>
        <button
          onClick={() => setEnableAutoResolve(!enableAutoResolve)}
          style={{
            padding: "4px 8px",
            backgroundColor: enableAutoResolve ? "#10b981" : "#6b7280",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer",
            fontSize: 10,
          }}
        >
          {enableAutoResolve ? "AUTO ON" : "AUTO OFF"}
        </button>
      </div>

      {/* Current Theme */}
      <Section title="Current Theme">
        <ThemePreview theme={currentTheme} />
        {isTransitioning && (
          <div style={{ color: "#fbbf24", marginTop: 4 }}>
            ⏳ Transitioning from {previousTheme?.name}...
          </div>
        )}
      </Section>

      {/* Next Change */}
      {nextChange && (
        <Section title="Next Change">
          <div>
            <strong>{nextChange.theme.name}</strong>
          </div>
          <div style={{ color: "#9ca3af" }}>
            At: {nextChange.changeAt.toLocaleTimeString()}
          </div>
          <div style={{ color: "#9ca3af" }}>
            Type: {nextChange.schedule.scheduleType}
          </div>
        </Section>
      )}

      {/* Schedules */}
      <Section title={`Schedules (${schedules.length})`}>
        {scheduleEvaluations.length > 0 ? (
          scheduleEvaluations.map((eval_, idx) => (
            <div
              key={idx}
              style={{
                padding: 8,
                backgroundColor: eval_.matches
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(107, 114, 128, 0.2)",
                borderRadius: 6,
                marginBottom: 4,
                borderLeft: `3px solid ${eval_.matches ? "#10b981" : "#6b7280"}`,
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {eval_.matches ? "✓" : "✗"} {eval_.theme?.name || "Unknown"}
              </div>
              <div style={{ color: "#9ca3af", fontSize: 10 }}>
                {eval_.schedule.scheduleType}: {eval_.reason}
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#9ca3af" }}>No schedules defined</div>
        )}
      </Section>

      {/* Actions */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={resolveNow}
          style={{
            flex: 1,
            padding: 8,
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Resolve Now
        </button>
      </div>
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10,
          color: "#9ca3af",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ThemePreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 8,
        backgroundColor: theme.colors.bg,
        borderRadius: 8,
      }}
    >
      {/* Color swatches */}
      <div style={{ display: "flex", gap: 2 }}>
        {[
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.accent,
        ].map((color, idx) => (
          <div
            key={idx}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
      <div>
        <div style={{ fontWeight: "bold", color: theme.colors.text }}>
          {theme.name}
        </div>
        <div style={{ fontSize: 10, color: theme.colors.textMuted }}>
          {theme.id}
        </div>
      </div>
    </div>
  );
}

export default ThemeDebugPanel;
