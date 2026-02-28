"use client";

import type { AvatarStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AvatarDisplayProps {
  status: AvatarStatus;
}

export function AvatarDisplay({ status }: AvatarDisplayProps) {
  const statusLabels: Record<AvatarStatus, string> = {
    idle: "Ready to chat",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Avatar circle */}
      <div className="relative">
        <div
          className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-all duration-500",
            status === "speaking" && "animate-pulse shadow-blue-300 shadow-xl",
            status === "thinking" && "animate-[spin_3s_linear_infinite] opacity-80",
            status === "listening" && "ring-4 ring-blue-300 ring-opacity-50 animate-[pulse_1.5s_ease-in-out_infinite]"
          )}
        >
          AI
        </div>

        {/* Status indicator dot */}
        <div
          className={cn(
            "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white",
            status === "idle" && "bg-green-400",
            status === "listening" && "bg-yellow-400 animate-pulse",
            status === "thinking" && "bg-orange-400 animate-pulse",
            status === "speaking" && "bg-blue-400 animate-pulse"
          )}
        />
      </div>

      {/* Status text */}
      <div className="text-sm text-[var(--muted-foreground)] font-medium">
        {statusLabels[status]}
      </div>

      {/* Sound wave animation for speaking */}
      {status === "speaking" && (
        <div className="flex items-end gap-1 h-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[var(--primary)] rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${8 + Math.random() * 16}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
