"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Mic,
  Theater,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Conversation",
    href: "/practice/conversation",
    icon: MessageSquare,
  },
  {
    label: "Pronunciation",
    href: "/practice/pronunciation",
    icon: Mic,
    disabled: true,
  },
  {
    label: "Scenarios",
    href: "/practice/scenarios",
    icon: Theater,
    disabled: true,
  },
  {
    label: "Reports",
    href: "/report",
    icon: BarChart3,
    disabled: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    disabled: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--primary)]">
          EchoTalk
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Your AI speaking coach
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--foreground)] hover:bg-[var(--secondary)]",
                item.disabled && "opacity-40 cursor-not-allowed"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-[10px] bg-[var(--muted)] text-[var(--muted-foreground)] px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="text-xs text-[var(--muted-foreground)] text-center">
          Phase 1 MVP
        </div>
      </div>
    </aside>
  );
}
