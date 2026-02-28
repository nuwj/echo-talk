"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, Mic, Theater } from "lucide-react";
import api from "@/lib/api";
import type { SessionSummary } from "@/lib/types";
import DailyProgress from "@/components/learning/DailyProgress";
import SkillTree from "@/components/learning/SkillTree";

const modes = [
  {
    title: "Conversation",
    description: "Free-form English conversation with your AI coach",
    icon: MessageSquare,
    href: "/practice/conversation",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    title: "Pronunciation",
    description: "Focused drills to improve your pronunciation accuracy",
    icon: Mic,
    href: "/practice/pronunciation",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    title: "Scenarios",
    description: "Practice real-world situations like interviews and travel",
    icon: Theater,
    href: "/practice/scenarios",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
];

export default function PracticeDashboard() {
  const [recentSessions, setRecentSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    api
      .get<SessionSummary[]>("/sessions")
      .then((res) => setRecentSessions(res.data.slice(0, 5)));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      {/* Practice modes */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Start Practicing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className={`border rounded-lg p-5 hover:shadow-md transition-shadow ${mode.color}`}
              >
                <Icon className="h-8 w-8 mb-3" />
                <h3 className="font-semibold text-base mb-1">{mode.title}</h3>
                <p className="text-sm opacity-80">{mode.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily progress */}
        <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
            Today&apos;s Progress
          </h3>
          <DailyProgress />
        </section>

        {/* Skill overview */}
        <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
            Skill Overview
          </h3>
          <SkillTree />
        </section>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recent Sessions
            </h3>
            <Link
              href="/practice/history"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)]">
            {recentSessions.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  i > 0 ? "border-t border-[var(--border)]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s.status === "active" ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  <span className="capitalize text-[var(--foreground)]">
                    {s.mode}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[var(--muted-foreground)] text-xs">
                  <span>{s.message_count} turns</span>
                  <span>
                    {new Date(s.started_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
