"use client";
import { motion } from "framer-motion";

const effectColor = (effect: string) => {
  if (effect === "Very Good" || effect === "Good") return "text-green-700 bg-green-100";
  if (effect === "Normal") return "text-blue-700 bg-blue-100";
  return "text-red-700 bg-red-100";
};

export default function MuhuratCard({ m, active }: { m: any; active?: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border shadow-lg bg-panel ${active ? "ring-4 ring-gold/60 scale-[1.02]" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{m.name}</div>
          <div className="text-sm opacity-75">{m.startStr} — {m.endStr}</div>
        </div>

        <div className="text-right">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${effectColor(m.effect)}`}>
            {m.effect}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
