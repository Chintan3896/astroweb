export default function ThemeSelector({
    theme,
    setTheme,
  }: {
    theme: string;
    setTheme: (s: string) => void;
  }) {
    return (
      <div className="flex justify-center mb-6">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="frosted">Frosted Glass</option>
          <option value="warm">Warm</option>
        </select>
      </div>
    );
  }
  