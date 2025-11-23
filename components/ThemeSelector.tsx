"use client";

import React from "react";

export default function ThemeSelector({ theme, setTheme }: { theme: string; setTheme: (s: string) => void }) {
  return (
    <div className="inline-flex items-center gap-2 bg-transparent rounded-md">
      <button
        onClick={() => setTheme("light")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          theme === "light" ? "bg-white shadow-sm" : "bg-transparent"
        }`}
        aria-pressed={theme === "light"}
        title="Light"
      >
        ☀️ Day
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          theme === "dark" ? "bg-slate-900 text-white shadow-sm" : "bg-transparent"
        }`}
        aria-pressed={theme === "dark"}
        title="Dark"
      >
        🌙 Night
      </button>

      <button
        onClick={() => setTheme("warm")}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          theme === "warm" ? "bg-amber-100 text-amber-900 shadow-sm" : "bg-transparent"
        }`}
        aria-pressed={theme === "warm"}
        title="Warm"
      >
        🔶 Warm
      </button>
    </div>
  );
}
