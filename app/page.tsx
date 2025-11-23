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
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [sunInfo, setSunInfo] = useState({ sunrise: "", sunset: "" });
  const [theme, setTheme] = useState("light");
  const [current, setCurrent] = useState<any | null>(null);

  // --- get user location ---
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => console.log("Using default Mumbai")
    );
  }, []);

  useEffect(() => {
    calculateChoghadiya();
  }, [date, location]);

  useEffect(() => {
    if (muhurats.length > 0) findCurrentChoghadiya();
  }, [muhurats]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour12: false });

  const calculateChoghadiya = () => {
    const sunrise = SunCalc.getTimes(date, location.lat, location.lon).sunrise;
    const sunset = SunCalc.getTimes(date, location.lat, location.lon).sunset;

    const weekday = date.getDay();

    setSunInfo({
      sunrise: formatTime(sunrise),
      sunset: formatTime(sunset),
    });

    const results: any[] = [];

    // --- DAY ---
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const dayPeriod = dayDuration / 8;

    for (let i = 0; i < 8; i++) {
      const start = new Date(sunrise.getTime() + i * dayPeriod);
      const end = new Date(sunrise.getTime() + (i + 1) * dayPeriod);
      const name = CHOGHADIYA_DAY[weekday][i];

      results.push({
        name,
        start,
        end,
        startStr: formatTime(start),
        endStr: formatTime(end),
        effect: getEffect(name),
        type: "day",
      });
    }

    // --- NIGHT ---
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const tomorrowSunrise = SunCalc.getTimes(
      tomorrow,
      location.lat,
      location.lon
    ).sunrise;

    const nightDuration = tomorrowSunrise.getTime() - sunset.getTime();
    const nightPeriod = nightDuration / 8;

    for (let i = 0; i < 8; i++) {
      const start = new Date(sunset.getTime() + i * nightPeriod);
      const end = new Date(sunset.getTime() + (i + 1) * nightPeriod);
      const name = CHOGHADIYA_NIGHT[weekday][i];

      results.push({
        name,
        start,
        end,
        startStr: formatTime(start),
        endStr: formatTime(end),
        effect: getEffect(name),
        type: "night",
      });
    }

    setMuhurats(results);
  };

  const findCurrentChoghadiya = () => {
    const now = new Date();
    const match = muhurats.find(m => now >= m.start && now < m.end);
    setCurrent(match || null);
  };

  return (
    <div className={`min-h-screen theme-${theme} px-5 py-6 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black`}>
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <h1 className="text-center text-4xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">
          Panchang Choghadiya
        </h1>

        <div className="flex justify-center mb-6">
          <ThemeSelector theme={theme} setTheme={setTheme} />
        </div>

        {/* CURRENT CHOGHADIYA PANEL */}
        {current && (
          <div className="
            p-5 rounded-2xl shadow-xl mb-8 text-center border
            bg-white/60 dark:bg-white/10 backdrop-blur-xl 
            border-white/30 dark:border-white/10
          ">
            <p className="text-2xl font-bold">{current.name}</p>
            <p className="text-sm opacity-70">Ends at {current.endStr}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-semibold
              ${current.effect === "Good" ? "bg-green-500/20 text-green-700 dark:text-green-300" :
                current.effect === "Neutral" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" :
                "bg-red-500/20 text-red-700 dark:text-red-300"}
            `}>
              {current.effect}
            </span>
          </div>
        )}

        {/* DATE PICKER */}
        <div className="flex justify-center mb-4">
          <div className="px-4 py-2 rounded-xl shadow bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10">
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => d && setDate(d)}
              dateFormat="dd MMMM yyyy"
              className="bg-transparent outline-none"
            />
          </div>
        </div>

        {/* LOCATION */}
        <p className="text-center text-sm opacity-70 mb-6">
          Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
        </p>

        {/* SUN TIMES */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "Sunrise", value: sunInfo.sunrise },
            { label: "Sunset", value: sunInfo.sunset },
          ].map((s, i) => (
            <div
              key={i}
              className="
                p-5 rounded-2xl shadow-lg text-center border 
                bg-white/70 dark:bg-white/10 backdrop-blur-xl
                border-white/30 dark:border-white/10
              "
            >
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">{s.label}</h4>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* MUHURAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {muhurats.map((m, i) => {
            const isActive = current && current.start.getTime() === m.start.getTime();

            return (
              <div
                key={i}
                className={`
                  p-5 rounded-2xl transition shadow-xl border cursor-pointer
                  bg-white/70 dark:bg-white/10 backdrop-blur-xl
                  border-white/30 dark:border-white/10 
                  hover:scale-[1.02] hover:shadow-2xl

                  ${isActive ? "ring-4 ring-yellow-400 shadow-2xl scale-[1.03]" : ""}
                `}
              >
                <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                <p className="text-sm opacity-80">{m.startStr} - {m.endStr}</p>

                <span className={`
                  inline-block mt-3 px-3 py-1 rounded-full text-sm font-semibold
                  ${m.effect === "Good" ? "bg-green-500/20 text-green-700 dark:text-green-300" :
                    m.effect === "Neutral" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" :
                    "bg-red-500/20 text-red-700 dark:text-red-300"}
                `}
                >
                  {m.effect}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
