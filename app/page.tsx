 'use client';

import { useState, useEffect } from 'react';
import { getPanchanga } from '@bidyashish/panchang';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Muhurat {
  name: string;
  start: string;
  end: string;
  effect: string;
}

export default function Home() {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ lat: 19.0760, lon: 72.8777 }); // Default: Mumbai
  const [timezone, setTimezone] = useState('Asia/Kolkata'); // Default IST
  const [data, setData] = useState<{ sunrise: string; sunset: string; muhurats: Muhurat[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          console.log('Using default location');
        }
      );
    }

    // Get timezone
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTz);

    fetchPanchang();
  }, [date, location, timezone]);

  const fetchPanchang = async () => {
    setLoading(true);
    try {
      const yesterday = new Date(date);
      yesterday.setDate(date.getDate() - 1);

      const panchangaYesterday = await getPanchanga(yesterday, location.lat, location.lon, timezone);
      const panchanga = await getPanchanga(date, location.lat, location.lon, timezone);

      const sunrise = panchanga.sunrise;
      const sunset = panchanga.sunset;
      const sunsetYesterday = panchangaYesterday.sunset;

      const nextSunrise = sunrise; // for night end

      const weekday = date.getDay(); // 0 = Sun
      const weekdayYesterday = yesterday.getDay();

      const muhurats = calculateChoghadiya(
        sunsetYesterday,
        sunrise,
        sunset,
        weekdayYesterday,
        weekday,
        timezone
      );

      setData({
        sunrise: sunrise.toLocaleTimeString([], { timeZone: timezone }),
        sunset: sunset.toLocaleTimeString([], { timeZone: timezone }),
        muhurats,
      });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChoghadiya = (
    sunsetYesterday: Date,
    sunrise: Date,
    sunset: Date,
    weekdayYesterday: number,
    weekday: number,
    tz: string
  ): Muhurat[] => {
    const muhurats: Muhurat[] = [];

    const daySequences = [
      ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
      ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh', 'Amrit'], // Mon
      ['Rog', 'Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
      ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Chal', 'Labh'], // Wed
      ['Shubh', 'Rog', 'Udveg', 'Chal', 'Kaal', 'Labh', 'Amrit', 'Shubh'], // Thu
      ['Chal', 'Labh', 'Shubh', 'Kaal', 'Udveg', 'Amrit', 'Rog', 'Chal'], // Fri
      ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Amrit', 'Chal', 'Labh', 'Kaal']  // Sat
    ];

    const nightSequences = [
      ['Shubh', 'Amrit', 'Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
      ['Chal', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Amrit', 'Shubh', 'Chal'], // Mon
      ['Kaal', 'Labh', 'Udveg', 'Amrit', 'Shubh', 'Chal', 'Rog', 'Kaal'], // Tue
      ['Udveg', 'Amrit', 'Rog', 'Chal', 'Labh', 'Shubh', 'Kaal', 'Udveg'], // Wed
      ['Amrit', 'Chal', 'Shubh', 'Kaal', 'Rog', 'Udveg', 'Labh', 'Amrit'], // Thu
      ['Rog', 'Kaal', 'Chal', 'Udveg', 'Amrit', 'Labh', 'Shubh', 'Rog'], // Fri
      ['Labh', 'Udveg', 'Amrit', 'Shubh', 'Chal', 'Kaal', 'Rog', 'Labh']  // Sat
    ];

    const effects: { [key: string]: string } = {
      Amrit: 'Very Good',
      Shubh: 'Good',
      Labh: 'Good',
      Chal: 'Normal',
      Rog: 'Bad',
      Kaal: 'Bad',
      Udveg: 'Bad'
    };

    // Night Choghadiya (previous night)
    const nightDuration = sunrise.getTime() - sunsetYesterday.getTime();
    const nightInterval = nightDuration / 8;
    const nightSequence = nightSequences[weekdayYesterday];

    for (let i = 0; i < 8; i++) {
      const startTime = new Date(sunsetYesterday.getTime() + i * nightInterval);
      const endTime = new Date(sunsetYesterday.getTime() + (i + 1) * nightInterval);
      const name = nightSequence[i];
      muhurats.push({
        name,
        start: startTime.toLocaleTimeString([], { timeZone: tz }),
        end: endTime.toLocaleTimeString([], { timeZone: tz }),
        effect: effects[name],
      });
    }

    // Day Choghadiya
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const dayInterval = dayDuration / 8;
    const daySequence = daySequences[weekday];

    for (let i = 0; i < 8; i++) {
      const startTime = new Date(sunrise.getTime() + i * dayInterval);
      const endTime = new Date(sunrise.getTime() + (i + 1) * dayInterval);
      const name = daySequence[i];
      muhurats.push({
        name,
        start: startTime.toLocaleTimeString([], { timeZone: tz }),
        end: endTime.toLocaleTimeString([], { timeZone: tz }),
        effect: effects[name],
      });
    }

    return muhurats;
  };

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case 'Very Good': return 'text-green-700';
      case 'Good': return 'text-green-500';
      case 'Normal': return 'text-blue-500';
      case 'Bad': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panchang for {date.toDateString()}</h1>
      <DatePicker selected={date} onChange={(d) => setDate(d!)} className="mb-4" />
      {loading ? (
        <p>Loading...</p>
      ) : data ? (
        <>
          <div className="mb-4">
            <p>Sunrise: {data.sunrise}</p>
            <p>Sunset: {data.sunset}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.muhurats.map((m, i) => (
              <div key={i} className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">{m.name}</h2>
                <p>Start: {m.start}</p>
                <p>End: {m.end}</p>
                <p className={getEffectColor(m.effect)}>Effect: {m.effect}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Error loading data</p>
      )}
    </div>
  );
}
