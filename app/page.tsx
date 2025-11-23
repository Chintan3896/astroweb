"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SunCalc from "suncalc";
import { CHOGHADIYA_DAY, CHOGHADIYA_NIGHT, getEffect } from "@/lib/choghadiya";
import ThemeSelector from "@/components/ThemeSelector";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 19.0760, lon: 72.8777 });
  const [muhurats, setMuhurats] = useState([]);
  const [sunInfo, setSunInfo] = useState({ sunrise: "", sunset: "" });
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => console.log("Using default Mumbai")
    );
  }, []);

  useEffect(() => {
    calculateChoghadiya();
  }, [date, location]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour12: false });

  const calculateChoghadiya = () => {
    const sunrise = SunCalc.getTimes(date, location.lat, location.lon).sunrise;
    const sunset = SunCalc.getTimes(date, location.lat, location.lon).sunset;

    const weekday = date.getDay(); // 0 = Sun … 6 = Sat

    setSunInfo({
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset),
    });

    let results: any[] = [];

    // --- DAY CHOGHADIYA ---
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const dayPeriod = dayDuration / 8;

    for (let i = 0; i < 8; i++) {
      const start = new Date(sunrise.getTime() + i * dayPeriod);
      const end = new Date(sunrise.getTime() + (i + 1) * dayPeriod);
      const name = CHOGHADIYA_DAY[weekday][i];
      results.push({
        name,
        start: formatTime(start),
        end: formatTime(end),
        effect: getEffect(name),
        type: "day",
      });
    }

    // --- NIGHT CHOGHADIYA ---
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const tomorrowSunrise = SunCalc.getTimes(
      tomorrow,
      location.lat,
      location.lon
    ).sunrise;

    const nightDuration =
      tomorrowSunrise.getTime() - sunset.getTime();
    const nightPeriod = nightDuration / 8;

    for (let i = 0; i < 8; i++) {
      const start = new Date(sunset.getTime() + i * nightPeriod);
      const end = new Date(sunset.getTime() + (i + 1) * nightPeriod);
      const name = CHOGHADIYA_NIGHT[weekday][i];
      results.push({
        name,
        start: formatTime(start),
        end: formatTime(end),
        effect: getEffect(name),
        type: "night",
      });
    }

    setMuhurats(results);
  };

  return (
    <div className={`min-h-screen theme-${theme} px-4 py-6`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center text-4xl font-bold mb-6">
          Panchang Choghadiya
        </h1>

        <ThemeSelector theme={theme} setTheme={setTheme} />

        <div className="flex justify-center mb-3">
        <DatePicker
          selected={date}
          onChange={(d: Date | null) => {
            if (d) setDate(d);
          }}
          className="border px-3 py-2 rounded-lg"
          dateFormat="dd MMMM yyyy"
          selectsRange={false}
          selectsMultiple={false}
        />

        </div>

        <p className="text-center text-sm opacity-70 mb-6">
          Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
        </p>

        <div className="grid grid-cols-2 gap-4 text-center mb-8">
          <div className="p-4 card">
            <h4 className="font-semibold">Sunrise</h4>
            <p className="text-xl">{sunInfo.sunrise}</p>
          </div>
          <div className="p-4 card">
            <h4 className="font-semibold">Sunset</h4>
            <p className="text-xl">{sunInfo.sunset}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {muhurats.map((m, i) => (
            <div key={i} className="p-4 card hover:shadow-lg transition">
              <h3 className="text-xl font-semibold">{m.name}</h3>
              <p className="text-sm">{m.start} - {m.end}</p>
              <span className={`tag ${m.effect.toLowerCase()}`}>
                {m.effect}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
