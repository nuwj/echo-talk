"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Briefcase, Plane, Coffee, GraduationCap, ShoppingBag } from "lucide-react";
import api from "@/lib/api";

const scenarios = [
  {
    id: "daily_chat",
    title: "Daily Conversation",
    description: "Practice everyday English: greetings, weather, hobbies, plans",
    icon: Coffee,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    id: "job_interview",
    title: "Job Interview",
    description: "Prepare for common interview questions and professional responses",
    icon: Briefcase,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "travel",
    title: "Travel & Navigation",
    description: "Airport, hotel, restaurant, asking for directions",
    icon: Plane,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: "academic",
    title: "Academic Discussion",
    description: "University seminars, presentations, research topics",
    icon: GraduationCap,
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "shopping",
    title: "Shopping & Services",
    description: "Buying things, returns, customer service interactions",
    icon: ShoppingBag,
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
  {
    id: "free_talk",
    title: "Free Talk",
    description: "No topic constraints — talk about anything you want",
    icon: MessageSquare,
    color: "bg-gray-50 text-gray-600 border-gray-200",
  },
];

export default function ScenariosPage() {
  const router = useRouter();

  const handleSelectScenario = async (scenarioId: string) => {
    // Create a session in scenario mode, then navigate to conversation
    try {
      await api.post("/sessions", { mode: "scenario" });
      // Store scenario hint for conversation page
      sessionStorage.setItem("echotalk-scenario", scenarioId);
      router.push("/practice/conversation");
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Practice Scenarios
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Choose a real-world situation to practice
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`border rounded-lg p-5 text-left hover:shadow-md transition-shadow ${s.color}`}
            >
              <Icon className="h-8 w-8 mb-3" />
              <h3 className="font-semibold text-base mb-1">{s.title}</h3>
              <p className="text-sm opacity-80">{s.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
