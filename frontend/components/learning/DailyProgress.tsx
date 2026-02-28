"use client";

import { useEffect, useState } from "react";
import type { SessionSummary } from "@/lib/types";
import api from "@/lib/api";

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "—";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyProgress() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<SessionSummary[]>("/sessions")
      .then((res) => setSessions(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading progress...</div>;
  }

  const today = todayISO();
  const todaySessions = sessions.filter(
    (s) => s.started_at.slice(0, 10) === today && s.status === "completed"
  );

  const totalTurns = todaySessions.reduce((sum, s) => sum + (s.message_count ?? 0), 0);
  const DAILY_TURNS_GOAL = 20;
  const pct = Math.min(100, Math.round((totalTurns / DAILY_TURNS_GOAL) * 100));

  return (
    <div className="space-y-4">
      {/* Daily goal */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 font-medium">Today&apos;s goal</span>
          <span className="text-gray-500">
            {totalTurns} / {DAILY_TURNS_GOAL} turns
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 100 ? "bg-green-500" : "bg-blue-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct >= 100 && (
          <p className="text-xs text-green-600 font-medium mt-1">Goal reached!</p>
        )}
      </div>

      {/* Session list */}
      {todaySessions.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No sessions completed today.</p>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Sessions today
          </p>
          <ul className="space-y-1">
            {todaySessions.map((s) => (
              <li
                key={s.id}
                className="flex justify-between text-sm bg-gray-50 rounded px-3 py-1.5"
              >
                <span className="capitalize text-gray-700">{s.mode} practice</span>
                <div className="flex gap-4 text-gray-500 text-xs items-center">
                  <span>{s.message_count} turns</span>
                  <span>{formatDuration(s.started_at, s.ended_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
