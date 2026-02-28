import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";
import type {
  User,
  TranscriptEntry,
  ConversationStatus,
  ChatResponse,
} from "./types";

// ========== Auth Store ==========

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const { user, access_token } = res.data;
        set({ user, token: access_token, isAuthenticated: true });
      },

      register: async (name, email, password) => {
        const res = await api.post("/auth/register", { email, password, name });
        const { user, access_token } = res.data;
        set({ user, token: access_token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
    }),
    { name: "auth-storage" }
  )
);

// ========== Conversation Store ==========

interface ConversationState {
  sessionId: string | null;
  transcripts: TranscriptEntry[];
  status: ConversationStatus;
  isLoading: boolean;

  startSession: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  endSession: () => Promise<void>;
  reset: () => void;
}

export const useConversationStore = create<ConversationState>()((set, get) => ({
  sessionId: null,
  transcripts: [],
  status: "idle",
  isLoading: false,

  startSession: async () => {
    const res = await api.post("/sessions", { mode: "conversation" });
    set({ sessionId: res.data.id, transcripts: [], status: "idle" });
  },

  sendMessage: async (text: string) => {
    const { sessionId } = get();
    if (!sessionId) return;

    // Add user message immediately
    const userEntry: TranscriptEntry = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      transcripts: [...state.transcripts, userEntry],
      status: "processing",
      isLoading: true,
    }));

    try {
      const res = await api.post<ChatResponse>("/conversation/chat", {
        session_id: sessionId,
        message: text,
      });

      const aiEntry: TranscriptEntry = {
        id: res.data.transcript_id,
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        transcripts: [...state.transcripts, aiEntry],
        status: "idle",
        isLoading: false,
      }));
    } catch {
      set({ status: "idle", isLoading: false });
    }
  },

  endSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    await api.post(`/sessions/${sessionId}/end`);
    set({ status: "idle" });
  },

  reset: () => {
    set({ sessionId: null, transcripts: [], status: "idle", isLoading: false });
  },
}));
