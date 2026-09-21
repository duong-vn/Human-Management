"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./Button";

export interface UseStatsVisibilityResult {
  showStats: boolean;
  toggleStats: () => void;
}

export interface StatsToggleProps {
  expanded: boolean;
  onToggle: () => void;
  controls: string;
  className?: string;
}

const warnedKeys = new Set<string>();

export function useStatsVisibility(storageKey: string): UseStatsVisibilityResult {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem(storageKey);
        if (saved === "false") {
          setShowStats(true);
        }
      }
    } catch {
      if (!warnedKeys.has(storageKey)) {
        warnedKeys.add(storageKey);
        console.warn(`[StatsVisibility] localStorage read failed for key "${storageKey}", using session state`);
      }
    }
  }, [storageKey]);

  const toggleStats = useCallback(() => {
    const next = !showStats;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(storageKey, String(!next));
      }
    } catch {
      if (!warnedKeys.has(storageKey)) {
        warnedKeys.add(storageKey);
        console.warn(`[StatsVisibility] localStorage write failed for key "${storageKey}", using session state`);
      }
    }
    setShowStats(next);
  }, [showStats, storageKey]);

  return { showStats, toggleStats };
}

export const StatsToggle: React.FC<StatsToggleProps> = ({
  expanded,
  onToggle,
  controls,
  className = "",
}) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      leftIcon={
        expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )
      }
      className={`text-slate-600 hover:text-slate-900 ${className}`}
    >
      {expanded ? "Thu gọn số liệu" : "Hiện số liệu"}
    </Button>
  );
};
