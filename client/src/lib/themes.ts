export interface Theme {
  id: string;
  name: string;
  colors: {
    bg: string;
    fg: string;
    card: string;
    primary: string;
    accent: string;
    border: string;
  };
  pattern: string;
}

export const themes: Theme[] = [
  {
    id: "emerald",
    name: "Classic Emerald",
    colors: {
      bg: "#064e3b", // emerald-950
      fg: "#f8fafc", // slate-50
      card: "rgba(6, 78, 59, 0.4)",
      primary: "#d4af37", // primary-gold
      accent: "#10b981", // emerald-500
      border: "rgba(255, 255, 255, 0.1)",
    },
    pattern: "islamic-pattern",
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    colors: {
      bg: "#0f172a", // slate-900
      fg: "#f8fafc",
      card: "rgba(15, 23, 42, 0.4)",
      primary: "#38bdf8", // sky-400
      accent: "#818cf8", // indigo-400
      border: "rgba(255, 255, 255, 0.1)",
    },
    pattern: "midnight-pattern",
  },
  {
    id: "sunset",
    name: "Sunset Gold",
    colors: {
      bg: "#451a03", // orange-950
      fg: "#fff7ed", // orange-50
      card: "rgba(69, 26, 3, 0.4)",
      primary: "#f59e0b", // amber-500
      accent: "#f97316", // orange-500
      border: "rgba(255, 255, 255, 0.1)",
    },
    pattern: "sunset-pattern",
  },
  {
    id: "ocean",
    name: "Ocean Deep",
    colors: {
      bg: "#1e3a8a", // blue-900
      fg: "#f0f9ff", // blue-50
      card: "rgba(30, 58, 138, 0.4)",
      primary: "#22d3ee", // cyan-400
      accent: "#3b82f6", // blue-500
      border: "rgba(255, 255, 255, 0.1)",
    },
    pattern: "ocean-pattern",
  },
];

export const getThemeById = (id: string = "emerald"): Theme => {
  return themes.find((t) => t.id === id) || themes[0];
};
