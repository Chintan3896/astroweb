"use client";

import React from "react";
import DatePicker from "react-datepicker";

export default function HeroSection({
  location,
  current,
  sunInfo,
  date,
  setDate,
  theme,
  setTheme,
}: {
  location: { lat: number; lon: number };
  current: any | null;
  sunInfo: { sunrise: string; sunset: string };
  date: Date;
  setDate: (d: Date) => void;
  theme: "light" | "dark" | "warm";
  setTheme: (t: any) => void;
}) {
  // map theme to hero gradient classes (keeps old UI aesthetic)
  const heroGradient =
    theme === "dark"
      ? "bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 text-white"
      : theme === "warm"
      ? "bg-gradient-to-br from-yellow-50 via-orange-100 to-amber-50"
      : "bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100";

  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const muted = theme === "dark" ? "text-slate-300" : "text-gray-500";

  return (
    <header className="rounded-2xl overflow-hidden relative">
      <div className={`p-6 md:p-8 rounded-2xl border shadow-xl ${heroGradient}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className={`text-sm ${muted}`}>Location</div>
            <div className={`text-lg md:text-xl font-semibold ${textColor}`}>
              {`Lat ${location.lat.toFixed(4)}, Lon ${location.lon.toFixed(4)}`}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div>
                <div className={`text-xs ${muted}`}>Date</div>
                <DatePicker
                  selected={date}
                  onChange={(d: Date | null) => d && setDate(d)}
                  dateFormat="dd MMM yyyy"
                  className={`mt-1 bg-transparent outline-none text-base font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}
                />
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className={`text-xs ${muted}`}>Theme</div>
                <div>
                  {/* small inline selector to not duplicate ThemeSelector component here */}
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as "light" | "dark" | "warm")}
                    className="rounded-lg px-3 py-2 bg-white/10 border"
                    aria-label="Select theme"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="warm">Warm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-56 text-right">
            <div className={`text-sm ${muted}`}>Now</div>
            <div className="text-2xl md:text-3xl font-extrabold leading-tight">
              <span className={textColor}>{current ? current.name : "—"}</span>
            </div>

            <div className="text-sm mt-2">
              {current ? (
                <>
                  <div className={`${muted}`}>Start: <strong className={textColor}>{current.startStr}</strong></div>
                  <div className={`${muted}`}>End: <strong className={textColor}>{current.endStr}</strong></div>
                </>
              ) : (
                <div className="opacity-80 text-sm md:text-base">No active choghadiya</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 border flex flex-col items-start bg-white/70 dark:bg-white/5">
            <div className={`text-xs ${muted}`}>Sunrise</div>
            <div className="text-lg font-semibold text-yellow-800">{sunInfo.sunrise || "—"}</div>
          </div>

          <div className="rounded-xl p-3 border flex flex-col items-start bg-white/70 dark:bg-white/5">
            <div className={`text-xs ${muted}`}>Sunset</div>
            <div className="text-lg font-semibold text-orange-700">{sunInfo.sunset || "—"}</div>
          </div>
        </div>
      </div>

      {/* Decorative subtle accent in the hero corner to mimic the old UI look */}
      <div className="pointer-events-none absolute -bottom-6 left-6 opacity-10">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="currentColor" className="text-indigo-200" />
        </svg>
      </div>
    </header>
  );
}
