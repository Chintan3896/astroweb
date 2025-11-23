// lib/chogadiya.ts
import SunCalc from "suncalc";

export type ChoghadiyaKind = "Shubh" | "Amrit" | "Chal" | "Rog" | "Kaal" | "Udveg" | "Labh";

export interface ChoghadiyaEntry {
  id: string;
  kind: ChoghadiyaKind;
  index: number; // 0..15 across day+night
  startUTC: string; // ISO
  endUTC: string; // ISO
  startLocal: string; // ISO with offset (string)
  endLocal: string;
  durationMinutes: number;
  quality: "very_good" | "good" | "neutral" | "bad";
}

/**
 * Standard choghadiya sequence for day and night (8 each)
 * Commonly used mapping: starting from sunrise for day choghadiya
 * Sequence for the 8: (This mapping can be adapted if you have a source)
 */
const CHOGHADIYA_SEQUENCE: ChoghadiyaKind[] = [
  "Udveg",
  "Chal",
  "Labh",
  "Amrit",
  "Kaal",
  "Shubh",
  "Rog",
  "Chal",
];

function kindToQuality(kind: ChoghadiyaKind): ChoghadiyaEntry["quality"] {
  switch (kind) {
    case "Amrit":
    case "Shubh":
      return "very_good";
    case "Labh":
    case "Udveg":
      return "good";
    case "Chal":
      return "neutral";
    case "Rog":
    case "Kaal":
      return "bad";
    default:
      return "neutral";
  }
}

/**
 * Helper: pad and iso
 */
function toISO(d: Date) {
  return d.toISOString();
}

/**
 * Compute choghadiya for a date and location.
 * Splits day (sunrise->sunset) into 8 equal parts and night (sunset->next sunrise) into 8 equal parts.
 */
export function computeChoghadiyaForDate(lat: number, lon: number, dateObj: Date, tz = "UTC"): ChoghadiyaEntry[] {
  // Normalize to local midnight of the provided date in UTC context by using dateObj's YMD.
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth();
  const day = dateObj.getUTCDate();

  // Build Date objects in UTC for the given date's noon to pass to SunCalc (avoid DST edge cases)
  const targetMiddayUTC = new Date(Date.UTC(year, month, day, 12, 0, 0));

  // Compute sunrise/sunset (in UTC Date objects) using SunCalc which returns UTC dates.
  const times = SunCalc.getTimes(targetMiddayUTC, lat, lon);
  const sunrise = times.sunrise || times.sunriseEnd || times.sunrise; // fallback
  const sunset = times.sunset || times.sunsetStart || times.sunset;

  // For night: next day's sunrise
  const nextMiddayUTC = new Date(Date.UTC(year, month, day + 1, 12, 0, 0));
  const nextTimes = SunCalc.getTimes(nextMiddayUTC, lat, lon);
  const nextSunrise = nextTimes.sunrise || nextTimes.sunriseEnd || nextTimes.sunrise;

  const entries: ChoghadiyaEntry[] = [];

  if (!sunrise || !sunset || !nextSunrise) {
    // fallback: if SunCalc failed for some reason provide static day segments around UTC midday
    const fallbackStart = new Date(targetMiddayUTC.getTime() - 6 * 60 * 60 * 1000);
    const fallbackSunrise = new Date(targetMiddayUTC.getTime() - 3 * 60 * 60 * 1000);
    const fallbackSunset = new Date(targetMiddayUTC.getTime() + 3 * 60 * 60 * 1000);
    return computeChoghadiyaForTimes(lat, lon, fallbackSunrise, fallbackSunset, new Date(fallbackSunset.getTime() + 12 * 60 * 60 * 1000));
  }

  // Day: sunrise -> sunset split into 8
  const dayParts = splitIntervalIntoN(sunrise, sunset, 8);

  // Night: sunset -> nextSunrise split into 8
  const nightParts = splitIntervalIntoN(sunset, nextSunrise, 8);

  // Build day entries
  for (let i = 0; i < 8; i++) {
    const kind = CHOGHADIYA_SEQUENCE[i % CHOGHADIYA_SEQUENCE.length];
    const start = dayParts[i][0];
    const end = dayParts[i][1];
    entries.push(makeEntry(kind, i, start, end));
  }

  // Build night entries (index 8..15)
  for (let i = 0; i < 8; i++) {
    const kind = CHOGHADIYA_SEQUENCE[i % CHOGHADIYA_SEQUENCE.length];
    const start = nightParts[i][0];
    const end = nightParts[i][1];
    entries.push(makeEntry(kind, 8 + i, start, end));
  }

  return entries;
}

function computeChoghadiyaForTimes(lat: number, lon: number, sunrise: Date, sunset: Date, nextSunrise: Date) {
  const entries: ChoghadiyaEntry[] = [];
  const dayParts = splitIntervalIntoN(sunrise, sunset, 8);
  const nightParts = splitIntervalIntoN(sunset, nextSunrise, 8);
  for (let i = 0; i < 8; i++) {
    const kind = CHOGHADIYA_SEQUENCE[i % CHOGHADIYA_SEQUENCE.length];
    entries.push(makeEntry(kind, i, dayParts[i][0], dayParts[i][1]));
  }
  for (let i = 0; i < 8; i++) {
    const kind = CHOGHADIYA_SEQUENCE[i % CHOGHADIYA_SEQUENCE.length];
    entries.push(makeEntry(kind, 8 + i, nightParts[i][0], nightParts[i][1]));
  }
  return entries;
}

function makeEntry(kind: ChoghadiyaKind, index: number, start: Date, end: Date): ChoghadiyaEntry {
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.round(durationMs / 60000);
  return {
    id: `${start.toISOString()}_${index}`,
    kind,
    index,
    startUTC: start.toISOString(),
    endUTC: end.toISOString(),
    // For local strings we simply rely on Date.toString of timezone-aware Date; actual timezone label should be handled on client
    startLocal: start.toISOString(),
    endLocal: end.toISOString(),
    durationMinutes,
    quality: kindToQuality(kind),
  };
}

/**
 * Splits an interval [start,end) into N equal parts, returns array of [start_i,end_i] pairs (Date objects)
 */
function splitIntervalIntoN(start: Date, end: Date, n: number): [Date, Date][] {
  const results: [Date, Date][] = [];
  const startMs = start.getTime();
  const endMs = end.getTime();
  const total = endMs - startMs;
  const part = total / n;
  for (let i = 0; i < n; i++) {
    const s = new Date(Math.round(startMs + part * i));
    const e = new Date(Math.round(startMs + part * (i + 1)));
    results.push([s, e]);
  }
  return results;
}
