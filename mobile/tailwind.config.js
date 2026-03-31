/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1a6b3a",
        "primary-light": "#2d9e57",
        "primary-dark": "#0f4a28",
        danger: "#dc2626",
        warning: "#f59e0b",
        info: "#2563eb",
        surface: "#f8fafc"
      }
    }
  },
  plugins: []
};
