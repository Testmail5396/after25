/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FBF4EC",
          50: "#FFFDFB",
          100: "#FBF4EC",
          200: "#F5E9D8",
          300: "#EEDCC2",
        },
        blush: {
          DEFAULT: "#F3D6D9",
          100: "#FBEEEF",
          200: "#F3D6D9",
          300: "#E9B7BD",
          400: "#DE97A0",
        },
        cocoa: {
          DEFAULT: "#4A2E23",
          50: "#F0E8E4",
          400: "#7A5240",
          500: "#5C3A2C",
          600: "#4A2E23",
          700: "#33201A",
          800: "#241511",
        },
        berry: {
          DEFAULT: "#8A2E4F",
          100: "#F6E3EA",
          400: "#A8446A",
          500: "#8A2E4F",
          600: "#6E2340",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(74, 46, 35, 0.08)",
        card: "0 1px 3px rgba(74, 46, 35, 0.06), 0 1px 2px rgba(74, 46, 35, 0.04)",
      },
    },
  },
  plugins: [],
};
