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

// Wrapper for DatePicker (TS fix)
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
  const [date, setDate] = useState<Date>(new Date('2025-11-23'));
  const [lat, setLat] = useState<number>(19.1667); // Goregaon default
  const [lon, setLon] = useState<number>(72.85);
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 19.1667, lon: 72.85 });
  const [data, setData] = useState<{ sunrise: string; sunset: string; muhurats: Muhurat[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Update location from inputs
    setLocation({ lat, lon });

    // Try geolocation, but allow manual override
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!lat || !lon) { // Only if not manually set
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        }
      },
      () => console.log('Using manual location: Mumbai/Goregaon')
    );
    fetchPanchang();
  }, [date, location.lat, location.lon]);

  const fetchPanchang = () => {
    setLoading(true);
    try {
      const today = new Date(date);
      const yesterday = new Date(today.getTime() - 86400000);
      const tomorrow = new Date(today.getTime() + 86400000);

      const todayTimes = SunCalc.getTimes(today, location.lat, location.lon);
      const yesterdayTimes = SunCalc.getTimes(yesterday, location.lat, location.lon);
      const tomorrowTimes = SunCalc.getTimes(tomorrow, location.lat, location.lon);

      const sunrise = todayTimes.sunrise!;
      const sunset = todayTimes.sunset!;
      const previousSunset = yesterdayTimes.sunset!;
      // nextSunrise not needed

      // Format in IST (force +5:30 if needed; browser default)
      const formatter = new Intl.DateTimeFormat('en-IN', { 
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
      const formatTime = (d: Date): string => {
        const parts = formatter.formatToParts(new Date(d.getTime() + 5.5 * 60 * 60 * 1000)); // Ensure IST offset if browser wrong
        return parts.map(p => p.value).join(':').slice(0, 8); // HH:MM:SS
      };

      const todaySunriseStr = formatTime(sunrise);
      const todaySunsetStr = formatTime(sunset);

      const todayWeekday = today.getDay();
      const previousWeekday = yesterday.getDay();

      const daySequences: Record<number, string[]> = {
        0: ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
        1: ['Chal', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Amrit', 'Labh', 'Chal'],
        2: ['Rog', 'Udveg', 'Amrit', 'Shubh', 'Chal', 'Labh', 'Kaal', 'Rog'],
        3: ['Labh', 'Amrit', 'Rog', 'Shubh', 'Chal', 'Kaal', 'Udveg', 'Labh'],
        4: ['Shubh', 'Rog', 'Labh', 'Chal', 'Udveg', 'Amrit', 'Kaal', 'Shubh'],
        5: ['Chal', 'Labh', 'Shubh', 'Kaal', 'Udveg', 'Rog', 'Amrit', 'Chal'],
        6: ['Kaal', 'Shubh', 'Chal', 'Udveg', 'Amrit', 'Rog', 'Labh', 'Kaal'],
      };
      const nightSequences: Record<number, string[]> = {
        0: ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Udveg', 'Labh', 'Shubh'],
        1: ['Chal', 'Rog', 'Kaal', 'Labh', 'Shubh', 'Udveg', 'Amrit', 'Chal'],
        2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Rog', 'Chal', 'Kaal'],
        3: ['Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Labh', 'Kaal', 'Udveg'],
        4: ['Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Shubh', 'Udveg', 'Amrit'],
        5: ['Rog', 'Kaal', 'Shubh', 'Udveg', 'Amrit', 'Chal', 'Labh', 'Rog'],
        6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh'],
      };

      // Night muhurats (previous sunset to sunrise)
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

      // Day muhurats (sunrise to sunset)
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
        <div className="mb-8 text-center space-y-4">
          <SingleDatePicker
            selected={date}
            onChange={(d: Date | null) => d && setDate(d)}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:border-blue-500"
            dateFormat="MMMM d, yyyy"
          />
          <div className="flex justify-center space-x-4 text-sm">
            <input
              type="number"
              step="any"
              placeholder="Lat (e.g., 19.1667)"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-24"
            />
            <input
              type="number"
              step="any"
              placeholder="Lon (e.g., 72.85)"
              value={lon}
              onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
              className="border rounded px-2 py-1 w-24"
            />
            <button onClick={() => { setLat(19.1667); setLon(72.85); }} className="px-3 py-1 bg-blue-500 text-white rounded">Mumbai Default</button>
          </div>
          <p className="text-sm text-gray-600">Using: Lat {location.lat.toFixed(4)}, Lon {location.lon.toFixed(4)}</p>
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
          <p className="text-center text-red-500 py-12">Error loading data. Check console & location.</p>
        )}
      </div>
    </div>
  );
}