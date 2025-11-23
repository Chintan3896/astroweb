"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CurrentBanner({ current }: { current: any | null }) {
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

  const formatCountdown = (s: number | null) => {
    if (s === null) return "";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const mm = m.toString().padStart(2, "0");
    if (h > 0) return `${h}h ${mm}m`;
    return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  };

  if (!current) {
    return (
      <div className="p-4 rounded-2xl bg-panel/80 border shadow-sm text-center">
        <div className="text-sm opacity-80">No active choghadiya right now</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 rounded-2xl bg-gold/10 border-gold/20 border shadow-lg flex items-center justify-between">
      <div>
        <div className="text-sm opacity-80">Current Choghadiya</div>
        <div className="font-bold text-xl">{current.name}</div>
        <div className="text-sm opacity-80">Ends at {current.endStr}</div>
      </div>
      <div className="text-right">
        <div className="text-sm opacity-60">Remaining</div>
        <div className="font-mono font-semibold text-lg">{formatCountdown(secsLeft)}</div>
      </div>
    </motion.div>
  );
}
