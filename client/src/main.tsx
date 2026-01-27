import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemedDisplay, AutoThemeProvider } from "./themes";

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || "#/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Route to display screen
  if (currentPath === "#/display") {
    return <ThemedDisplay />;
  }

  // Default: Dashboard
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AutoThemeProvider defaultThemeId="emerald">
      <Router />
    </AutoThemeProvider>
  </StrictMode>,
);
