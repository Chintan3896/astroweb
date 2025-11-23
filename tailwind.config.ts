/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
  "app-theme-light",
  "app-theme-dark",
  "app-theme-warm",
  "bg-green-50", "bg-green-100",
  "bg-red-50", "bg-red-100",
  "bg-blue-50", "bg-blue-100",
  "bg-yellow-50", "bg-yellow-100",
  "ring-yellow-200",
  "scale-105",
  "hover:-translate-y-1",
  "bg-white/70",
  "bg-white/50",
  "text-muted",
  "bg-panel"
  ],
  theme: {
  extend: {},
  },
  plugins: [],
  };