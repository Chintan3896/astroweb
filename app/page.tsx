"use client";

import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SunCalc from "suncalc";
import { CHOGHADIYA_DAY, CHOGHADIYA_NIGHT, getEffect } from "@/lib/choghadiya";
import ThemeSelector from "@/components/ThemeSelector";
import HeroSection from "@/components/HeroSection";
import MuhuratCard from "@/components/MuhuratCard";
import CurrentBanner from "@/components/CurrentBanner";

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 19.076, lon: 72.8777 });
  const [muhurats, setMuhurats] = useState<any[]>([]);
  const [sunInfo, setSunInfo] = useState({ sunrise: "", sunset: "" });
  const [theme, setTheme] = useState<"light" | "dark" | "warm">("light");
  const [current, setCurrent] = useState<any | null>(null);

  // get geolocation once
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

  // recalc on date/location change
  useEffect(() => {
    calculateChoghadiya();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, location]);

  // update current periodically
  useEffect(() => {
    findCurrentChoghadiya();
    const t = setInterval(findCurrentChoghadiya, 5_000); // every 5s
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

    // Day: sunrise -> sunset
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

    // Night: sunset -> next sunrise
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

  const grouped = useMemo(() => {
    return {
      day: muhurats.filter((m) => m.type === "day"),
      night: muhurats.filter((m) => m.type === "night"),
    };
  }, [muhurats]);

  return (
    <div className={`min-h-screen app-theme-${theme} transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <HeroSection
          location={location}
          current={current}
          sunInfo={sunInfo}
          date={date}
          setDate={setDate}
          theme={theme}
          setTheme={setTheme}
        />

        <div className="mt-6 space-y-4">
          <CurrentBanner current={current} theme={theme} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl p-4 bg-panel shadow-md border">
              <h3 className="text-sm font-semibold mb-2">Day Choghadiya</h3>
              <div className="space-y-3">
                {grouped.day.map((m, i) => (
                  <MuhuratCard key={i} muhurat={m} active={!!current && current.start.getTime() === m.start.getTime()} />
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 bg-panel shadow-md border">
              <h3 className="text-sm font-semibold mb-2">Night Choghadiya</h3>
              <div className="space-y-3">
                {grouped.night.map((m, i) => (
                  <MuhuratCard key={i} muhurat={m} active={!!current && current.start.getTime() === m.start.getTime()} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
