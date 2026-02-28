"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Mic, BarChart3 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          setIsAuth(true);
          router.replace("/practice");
          return;
        }
      } catch {
        // ignore
      }
    }
    setIsAuth(false);
  }, [router]);

  if (isAuth === null) return null;
  if (isAuth) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--primary)]">EchoTalk</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-md transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-bold text-[var(--foreground)] leading-tight">
            Practice English Speaking
            <br />
            <span className="text-[var(--primary)]">with AI</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-lg mx-auto">
            Your personal AI English coach. Practice conversations, improve
            pronunciation, and track your progress — all at your own pace.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Free Practice
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--secondary)] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
              AI Conversations
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Natural English conversations with a patient AI coach
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] text-center">
            <Mic className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
              Pronunciation Feedback
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Phoneme-level analysis to pinpoint your weak spots
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
              Track Progress
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Knowledge tracking adapts to your learning pace
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted-foreground)]">
        EchoTalk &mdash; AI English Speaking Practice
      </footer>
    </div>
  );
}
