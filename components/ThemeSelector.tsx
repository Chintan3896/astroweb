"use client";

export default function ThemeSelector({ theme, setTheme }: { theme: string; setTheme: (s: string) => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-lg px-3 py-2 bg-white/10 border"
        aria-label="Select theme"
      >
        <option value="light">Light (Day)</option>
        <option value="dark">Dark (Night)</option>
        <option value="warm">Warm (Saffron)</option>
      </select>
    </div>
  );
}
