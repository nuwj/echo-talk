"use client";

import { useEffect, useState } from "react";
import { useConversationStore } from "@/lib/store";
import { AvatarDisplay } from "@/components/conversation/AvatarDisplay";
import { TranscriptPanel } from "@/components/conversation/TranscriptPanel";
import { VoiceInterface } from "@/components/conversation/VoiceInterface";
import { ConversationControls } from "@/components/conversation/ConversationControls";
import type { AvatarStatus } from "@/lib/types";

export default function ConversationPage() {
  const {
    sessionId,
    transcripts,
    status,
    isLoading,
    startSession,
    sendMessage,
    endSession,
    reset,
  } = useConversationStore();

  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    // Start a new session when page loads
    startSession();
    setSessionEnded(false);
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = async () => {
    await endSession();
    setSessionEnded(true);
  };

  const handleNewSession = () => {
    reset();
    startSession();
    setSessionEnded(false);
  };

  // Map conversation status to avatar status
  const getAvatarStatus = (): AvatarStatus => {
    if (status === "processing") return "thinking";
    if (status === "playing") return "speaking";
    if (status === "recording") return "listening";
    return "idle";
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationControls
        isActive={!!sessionId && !sessionEnded}
        onEndSession={handleEndSession}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Avatar */}
        <div className="w-72 flex-shrink-0 border-r border-[var(--border)] flex items-center justify-center bg-[var(--background)]">
          <AvatarDisplay status={getAvatarStatus()} />
        </div>

        {/* Right panel - Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TranscriptPanel transcripts={transcripts} isLoading={isLoading} />
        </div>
      </div>

      {/* Session ended overlay */}
      {sessionEnded ? (
        <div className="border-t border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Session ended. Great practice!
          </p>
          <button
            onClick={handleNewSession}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md text-sm hover:opacity-90 transition-opacity"
          >
            Start New Session
          </button>
        </div>
      ) : (
        <VoiceInterface
          status={status}
          onSendMessage={sendMessage}
          disabled={!sessionId}
        />
      )}
    </div>
  );
}
