/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '820px',
        'tablet-max': { 'max': '1180px' },
      },
      backgroundImage: {
        login: "url('/images/login_abstract.jpg')",
        cardGradient: "linear-gradient(45deg, #4F651E 0%, #82984E 56%, #B6C589 97%)",
        radialCardGradient: "radial-gradient(circle, #708936 0%, #5E742C 100%);",
        request_mask: "url('/images/request_mask.png')"
      },
      colors: {
        primary: "#4F651E",
        secondary: "#C6A936",
        border: "#E7E7E7",
        accent: "#D1E499",
        card: "#F8F8F8"
      },
      boxShadow: {
        paper: "rgb(0 0 0 / 23%) 0px 5px 15px",
        chart: "0px 4px 6px #0000001f"
      }
    },
  },
  plugins: [require("daisyui")],
}

