import { useState, useEffect } from "react";

type ViewMode = "grid" | "list";

export const useViewPreference = (key: string, defaultValue: ViewMode = "grid") => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultValue);

  // Load view preference from localStorage on component mount
  useEffect(() => {
    const savedView = localStorage.getItem(key);
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
  }, [key]);

  // Save view preference to localStorage when it changes
  const setView = (view: ViewMode) => {
    setViewMode(view);
    localStorage.setItem(key, view);
  };

  return [viewMode, setView] as const;
};
