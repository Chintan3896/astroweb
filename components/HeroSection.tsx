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
  // root text colors (kept simple to match screenshot)
  const titleColor = theme === "dark" ? "text-white" : "text-gray-900";
  const muted = theme === "dark" ? "text-slate-300" : "text-gray-500";

  return (
    <header className="mb-8">
      {/* page title centered like screenshot */}
      <div className="text-center">
        <h1 className={`font-extrabold text-3xl md:text-4xl mb-4 ${titleColor}`}>Panchang Choghadiya</h1>

        {/* centered date picker in small rounded white box */}
        <div className="inline-block">
          <div className="bg-white rounded-md shadow-sm px-4 py-2">
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => d && setDate(d)}
              dateFormat="MMMM d, yyyy"
              className="outline-none text-sm"
            />
          </div>
          <div className={`text-xs mt-2 ${muted}`}>Location: Lat {location.lat.toFixed(4)}, Lon {location.lon.toFixed(4)}</div>
        </div>
      </div>

      {/* big Sunrise & Sunset card */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-md border p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Sunrise & Sunset</h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 text-center sm:text-left">
              <div className="inline-block bg-yellow-50 border rounded px-3 py-1 font-mono">
                <span className="text-xs text-yellow-800">Sunrise: </span>
                <span className="font-medium">{sunInfo.sunrise || "—"}</span>
              </div>
            </div>

            <div className="w-full sm:w-1/2 text-center sm:text-right">
              <div className="inline-block bg-orange-50 border rounded px-3 py-1 font-mono">
                <span className="text-xs text-orange-800">Sunset: </span>
                <span className="font-medium">{sunInfo.sunset || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
