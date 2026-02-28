"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SkillTree from "@/components/learning/SkillTree";

interface WeeklyReport {
  user_id: string;
  period_start: string;
  period_end: string;
  sessions_completed: number;
  total_conversation_turns: number;
  weak_skills: { skill_id: string; skill_name: string; p_mastery: number }[];
  generated_at: string;
}

export default function ReportPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<WeeklyReport>("/reports/weekly")
      .then((res) => setReport(res.data))
      .catch(() => setError("Could not load report."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-sm text-[var(--muted-foreground)] animate-pulse">
        Generating report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-500">{error}</div>
    );
  }

  if (!report) return null;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Weekly Report
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {new Date(report.period_start).toLocaleDateString()} &mdash;{" "}
          {new Date(report.period_end).toLocaleDateString()}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">Sessions</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {report.sessions_completed}
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            Conversation Turns
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {report.total_conversation_turns}
          </p>
        </div>
      </div>

      {/* Weak skills */}
      {report.weak_skills.length > 0 && (
        <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3">
            Focus Areas
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Skills below 50% mastery that need more practice
          </p>
          <div className="space-y-2">
            {report.weak_skills.map((s) => (
              <div key={s.skill_id} className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${Math.round(s.p_mastery * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-[var(--foreground)] w-32">
                  {s.skill_name}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] w-8 text-right">
                  {Math.round(s.p_mastery * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full skill tree */}
      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-4">
          All Skills
        </h3>
        <SkillTree />
      </section>
    </div>
  );
}
