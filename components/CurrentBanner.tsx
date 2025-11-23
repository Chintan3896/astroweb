"use client";

import React, { useEffect, useState } from "react";

export default function CurrentBanner({ current, theme }: { current: any | null; theme: string }) {
  const [secsLeft, setSecsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!current) {
      setSecsLeft(null);
      return;
    }
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((current.end.getTime() - now.getTime()) / 1000));
      setSecsLeft(diff);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [current]);

  const format = (secs: number | null) => {
    if (secs === null) return "";
    if (secs <= 0) return "0s";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="rounded-xl p-3 border shadow-md bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Current</div>
          <div className="text-lg font-bold text-gray-800">{current ? current.name : "—"}</div>
          <div className="text-sm text-gray-600">{current ? `${current.startStr} — ${current.endStr}` : "No active choghadiya"}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Ends in</div>
          <div className="font-mono font-semibold text-gray-800">{format(secsLeft)}</div>
        </div>
      </div>
    </div>
  );
}
