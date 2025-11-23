"use client";

export default function ThemeSelector({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <div className="inline-flex items-center gap-3">
      <select value={theme} onChange={(e) => setTheme(e.target.value)} className="rounded-lg px-3 py-2 bg-white/10 border">
        <option value="indigo">Indigo & Gold</option>
        <option value="warm">Warm Saffron</option>
        <option value="frost">Frosted Glass</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
