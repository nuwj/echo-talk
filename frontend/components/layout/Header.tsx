"use client";

import { useAuthStore } from "@/lib/store";
import { LogOut, User } from "lucide-react";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-6">
      <div className="text-sm text-[var(--muted-foreground)]">
        Practice Session
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-[var(--muted-foreground)]" />
          <span className="text-[var(--foreground)]">{user?.name}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--secondary)]"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
