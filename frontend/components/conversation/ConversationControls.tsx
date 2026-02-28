"use client";

import { useState, useEffect } from "react";
import { Square, Clock } from "lucide-react";

interface ConversationControlsProps {
  isActive: boolean;
  onEndSession: () => void;
}

export function ConversationControls({
  isActive,
  onEndSession,
}: ConversationControlsProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Clock className="h-4 w-4" />
        <span className="font-mono">{formatTime(elapsed)}</span>
        {isActive && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Active</span>
          </span>
        )}
      </div>

      <button
        onClick={onEndSession}
        disabled={!isActive}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Square className="h-3 w-3" />
        End Session
      </button>
    </div>
  );
}
