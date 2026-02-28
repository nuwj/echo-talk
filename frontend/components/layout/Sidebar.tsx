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
  History,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/practice",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Conversation",
    href: "/practice/conversation",
    icon: MessageSquare,
  },
  {
    label: "Pronunciation",
    href: "/practice/pronunciation",
    icon: Mic,
  },
  {
    label: "Scenarios",
    href: "/practice/scenarios",
    icon: Theater,
  },
  {
    label: "History",
    href: "/practice/history",
    icon: History,
  },
  {
    label: "Reports",
    href: "/report",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/practice">
          <h1 className="text-lg font-bold text-[var(--primary)]">
            EchoTalk
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Your AI speaking coach
          </p>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="text-xs text-[var(--muted-foreground)] text-center">
          EchoTalk v0.1.0
        </div>
      </div>
    </aside>
  );
}
