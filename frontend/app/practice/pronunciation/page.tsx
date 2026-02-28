"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { SessionSummary } from "@/lib/types";
import PronunciationFeedback from "@/components/pronunciation/PronunciationFeedback";

export default function PronunciationPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SessionSummary[]>("/sessions")
      .then((res) => {
        const completed = res.data.filter((s) => s.status === "completed");
        setSessions(completed);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-[var(--muted-foreground)] animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Pronunciation Assessment
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Review pronunciation feedback from your completed sessions
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Complete a conversation session to see pronunciation analysis here.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
              Sessions
            </p>
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left border rounded-lg px-4 py-3 text-sm transition-colors ${
                  selectedId === s.id
                    ? "border-[var(--primary)] bg-blue-50"
                    : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium text-[var(--foreground)]">
                    {s.mode}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {s.message_count} turns
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {new Date(s.started_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </button>
            ))}
          </div>

          {/* Assessment detail */}
          <div className="lg:col-span-2 border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
            {selectedId ? (
              <PronunciationFeedback sessionId={selectedId} />
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Select a session to view its pronunciation assessment.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
