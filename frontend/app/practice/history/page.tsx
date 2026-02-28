"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/api";
import type { Session, SessionSummary } from "@/lib/types";
import PronunciationFeedback from "@/components/pronunciation/PronunciationFeedback";

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "In progress";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<Session | null>(null);

  useEffect(() => {
    api
      .get<SessionSummary[]>("/sessions")
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedSession(null);
      return;
    }
    setExpandedId(id);
    setExpandedSession(null);
    try {
      const res = await api.get<Session>(`/sessions/${id}`);
      setExpandedSession(res.data);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-[var(--muted-foreground)] animate-pulse">
        Loading history...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
        Session History
      </h2>

      {sessions.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          No sessions yet. Start a conversation to see your history here.
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(s.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--secondary)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s.status === "active" ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  <span className="capitalize font-medium text-[var(--foreground)]">
                    {s.mode}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {formatDate(s.started_at)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {s.message_count} turns
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {formatDuration(s.started_at, s.ended_at)}
                  </span>
                  {expandedId === s.id ? (
                    <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                  )}
                </div>
              </button>

              {expandedId === s.id && (
                <div className="border-t border-[var(--border)] px-4 py-4 space-y-4">
                  {/* Transcript */}
                  {expandedSession ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {expandedSession.transcripts.map((t) => (
                        <div
                          key={t.id}
                          className={`text-sm px-3 py-2 rounded-lg ${
                            t.role === "user"
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)] ml-12"
                              : "bg-[var(--secondary)] text-[var(--secondary-foreground)] mr-12"
                          }`}
                        >
                          {t.content}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--muted-foreground)] animate-pulse">
                      Loading transcript...
                    </div>
                  )}

                  {/* Assessment */}
                  {s.status === "completed" && (
                    <div className="border-t border-[var(--border)] pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                        Assessment
                      </p>
                      <PronunciationFeedback sessionId={s.id} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
