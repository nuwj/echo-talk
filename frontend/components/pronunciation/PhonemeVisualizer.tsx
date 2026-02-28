"use client";

import { useState } from "react";
import type { PhonemeAlignment, PhonemeErrorType } from "@/lib/types";

interface PhonemeVisualizerProps {
  alignment: PhonemeAlignment[];
}

const ERROR_COLORS: Record<PhonemeErrorType, string> = {
  correct: "bg-green-100 text-green-800 border-green-300",
  substitution: "bg-red-100 text-red-800 border-red-300",
  deletion: "bg-orange-100 text-orange-700 border-orange-300",
  insertion: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

const ERROR_LABELS: Record<PhonemeErrorType, string> = {
  correct: "Correct",
  substitution: "Wrong sound",
  deletion: "Omitted",
  insertion: "Extra sound",
};

export default function PhonemeVisualizer({ alignment }: PhonemeVisualizerProps) {
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  if (alignment.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No phoneme data available.</p>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">
        Hover a phoneme for details. Green = correct, Red = wrong, Orange = omitted, Yellow = extra.
      </p>
      <div className="flex flex-wrap gap-1">
        {alignment.map((entry, i) => (
          <div key={i} className="relative">
            <button
              className={`px-2 py-1 rounded border text-sm font-mono transition-transform hover:scale-110 ${ERROR_COLORS[entry.type]}`}
              onMouseEnter={() => setTooltipIndex(i)}
              onMouseLeave={() => setTooltipIndex(null)}
              aria-label={`Phoneme ${entry.expected ?? entry.actual}: ${ERROR_LABELS[entry.type]}`}
              type="button"
            >
              {entry.type === "deletion" ? "—" : (entry.actual ?? entry.expected ?? "?")}
            </button>
            {tooltipIndex === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none">
                <div>{ERROR_LABELS[entry.type]}</div>
                {entry.type === "substitution" && (
                  <div>Expected: <strong>{entry.expected}</strong> | Got: <strong>{entry.actual}</strong></div>
                )}
                {entry.type === "deletion" && (
                  <div>Missing: <strong>{entry.expected}</strong></div>
                )}
                {entry.type === "insertion" && (
                  <div>Extra: <strong>{entry.actual}</strong></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
