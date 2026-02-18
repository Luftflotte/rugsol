"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ThemeToggle() {
  // Use ref to track mount state without triggering setState in effect
  const mountedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="p-2 rounded-lg bg-bg-secondary w-9 h-9" />
    );
  }

  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-bg-secondary hover:opacity-80 transition-colors"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-text-primary" />
      ) : (
        <Moon className="w-5 h-5 text-text-primary" />
      )}
    </button>
  );
}
