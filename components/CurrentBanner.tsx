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
    <div className={`rounded-xl p-3 border shadow-md bg-panel flex items-center justify-between`}>
      <div>
        <div className="text-xs text-muted">Current</div>
        <div className="text-lg font-bold">{current ? current.name : "—"}</div>
        <div className="text-sm opacity-75">{current ? `${current.startStr} — ${current.endStr}` : "No active choghadiya"}</div>
      </div>

      <div className="text-right">
        <div className="text-xs text-muted">Ends in</div>
        <div className="font-mono font-semibold">{format(secsLeft)}</div>
      </div>
    </div>
  );
}
