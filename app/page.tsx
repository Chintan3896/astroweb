'use client';

import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Muhurat {
  name: string;
  start: string;
  end: string;
  effect: string;
}

export default function Home() {
  const [date, setDate] = useState(new Date('2025-11-23')); // Default to screenshot date
  const [location, setLocation] = useState({ lat: 19.1667, lon: 72.85 }); // Default: Goregaon, Mumbai
  const [data, setData] = useState<{ sunrise: string; sunset: string; muhurats: Muhurat[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => console.log('Using default location: Mumbai')
    );
    fetchPanchang();
  }, [date, location]);

  const fetchPanchang = () => {
    setLoading(true);
    try {
      const today = new Date(date);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // Get times using SunCalc (pure JS)
      const todayTimes = SunCalc.getTimes(today, location.lat, location.lon);
      const yesterdayTimes = SunCalc.getTimes(yesterday, location.lat, location.lon);
      const tomorrowTimes = SunCalc.getTimes(tomorrow, location.lat, location.lon);

      const sunrise = todayTimes.sunrise;
      const sunset = todayTimes.sunset;
      const previousSunset = yesterdayTimes.sunset;
      const nextSunrise = tomorrowTimes.sunrise;

      // Format times
      const formatTime = (d: Date) => d.toLocaleTimeString('en-IN', { hour12: false });

      const todaySunriseStr = formatTime(sunrise);
      const todaySunsetStr = formatTime(sunset);

      // Weekday (0=Sun, 6=Sat)
      const todayWeekday = today.getDay();
      const previousWeekday = yesterday.getDay();

      // Sequences from standard Drik Panchang (8 periods, repeat first for 8th)
      const daySequences: { [key: number]: string[] } = {
        0: ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sunday
        1: ['Chal', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Amrit', 'Labh', 'Chal'], // Monday
        2: ['Rog', 'Udveg', 'Amrit', 'Shubh', 'Chal', 'Labh', 'Kaal', 'Rog'], // Tuesday
        3: ['Labh', 'Amrit', 'Rog', 'Shubh', 'Chal', 'Kaal', 'Udveg', 'Labh'], // Wednesday
        4: ['Shubh', 'Rog', 'Labh', 'Chal', 'Udveg', 'Amrit', 'Kaal', 'Shubh'], // Thursday
        5: ['Chal', 'Labh', 'Shubh', 'Kaal', 'Udveg', 'Rog', 'Amrit', 'Chal'], // Friday
        6: ['Kaal', 'Shubh', 'Chal', 'Udveg', 'Amrit', 'Rog', 'Labh', 'Kaal'], // Saturday
      };
      const nightSequences: { [key: number]: string[] } = {
        0: ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Udveg', 'Labh', 'Shubh'], // Sunday night
        1: ['Chal', 'Rog', 'Kaal', 'Labh', 'Shubh', 'Udveg', 'Amrit', 'Chal'], // Monday night
        2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Rog', 'Chal', 'Kaal'], // Tuesday night
        3: ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Labh', 'Kaal', 'Udveg'], // Wednesday night
        4: ['Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Shubh', 'Udveg', 'Amrit'], // Thursday night
        5: ['Rog', 'Kaal', 'Shubh', 'Udveg', 'Amrit', 'Chal', 'Labh', 'Rog'], // Friday night
        6: ['Labh', 'Udveg', 'Amrit', 'Rog', 'Shubh', 'Kaal', 'Chal', 'Labh'], // Saturday night
      };

      // Calculate night muhurats (previous sunset to sunrise, using previous weekday night sequence)
      const nightDuration = sunrise.getTime() - previousSunset.getTime();
      const nightPeriod = nightDuration / 8;
      const nightMuhurats: Muhurat[] = [];
      for (let i = 0; i < 8; i++) {
        const startTime = new Date(previousSunset.getTime() + i * nightPeriod);
        const endTime = new Date(previousSunset.getTime() + (i + 1) * nightPeriod);
        const name = nightSequences[previousWeekday][i];
        const effect = getEffect(name);
        nightMuhurats.push({
          name,
          start: formatTime(startTime),
          end: formatTime(endTime),
          effect,
        });
      }

      // Calculate day muhurats (sunrise to sunset, using today weekday day sequence)
      const dayDuration = sunset.getTime() - sunrise.getTime();
      const dayPeriod = dayDuration / 8;
      const dayMuhurats: Muhurat[] = [];
      for (let i = 0; i < 8; i++) {
        const startTime = new Date(sunrise.getTime() + i * dayPeriod);
        const endTime = new Date(sunrise.getTime() + (i + 1) * dayPeriod);
        const name = daySequences[todayWeekday][i];
        const effect = getEffect(name);
        dayMuhurats.push({
          name,
          start: formatTime(startTime),
          end: formatTime(endTime),
          effect,
        });
      }

      setData({
        sunrise: todaySunriseStr,
        sunset: todaySunsetStr,
        muhurats: [...nightMuhurats, ...dayMuhurats], // Full 16 for the day
      });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEffect = (name: string): string => {
    switch (name) {
      case 'Amrit': return 'Very Good';
      case 'Labh':
      case 'Shubh': return 'Good';
      case 'Chal':
      case 'Char': return 'Normal';
      case 'Rog':
      case 'Kaal':
      case 'Udveg': return 'Bad';
      default: return 'Normal';
    }
  };

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case 'Very Good': return 'text-green-700 bg-green-100';
      case 'Good': return 'text-green-500 bg-green-50';
      case 'Normal': return 'text-blue-500 bg-blue-50';
      case 'Bad': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Panchang Choghadiya for {date.toLocaleDateString('en-IN')}</h1>
      <div className="mb-6 text-center">
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d!)}
          className="border rounded px-3 py-2"
          dateFormat="MMMM d, yyyy"
        />
        <p className="mt-2 text-sm">Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
      </div>
      {loading ? (
        <p className="text-center">Calculating muhurats...</p>
      ) : data ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Sunrise & Sunset</h2>
            <p>Sunrise: <span className="font-mono">{data.sunrise}</span></p>
            <p>Sunset: <span className="font-mono">{data.sunset}</span></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.muhurats.map((m, i) => (
              <div key={i} className={`p-4 rounded-lg shadow ${getEffectColor(m.effect)}`}>
                <h3 className="font-bold text-lg">{m.name}</h3>
                <p className="text-sm">Start: <span className="font-mono">{m.start}</span></p>
                <p className="text-sm">End: <span className="font-mono">{m.end}</span></p>
                <p className={`text-sm font-medium ${m.effect === 'Very Good' ? 'text-green-700' : m.effect === 'Good' ? 'text-green-600' : m.effect === 'Normal' ? 'text-blue-600' : 'text-red-600'}`}>
                  Effect: {m.effect}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-red-500">Error loading data. Check console.</p>
      )}
    </div>
  );
}
