"use client";

import { useEffect, useState } from "react";
import type { GrammarError, PronunciationAssessment } from "@/lib/types";
import { getAssessment, getGrammarErrors } from "@/lib/api";
import PhonemeVisualizer from "./PhonemeVisualizer";

interface PronunciationFeedbackProps {
  sessionId: string;
}

export default function PronunciationFeedback({ sessionId }: PronunciationFeedbackProps) {
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [grammarErrors, setGrammarErrors] = useState<GrammarError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const MAX_ATTEMPTS = 6;
    const INTERVAL_MS = 5000;

    async function poll(attempt: number) {
      try {
        const [a, g] = await Promise.all([
          getAssessment(sessionId),
          getGrammarErrors(sessionId),
        ]);
        if (!cancelled) {
          setAssessment(a);
          setGrammarErrors(g);
          setLoading(false);
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 && attempt < MAX_ATTEMPTS) {
          // Analysis not ready yet — retry
          setTimeout(() => poll(attempt + 1), INTERVAL_MS);
        } else if (!cancelled) {
          setError("Could not load pronunciation feedback.");
          setLoading(false);
        }
      }
    }

    poll(1);
    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Analyzing pronunciation...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!assessment) return null;

  const scoreColor =
    assessment.overall_score >= 80
      ? "text-green-600"
      : assessment.overall_score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Pronunciation score</span>
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {assessment.overall_score.toFixed(0)}
          <span className="text-base font-normal text-gray-400">/100</span>
        </span>
      </div>

      {/* Phoneme visualizer */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">Phoneme analysis</p>
        <PhonemeVisualizer alignment={assessment.phoneme_alignment} />
      </div>

      {/* Grammar errors */}
      {grammarErrors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">
            Grammar notes ({grammarErrors.length})
          </p>
          <ul className="space-y-1">
            {grammarErrors.map((err) => (
              <li key={err.id} className="text-sm bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
                <span className="text-red-600 line-through mr-2">{err.original}</span>
                <span className="text-gray-500 text-xs">({err.error_type.replace(/_/g, " ")})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
