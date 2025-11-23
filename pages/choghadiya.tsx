// pages/choghadiya.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LocationPicker from "../components/LocationPicker";
import useLocalState from "../hooks/useLocalState";

type Entry = {
  id: string;
  kind: string;
  index: number;
  startUTC: string;
  endUTC: string;
  startLocal: string;
  endLocal: string;
  durationMinutes: number;
  quality: string;
};

const DEFAULT = {
  lat: 19.0760,
  lon: 72.8777,
  tz: "Asia/Kolkata",
};

export default function ChoghadiyaPage() {
  const router = useRouter();
  const { query } = router;

  // persisted state (localStorage)
  const [saved, setSaved] = useLocalState("astro:last", {
    lat: DEFAULT.lat,
    lon: DEFAULT.lon,
    date: new Date().toISOString().slice(0, 10),
    tz: DEFAULT.tz,
  });

  // URL / query params override persisted defaults
  const initialLat = query.lat ? Number(query.lat) : saved.lat;
  const initialLon = query.lon ? Number(query.lon) : saved.lon;
  const initialDate = (query.date as string) || saved.date;
  const initialTz = (query.tz as string) || saved.tz;

  const [lat, setLat] = useState<number>(initialLat);
  const [lon, setLon] = useState<number>(initialLon);
  const [date, setDate] = useState<string>(initialDate);
  const [tz, setTz] = useState<string>(initialTz);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // when lat/lon/date change, persist and update query params (but shallow)
    setSaved({ lat, lon, date, tz });
    const qp: Record<string, string> = { lat: String(lat), lon: String(lon), date, tz };
    router.replace({ pathname: router.pathname, query: qp }, undefined, { shallow: true });
    // fetch
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, date, tz]);

  async function fetchEntries() {
    setLoading(true);
    setError(null);
    setEntries(null);
    try {
      const qs = new URLSearchParams({ lat: String(lat), lon: String(lon), date, tz });
      const res = await fetch(`/api/choghadiya?${qs.toString()}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "API returned an error");
      } else {
        setEntries(json.entries);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
      },
      (e) => {
        alert("Could not get location: " + e.message);
      }
    );
  }

  function buildShareUrl() {
    const qp = new URLSearchParams({ lat: String(lat), lon: String(lon), date, tz });
    return `${window.location.origin}${router.pathname}?${qp.toString()}`;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Choghadiya</h1>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <LocationPicker lat={lat} lon={lon} onChange={(a) => { setLat(a.lat); setLon(a.lon); }} />
        <div>
          <label style={{ display: "block", fontWeight: 600 }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button onClick={() => setDate(new Date().toISOString().slice(0, 10))} style={{ marginRight: 8 }}>
              Today
            </button>
            <button onClick={() => { const d = new Date(date); d.setUTCDate(d.getUTCDate() - 1); setDate(d.toISOString().slice(0, 10)); }} style={{ marginRight: 8 }}>
              Prev
            </button>
            <button onClick={() => { const d = new Date(date); d.setUTCDate(d.getUTCDate() + 1); setDate(d.toISOString().slice(0, 10)); }}>
              Next
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600 }}>Timezone</label>
          <input value={tz} onChange={(e) => setTz(e.target.value)} />
          <div style={{ fontSize: 12, color: "#666" }}>Use IANA timezone like Asia/Kolkata or UTC</div>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600 }}>Actions</label>
          <button onClick={handleUseMyLocation} style={{ display: "block", marginBottom: 8 }}>Use my location</button>
          <a href={buildShareUrl()} onClick={(e) => e.preventDefault()} style={{ display: "inline-block", marginTop: 4 }} onMouseDown={() => { navigator.clipboard?.writeText(buildShareUrl()); alert("Share URL copied"); }}>
            Copy share URL
          </a>
        </div>
      </section>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ marginBottom: 12 }}>
        <strong>Selected:</strong> lat {lat.toFixed(4)} lon {lon.toFixed(4)} date {date} timezone {tz}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Legend:</strong>
        <span style={{ marginLeft: 8, padding: "4px 8px", background: "#2b8a3e", color: "white", borderRadius: 4 }}>Very Good</span>
        <span style={{ marginLeft: 8, padding: "4px 8px", background: "#4caf50", color: "white", borderRadius: 4 }}>Good</span>
        <span style={{ marginLeft: 8, padding: "4px 8px", background: "#f0ad4e", color: "#111", borderRadius: 4 }}>Neutral</span>
        <span style={{ marginLeft: 8, padding: "4px 8px", background: "#d9534f", color: "white", borderRadius: 4 }}>Bad</span>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {entries && (
        <div style={{ display: "grid", gap: 8 }}>
          {entries.map((e) => {
            const start = new Date(e.startUTC);
            const end = new Date(e.endUTC);
            const startLocal = start.toLocaleString(undefined, { timeZone: tz });
            const endLocal = end.toLocaleString(undefined, { timeZone: tz });
            const color =
              e.quality === "very_good" ? "#2b8a3e" : e.quality === "good" ? "#4caf50" : e.quality === "neutral" ? "#f0ad4e" : "#d9534f";
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: 12, borderRadius: 8, background: "#fafafa", alignItems: "center", border: "1px solid #eee" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 10, height: 40, background: color, borderRadius: 4 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{e.kind} <span style={{ color: "#666", fontWeight: 500 }}>({e.durationMinutes}m)</span></div>
                    <div style={{ color: "#555", fontSize: 14 }}>{startLocal} → {endLocal}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#333" }}>{e.quality.replace("_", " ")}</div>
                  <button onClick={() => { navigator.clipboard?.writeText(`${e.kind} ${startLocal} → ${endLocal}`); alert("Copied"); }} style={{ marginTop: 8 }}>Copy</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
