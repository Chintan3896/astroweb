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
  return (
    <header className="rounded-2xl overflow-hidden relative">
      {/* Gradient hero (pure CSS gradients, no images). If you want to use the uploaded image later, see comment below. */}
      <div className="p-6 md:p-8 rounded-2xl bg-hero-gradient border shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted">Location</div>
            <div className="text-lg font-semibold">{`Lat ${location.lat.toFixed(3)}, Lon ${location.lon.toFixed(3)}`}</div>

            <div className="mt-4 flex items-center gap-3">
              <div>
                <div className="text-xs text-muted">Date</div>
                <DatePicker
                  selected={date}
                  onChange={(d: Date | null) => d && setDate(d)}
                  dateFormat="dd MMM yyyy"
                  className="mt-1 bg-transparent outline-none text-base font-medium"
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted">Now</div>
            <div className="text-3xl font-extrabold">{current ? current.name : "—"}</div>
            <div className="text-sm mt-2">
              {current ? (
                <>
                  <div>Start: <strong>{current.startStr}</strong></div>
                  <div>End: <strong>{current.endStr}</strong></div>
                </>
              ) : (
                <div className="opacity-80">No active choghadiya</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-white/10 border flex flex-col items-start">
            <div className="text-xs text-muted">Sunrise</div>
            <div className="text-lg font-semibold">{sunInfo.sunrise || "—"}</div>
          </div>
          <div className="rounded-xl p-3 bg-white/10 border flex flex-col items-start">
            <div className="text-xs text-muted">Sunset</div>
            <div className="text-lg font-semibold">{sunInfo.sunset || "—"}</div>
          </div>
        </div>
      </div>

      {/* optional: use the uploaded image as subtle background
          to enable, move the PNG to public/ and set CSS .bg-hero-image to:
          background-image: url('/A_UI_design_of_a_Panchang_Choghadiya_application_i.png');
          (uploaded path available: /mnt/data/A_UI_design_of_a_Panchang_Choghadiya_application_i.png )
      */}
    </header>
  );
}
