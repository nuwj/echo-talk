export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface TokenResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  user_id: string;
  mode: string;
  started_at: string;
  ended_at: string | null;
  status: "active" | "completed";
  transcripts: TranscriptEntry[];
  message_count: number;
}

export interface SessionSummary {
  id: string;
  mode: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  message_count: number;
}

export interface ChatResponse {
  reply: string;
  audio_base64: string | null;
  transcript_id: string;
}

export type ConversationStatus = "idle" | "recording" | "processing" | "playing";
export type AvatarStatus = "idle" | "listening" | "thinking" | "speaking";

// Phase 2 ---------------------------------------------------------------

export type PhonemeErrorType = "correct" | "substitution" | "deletion" | "insertion";

export interface PhonemeAlignment {
  position: number;
  phoneme: string;
  expected: string | null;
  actual: string | null;
  type: PhonemeErrorType;
}

export interface PronunciationAssessment {
  id: string;
  session_id: string;
  overall_score: number;
  phoneme_alignment: PhonemeAlignment[];
  elsa_response: Record<string, unknown> | null;
  created_at: string;
}

export interface GrammarError {
  id: string;
  session_id: string;
  skill_tag: string;
  original: string;
  corrected: string;
  error_type: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "grammar" | "pronunciation";
}

export interface KnowledgeState {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name: string;
  skill_category: string;
  p_mastery: number;
  updated_at: string;
}

