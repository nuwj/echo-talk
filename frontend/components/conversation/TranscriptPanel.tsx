"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[];
  isLoading: boolean;
}

export function TranscriptPanel({ transcripts, isLoading }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, isLoading]);

  if (transcripts.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
        <div className="text-center">
          <p className="text-lg font-medium">Start a conversation</p>
          <p className="text-sm mt-1">Type a message below to begin practicing</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {transcripts.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "flex",
            entry.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              entry.role === "user"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-md"
                : "bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-bl-md"
            )}
          >
            <p>{entry.content}</p>
            <p
              className={cn(
                "text-[10px] mt-1",
                entry.role === "user"
                  ? "text-blue-200"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[var(--secondary)] rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-[bounce_1s_infinite]" />
              <div
                className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-[bounce_1s_infinite]"
                style={{ animationDelay: "0.15s" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-[bounce_1s_infinite]"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
