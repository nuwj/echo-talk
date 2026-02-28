"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationStatus } from "@/lib/types";

interface VoiceInterfaceProps {
  status: ConversationStatus;
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInterface({
  status,
  onSendMessage,
  disabled = false,
}: VoiceInterfaceProps) {
  const [text, setText] = useState("");
  const [micActive, setMicActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "idle" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || status === "processing") return;
    onSendMessage(trimmed);
    setText("");
  };

  const toggleMic = () => {
    // Phase 1: visual-only mic toggle (no real recording)
    setMicActive(!micActive);
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--card)] p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Mic button (visual only in Phase 1) */}
        <button
          type="button"
          onClick={toggleMic}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
            micActive
              ? "bg-red-500 text-white animate-pulse"
              : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={micActive ? "Stop recording (coming soon)" : "Start recording (coming soon)"}
        >
          {micActive ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled || status === "processing"}
          placeholder={
            status === "processing"
              ? "AI is thinking..."
              : "Type your message in English..."
          }
          className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-full bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled || status === "processing"}
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
            text.trim() && !disabled && status !== "processing"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
              : "bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Mic status hint */}
      {micActive && (
        <p className="text-xs text-center text-[var(--muted-foreground)] mt-2">
          Voice recording will be available in Phase 2. Please type your message for now.
        </p>
      )}
    </div>
  );
}
