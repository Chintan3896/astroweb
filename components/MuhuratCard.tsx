"use client";

import React from "react";

type Muhurat = {
  name: string;
  startStr: string;
  endStr: string;
  effect: string;
  type?: "day" | "night" | string;
};

const effectClass = (effect: string) => {
  if (effect === "Very Good") return "bg-green-200 text-green-800 border-green-200";
  if (effect === "Good") return "bg-green-100 text-green-700 border-green-100";
  if (effect === "Normal" || effect === "Neutral") return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-red-50 text-red-700 border-red-100";
};

export default function MuhuratCard({
  muhurat,
  active = false,
}: {
  muhurat: Muhurat;
  active?: boolean;
}) {
  // first-two-chars badge
  const badge = muhurat.name.slice(0, 2).toUpperCase();

  // background gradient for day/night
  const badgeBg =
    muhurat.type === "day"
      ? "bg-gradient-to-tr from-sky-500 to-indigo-600"
      : "bg-gradient-to-tr from-indigo-700 to-violet-700";

  return (
    <div
      role="group"
      className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm transition-transform duration-200 transform
        ${active ? "scale-105 ring-4 ring-yellow-300/60 bg-yellow-50/80" : "hover:scale-102 bg-white/60"}
        md:p-4`}
    >
      <div
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base ${badgeBg} flex-shrink-0`}
        aria-hidden
      >
        {badge}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="font-semibold text-sm md:text-base truncate text-gray-800 dark:text-gray-100">
            {muhurat.name}
          </div>

          <div
            className={`text-xs md:text-sm font-semibold px-2 py-0.5 rounded ${effectClass(muhurat.effect)} border`}
          >
            {muhurat.effect}
          </div>
        </div>

        <div className="text-xs text-muted mt-1 md:mt-2 text-gray-600 dark:text-gray-300">
          <span className="font-mono">{muhurat.startStr}</span>
          <span className="mx-2 opacity-70">—</span>
          <span className="font-mono">{muhurat.endStr}</span>
        </div>
      </div>
    </div>
  );
}
