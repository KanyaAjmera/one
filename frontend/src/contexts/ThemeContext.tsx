import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "default" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLightMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme-mode") as ThemeMode) || "default";
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
    if (mode === "default") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "default" : "light"));
  };

  const isLightMode = mode === "light";

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleTheme, isLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
