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

// Wrapper to fix TS inference for single date
const SingleDatePicker: React.FC<{
  selected: Date;
  onChange: (date: Date | null) => void;
  className?: string;
  dateFormat?: string;
}> = ({ selected, onChange, className, dateFormat }) => {
  const handleChange = (date: Date | [Date, Date] | null) => {
    if (Array.isArray(date)) {
      onChange(date[0]);
    } else {
      onChange(date);
    }
  };

  return (
    <DatePicker
      selected={selected}
      onChange={handleChange}
      className={className}
      dateFormat={dateFormat}
    />
  );
};

export default function Home() {
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 19.1667, lon: 72.85 });
  const [data, setData] = useState<{ sunrise: string; sunset: string; muhurats: Muhurat[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      const yesterday = new Date(today.getTime() - 86400000); // 24h in ms
      const tomorrow = new Date(today.getTime() + 86400000);

      const todayTimes = SunCalc.getTimes(today, location.lat, location.lon, 10);
      const yesterdayTimes = SunCalc.getTimes(yesterday, location.lat, location.lon, 10);
      const tomorrowTimes = SunCalc.getTimes(tomorrow, location.lat, location.lon, 10);

      const sunrise = todayTimes.sunrise!;
      const sunset = todayTimes.sunset!;
      const previousSunset = yesterdayTimes.sunset!;
      const nextSunrise = tomorrowTimes.sunrise!;

      const formatTime = (d: Date): string => d.toLocaleTimeString('en-IN', { hour12: false } as const);

      const todaySunriseStr = formatTime(sunrise);
      const todaySunsetStr = formatTime(sunset);

      const todayWeekday = today.getDay();
      const previousWeekday = yesterday.getDay();

      const daySequences: Record<number, string[]> = {
        0: ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sunday
        1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Labh', 'Amrit', 'Kaal'], // Monday (Drik)
        2: ['Rog', 'Udveg', 'Amrit', 'Shubh', 'Chal', 'Labh', 'Kaal', 'Rog'], // Tuesday
        3: ['Shubh', 'Amrit', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Chal', 'Shubh'], // Wednesday
        4: ['Kaal', 'Shubh', 'Chal', 'Udveg', 'Amrit', 'Rog', 'Labh', 'Kaal'], // Thursday
        5: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh'], // Friday
        6: ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Saturday
      };
      const nightSequences: Record<number, string[]> = {
        0: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh'], // Sunday night (Drik variant)
        1: ['Chal', 'Rog', 'Kaal', 'Labh', 'Shubh', 'Udveg', 'Amrit', 'Chal'], // Monday night
        2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Rog', 'Chal', 'Kaal'], // Tuesday night
        3: ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Labh', 'Kaal', 'Udveg'], // Wednesday night
        4: ['Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Shubh', 'Udveg', 'Amrit'], // Thursday night
        5: ['Rog', 'Kaal', 'Shubh', 'Udveg', 'Amrit', 'Chal', 'Labh', 'Rog'], // Friday night
        6: ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Udveg', 'Labh', 'Shubh'], // Saturday night
      };

      // Night muhurats
      const nightDuration = sunrise.getTime() - previousSunset.getTime();
      const nightPeriod = nightDuration / 8;
      const nightMuhurats: Muhurat[] = [];
      for (let i = 0; i < 8; i++) {
        const startTime = new Date(previousSunset.getTime() + i * nightPeriod);
        const endTime = new Date(previousSunset.getTime() + (i + 1) * nightPeriod);
        const name = nightSequences[previousWeekday][i];
        const effect = getEffect(name);
        nightMuhurats.push({ name, start: formatTime(startTime), end: formatTime(endTime), effect });
      }

      // Day muhurats
      const dayDuration = sunset.getTime() - sunrise.getTime();
      const dayPeriod = dayDuration / 8;
      const dayMuhurats: Muhurat[] = [];
      for (let i = 0; i < 8; i++) {
        const startTime = new Date(sunrise.getTime() + i * dayPeriod);
        const endTime = new Date(sunrise.getTime() + (i + 1) * dayPeriod);
        const name = daySequences[todayWeekday][i];
        const effect = getEffect(name);
        dayMuhurats.push({ name, start: formatTime(startTime), end: formatTime(endTime), effect });
      }

      setData({ sunrise: todaySunriseStr, sunset: todaySunsetStr, muhurats: [...nightMuhurats, ...dayMuhurats] });
    } catch (error) {
      console.error('Calculation error:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getEffect = (name: string): string => {
    const good = ['Labh', 'Shubh'];
    const veryGood = ['Amrit'];
    const normal = ['Chal'];
    const bad = ['Rog', 'Kaal', 'Udveg'];
    if (veryGood.includes(name)) return 'Very Good';
    if (good.includes(name)) return 'Good';
    if (normal.includes(name)) return 'Normal';
    if (bad.includes(name)) return 'Bad';
    return 'Normal';
  };

  const getEffectColor = (effect: string): string => {
    switch (effect) {
      case 'Very Good': return 'text-green-700 bg-green-100 border-green-200';
      case 'Good': return 'text-green-600 bg-green-50 border-green-100';
      case 'Normal': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Bad': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Panchang Choghadiya</h1>
        <div className="mb-8 text-center">
          <SingleDatePicker
            selected={date}
            onChange={(d: Date | null) => d && setDate(d)}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:border-blue-500"
            dateFormat="MMMM d, yyyy"
          />
          <p className="mt-3 text-sm text-gray-600">Location: Lat {location.lat.toFixed(4)}, Lon {location.lon.toFixed(4)}</p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Calculating muhurats...</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sunrise & Sunset</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <p className="text-lg"><span className="font-mono bg-yellow-100 px-2 py-1 rounded">Sunrise: {data.sunrise}</span></p>
                <p className="text-lg"><span className="font-mono bg-orange-100 px-2 py-1 rounded">Sunset: {data.sunset}</span></p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.muhurats.map((m, i) => (
                <div key={i} className={`p-4 rounded-lg shadow-md border ${getEffectColor(m.effect)} hover:shadow-lg transition-shadow`}>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{m.name}</h3>
                  <p className="text-sm mb-1"><span className="font-mono">Start:</span> {m.start}</p>
                  <p className="text-sm mb-3"><span className="font-mono">End:</span> {m.end}</p>
                  <p className={`text-sm font-semibold px-2 py-1 rounded-full text-center ${
                    m.effect === 'Very Good' ? 'bg-green-200 text-green-800' :
                    m.effect === 'Good' ? 'bg-green-100 text-green-700' :
                    m.effect === 'Normal' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {m.effect}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500 py-12">Error loading data. Please refresh and try again.</p>
        )}
      </div>
    </div>
  );
}