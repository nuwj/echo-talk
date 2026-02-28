"use client";

import { useEffect, useState } from "react";
import type { KnowledgeState } from "@/lib/types";
import { getKnowledgeStates } from "@/lib/api";

const MASTERY_THRESHOLD = 0.95;

function MasteryBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 95
      ? "bg-green-500"
      : pct >= 60
      ? "bg-blue-400"
      : pct >= 30
      ? "bg-yellow-400"
      : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function SkillTree() {
  const [states, setStates] = useState<KnowledgeState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKnowledgeStates()
      .then(setStates)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-400 animate-pulse">Loading skill tree...</div>;
  }

  if (states.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        Complete a session to see your skill progress.
      </p>
    );
  }

  const grammar = states.filter((s) => s.skill_category === "grammar");
  const pronunciation = states.filter((s) => s.skill_category === "pronunciation");

  const renderGroup = (title: string, items: KnowledgeState[]) => (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{title}</p>
      <div className="space-y-2">
        {items
          .sort((a, b) => a.p_mastery - b.p_mastery)
          .map((s) => (
            <div key={s.skill_id}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-sm text-gray-700">{s.skill_name}</span>
                {s.p_mastery >= MASTERY_THRESHOLD && (
                  <span className="text-xs text-green-600 font-medium">Mastered</span>
                )}
              </div>
              <MasteryBar value={s.p_mastery} />
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {grammar.length > 0 && renderGroup("Grammar", grammar)}
      {pronunciation.length > 0 && renderGroup("Pronunciation", pronunciation)}
    </div>
  );
}
