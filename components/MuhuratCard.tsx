"use client";

import React from "react";

const effectClass = (effect: string) => {
  if (effect === "Very Good" || effect === "Good") return "bg-green-100 text-green-800";
  if (effect === "Normal" || effect === "Neutral") return "bg-blue-100 text-blue-800";
  return "bg-red-100 text-red-800";
};

export default function MuhuratCard({ muhurat, active }: { muhurat: any; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-transform duration-200 ${active ? "scale-102 ring-4 ring-yellow-300 bg-accent/6" : "bg-white/50 hover:scale-101"} shadow-sm`}
      role="group"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${muhurat.type === "day" ? "bg-gradient-to-tr from-sky-500 to-indigo-600" : "bg-gradient-to-tr from-indigo-700 to-violet-700"}`}>
        {muhurat.name.slice(0, 2)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold truncate">{muhurat.name}</div>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded ${effectClass(muhurat.effect)}`}>{muhurat.effect}</div>
        </div>

        <div className="text-xs text-muted mt-1">{muhurat.startStr} — {muhurat.endStr}</div>
      </div>
    </div>
  );
}
