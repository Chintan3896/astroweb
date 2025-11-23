"use client";

import React from "react";

type Muhurat = {
  name: string;
  startStr: string;
  endStr: string;
  effect: string;
  type?: "day" | "night" | string;
};

const bgForEffect = (effect: string) => {
  switch (effect) {
    case "Very Good":
      return { bg: "bg-green-50", border: "border-green-100", pill: "bg-green-200", time: "text-green-800" };
    case "Good":
      return { bg: "bg-green-50", border: "border-green-100", pill: "bg-green-100", time: "text-green-700" };
    case "Normal":
      return { bg: "bg-blue-50", border: "border-blue-100", pill: "bg-blue-100", time: "text-blue-700" };
    case "Neutral":
      return { bg: "bg-blue-50", border: "border-blue-100", pill: "bg-blue-100", time: "text-blue-700" };
    default:
      // Bad / others
      return { bg: "bg-red-50", border: "border-red-100", pill: "bg-red-100", time: "text-red-700" };
  }
};

export default function MuhuratCard({ muhurat, active = false }: { muhurat: Muhurat; active?: boolean }) {
  const style = bgForEffect(muhurat.effect);
  const short = muhurat.name.slice(0, 2).toUpperCase();

  return (
    <div
      className={`rounded-lg p-4 border ${style.border} ${style.bg} shadow-sm relative overflow-hidden transition-transform duration-150
        ${active ? "scale-102 ring-4 ring-yellow-200" : "hover:-translate-y-1"}`}
    >
      <div className="flex items-start gap-3">
        {/* small colored top-left badge */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${muhurat.type === "day" ? "bg-gradient-to-tr from-teal-400 to-emerald-400" : "bg-gradient-to-tr from-indigo-400 to-violet-400"}`}
        >
          {short}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-lg text-gray-800 truncate">{muhurat.name}</div>
            <div className="text-sm text-gray-600">{/* placeholder for small label if needed */}</div>
          </div>

          <div className="mt-3 text-sm">
            <div className={`${style.time} font-mono`}>Start: <span className="font-medium">{muhurat.startStr}</span></div>
            <div className={`${style.time} font-mono mt-1`}>End: <span className="font-medium">{muhurat.endStr}</span></div>
          </div>
        </div>
      </div>

      {/* effect pill at bottom, centered */}
      <div className="mt-4 pt-4">
        <div className={`mx-auto w-9/12 text-center text-sm font-semibold py-2 rounded-full ${style.pill} text-gray-800`}>{muhurat.effect}</div>
      </div>
    </div>
  );
}
