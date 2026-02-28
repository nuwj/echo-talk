"use client";

import { useEffect, useState } from "react";
import { useConversationStore } from "@/lib/store";
import { AvatarDisplay } from "@/components/conversation/AvatarDisplay";
import { TranscriptPanel } from "@/components/conversation/TranscriptPanel";
import { VoiceInterface } from "@/components/conversation/VoiceInterface";
import { ConversationControls } from "@/components/conversation/ConversationControls";
import PronunciationFeedback from "@/components/pronunciation/PronunciationFeedback";
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
  const [endedSessionId, setEndedSessionId] = useState<string | null>(null);

  useEffect(() => {
    startSession();
    setSessionEnded(false);
    setEndedSessionId(null);
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndSession = async () => {
    const currentId = sessionId;
    await endSession();
    setSessionEnded(true);
    setEndedSessionId(currentId);
  };

  const handleNewSession = () => {
    reset();
    startSession();
    setSessionEnded(false);
    setEndedSessionId(null);
  };

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

      {/* Session ended: show assessment results */}
      {sessionEnded ? (
        <div className="border-t border-[var(--border)] bg-[var(--card)] p-5 overflow-y-auto max-h-64">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Session Review
            </h3>
            {endedSessionId && (
              <PronunciationFeedback sessionId={endedSessionId} />
            )}
            <div className="pt-2">
              <button
                onClick={handleNewSession}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md text-sm hover:opacity-90 transition-opacity"
              >
                Start New Session
              </button>
            </div>
          </div>
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
