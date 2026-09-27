"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ThemeToggle() {
  const mountedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    mountedRef.current = true;
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-8 h-8 rounded-md bg-bg-card border border-border-color shrink-0" />
    );
  }

  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 rounded-md bg-bg-card hover:bg-bg-secondary border border-border-color transition-colors flex items-center justify-center cursor-pointer shrink-0 group"
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      type="button"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}
