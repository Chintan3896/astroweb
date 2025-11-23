// pages/api/choghadiya.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { computeChoghadiyaForDate, ChoghadiyaEntry } from "../../lib/chogadiya";

type ApiResponse =
  | { ok: true; location: { lat: number; lon: number; tz: string }; date: string; entries: ChoghadiyaEntry[] }
  | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const q = (req.query as Record<string, string | undefined>);

    const lat = q.lat ? parseFloat(q.lat) : undefined;
    const lon = q.lon ? parseFloat(q.lon) : undefined;
    const dateParam = q.date; // YYYY-MM-DD
    const tz = q.tz || "UTC";

    if (lat == null || lon == null) {
      res.status(400).json({ ok: false, error: "Missing lat or lon query params" });
      return;
    }

    const date = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
    if (isNaN(date.getTime())) {
      res.status(400).json({ ok: false, error: "Invalid date" });
      return;
    }

    const entries = computeChoghadiyaForDate(lat, lon, date, String(tz));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json({
      ok: true,
      location: { lat, lon, tz: String(tz) },
      date: date.toISOString().slice(0, 10),
      entries,
    });
  } catch (err: any) {
    console.error("API error", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
