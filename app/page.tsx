"use client";

import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SunCalc from "suncalc";
import { motion } from "framer-motion";
import { CHOGHADIYA_DAY, CHOGHADIYA_NIGHT, getEffect } from "@/lib/choghadiya";
import ThemeSelector from "@/components/ThemeSelector";
import CurrentBanner from "@/components/CurrentBanner";
import MuhuratCard from "@/components/MuhuratCard";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 19.0760, lon: 72.8777 });
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [sunInfo, setSunInfo] = useState({ sunrise: "", sunset: "" });
  const [theme, setTheme] = useState("indigo");
  const [current, setCurrent] = useState<any | null>(null);

  // get user location once
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, location]);

  // recalc current every 10s so countdown and active highlighting stay accurate
  useEffect(() => {
    const t = setInterval(() => findCurrentChoghadiya(), 10000);
    return () => clearInterval(t);
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

    // day
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

    // night (sunset -> tomorrow sunrise)
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const tomorrowSunrise = SunCalc.getTimes(tomorrow, location.lat, location.lon).sunrise;
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
    const match = muhurats.find((m) => now >= m.start && now < m.end);
    setCurrent(match || null);
  };

  // Precompute grouped cards (day first then night)
  const grouped = useMemo(() => {
    const day = muhurats.filter((m) => m.type === "day");
    const night = muhurats.filter((m) => m.type === "night");
    return { day, night };
  }, [muhurats]);

  return (
    <div className={`min-h-screen bg-app-${theme} text-app-foreground`}>
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* hero background image (uploaded asset) */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url('/mnt/data/A_UI_design_of_a_Panchang_Choghadiya_application_i.png')` }}
            aria-hidden
          />
          <div className="relative p-8 md:p-12 bg-gradient-to-br from-black/10 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
                  Panchang <span className="text-gold">Choghadiya</span>
                </h1>
                <p className="mt-2 text-sm opacity-80 max-w-xl">
                  Accurate muhurat timings for your community — sunrise & sunset based, with traditional choghadiya sequences.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/8">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M12 2v4M12 18v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M2 12h4M18 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-sm">Location: {location.lat.toFixed(3)}, {location.lon.toFixed(3)}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/8">
                    <span className="text-sm">Date</span>
                    <DatePicker
                      selected={date}
                      onChange={(d: Date | null) => d && setDate(d)}
                      dateFormat="dd MMM yyyy"
                      className="bg-transparent outline-none text-sm ml-2"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <ThemeSelector theme={theme} setTheme={setTheme} />
              </div>
            </div>
          </div>
        </div>

        {/* Current banner */}
        <div className="mt-8">
          <CurrentBanner current={current} />
        </div>

        {/* Sun times */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="p-5 rounded-2xl bg-panel shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm opacity-80">Sunrise</h3>
                <div className="text-2xl font-bold">{sunInfo.sunrise || "—"}</div>
              </div>
              <div className="text-sm opacity-70">Local</div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-panel shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm opacity-80">Sunset</h3>
                <div className="text-2xl font-bold">{sunInfo.sunset || "—"}</div>
              </div>
              <div className="text-sm opacity-70">Local</div>
            </div>
          </motion.div>
        </div>

        {/* Cards grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="mb-4 text-lg font-semibold">Day Choghadiya</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.day.map((m, idx) => (
                <MuhuratCard key={idx} m={m} active={current && current.start.getTime() === m.start.getTime()} />
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">Night Choghadiya</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.night.map((m, idx) => (
                <MuhuratCard key={idx} m={m} active={current && current.start.getTime() === m.start.getTime()} />
              ))}
            </div>
          </div>
        </div>

        {/* mobile sticky mini current */}
        <div className="md:hidden fixed left-4 right-4 bottom-4 z-50">
          {current && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-xl p-4 bg-foreground/95 text-white shadow-2xl flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Current</div>
                <div className="font-bold">{current.name} • {current.endStr}</div>
              </div>
              <div className="text-sm opacity-80">{current.effect}</div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
