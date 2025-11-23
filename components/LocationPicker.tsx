// components/LocationPicker.tsx
import React, { useState } from "react";

type Props = {
  lat: number;
  lon: number;
  onChange: (coords: { lat: number; lon: number }) => void;
};

export default function LocationPicker({ lat: initialLat, lon: initialLon, onChange }: Props) {
  const [lat, setLat] = useState(String(initialLat));
  const [lon, setLon] = useState(String(initialLon));
  const [label, setLabel] = useState("");

  function apply() {
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    if (isNaN(la) || isNaN(lo)) {
      alert("Enter valid coordinates");
      return;
    }
    onChange({ lat: la, lon: lo });
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div>
        <label style={{ display: "block", fontWeight: 600 }}>Lat</label>
        <input value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: 120 }} />
      </div>
      <div>
        <label style={{ display: "block", fontWeight: 600 }}>Lon</label>
        <input value={lon} onChange={(e) => setLon(e.target.value)} style={{ width: 120 }} />
      </div>
      <div style={{ alignSelf: "flex-end" }}>
        <button onClick={apply} style={{ marginRight: 8 }}>Apply</button>
      </div>
      <div style={{ alignSelf: "flex-end" }}>
        <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      </div>
    </div>
  );
}
