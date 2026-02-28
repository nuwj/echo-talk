import axios from "axios";
import type {
  GrammarError,
  KnowledgeState,
  PronunciationAssessment,
  Skill,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore parse errors
      }
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Phase 2 helpers ---------------------------------------------------------

export async function getAssessment(sessionId: string): Promise<PronunciationAssessment> {
  const res = await api.get<PronunciationAssessment>(`/assessments/${sessionId}`);
  return res.data;
}

export async function getGrammarErrors(sessionId: string): Promise<GrammarError[]> {
  const res = await api.get<GrammarError[]>(`/assessments/${sessionId}/grammar`);
  return res.data;
}

export async function getKnowledgeStates(): Promise<KnowledgeState[]> {
  const res = await api.get<KnowledgeState[]>("/assessments/knowledge/states");
  return res.data;
}

export async function getSkills(): Promise<Skill[]> {
  const res = await api.get<Skill[]>("/assessments/knowledge/skills");
  return res.data;
}
