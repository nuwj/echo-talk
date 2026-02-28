"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { changePassword } from "@/lib/api";
import { Sun, Moon, User, Lock } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [darkMode, setDarkMode] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(20);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("echotalk-dark-mode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    const goalStored = localStorage.getItem("echotalk-daily-goal");
    if (goalStored) setDailyGoal(Number(goalStored));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("echotalk-dark-mode", String(next));
  };

  const handleGoalChange = (value: number) => {
    setDailyGoal(value);
    localStorage.setItem("echotalk-daily-goal", String(value));
  };

  const handleChangePassword = async () => {
    setPwdMessage(null);
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }
    setPwdLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdMessage({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to change password";
      setPwdMessage({ type: "error", text: msg });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Settings
      </h2>

      {/* Profile */}
      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Profile
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <User className="h-6 w-6 text-[var(--primary-foreground)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">{user?.name}</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {user?.email}
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Security
        </h3>
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-5 w-5 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">
            Change Password
          </p>
        </div>
        <div className="space-y-3 max-w-sm">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          {pwdMessage && (
            <p
              className={`text-sm ${
                pwdMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {pwdMessage.text}
            </p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={
              pwdLoading || !currentPassword || !newPassword || !confirmPassword
            }
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pwdLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="h-5 w-5 text-[var(--muted-foreground)]" />
            ) : (
              <Sun className="h-5 w-5 text-[var(--muted-foreground)]" />
            )}
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Dark Mode
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Toggle between light and dark theme
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? "bg-[var(--primary)]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Learning */}
      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Learning
        </h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Daily Goal
            </p>
            <span className="text-sm text-[var(--muted-foreground)]">
              {dailyGoal} conversation turns
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={dailyGoal}
            onChange={(e) => handleGoalChange(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>5</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>
      </section>
    </div>
  );
}
