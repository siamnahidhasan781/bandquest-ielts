/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f7",
          100: "#d9e2ef",
          200: "#b3c5dd",
          300: "#8aa3c7",
          400: "#5f7fae",
          500: "#3d5f8f",
          600: "#2c4a73",
          700: "#1f3a5c",
          800: "#16294a",
          900: "#0f1f3d",
          950: "#0a162e",
        },
        accent: {
          50: "#effafb",
          100: "#d7f1f4",
          200: "#b0e3e9",
          300: "#7dcfd9",
          400: "#45b3c2",
          500: "#2797a8",
          600: "#237a88",
          700: "#21646f",
          800: "#21525c",
          900: "#21454e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};