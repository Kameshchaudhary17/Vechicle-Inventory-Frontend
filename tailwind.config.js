/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecdff",
          400: "#58b0ff",
          500: "#2d8fff",
          600: "#1872f0",
          700: "#145cd1",
          800: "#174ba5",
          900: "#183f82",
          950: "#122851"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(18,40,81,0.15)"
      }
    }
  },
  plugins: []
};
