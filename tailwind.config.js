/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.html"],
  theme: {
    colors: {
      // 🎨 Paleta oficial NëWEMPY
      "green-brand": "#1A4D2E",
      "blue-brand": "#1E40AF",
      "gray-brand": "#374151",

      // 🎨 Colores heredados
      blue: {
        200: "#EBF3FE",
        300: "#539BFF",
        400: "#4784d9",
        500: "#ECF2FF",
        600: "#5D87FF",
        700: "#4f73d9",
      },
      cyan: {
        400: "#E8F7FF",
        500: "#49BEFF",
        600: "#3ea2d9",
      },
      teal: {
        400: "#E6FFFA",
        500: "#13DEB9",
        600: "#10bd9d",
      },
      yellow: {
        400: "#FEF5E5",
        500: "#FFAE1F",
        600: "#d9941a",
      },
      red: {
        400: "#FDEDE8",
        500: "#FA896B",
        600: "#d5745b",
      },
      gray: {
        100: "#ebf1f6",
        200: "#DFE5EF",
        400: "#e5eaef",
        500: "#5A6A85",
        600: "#2a3547",
        700: "#202936",
      },
      transparent: "transparent",
      white: "#ffffff",
    },

    fontFamily: {
      sans: ["Montserrat", "Inter", "Plus Jakarta Sans", "sans-serif"],
    },
    borderRadius: {
      none: "0px",
      md: "7px",
      full: "50%",
      "2xl": "15px",
      "3xl": "9999px",
    },

    extend: {
      // 🌟 Clases semánticas para NëWEMPY
      colors: {
        "bg-brand": "#1A4D2E",
        "text-brand": "#1E40AF",
        "hover-brand": "#1A4D2E",
        "btn-primary": "#1E40AF",
      },

      fontSize: {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
      },

      boxShadow: {
        md: "rgba(145,158,171,0.2) 0px 0px 2px 0px, rgba(145,158,171,0.12) 0px 12px 24px -4px",
        xl: "inset 0 1px 2px rgba(90,106,133,0.075)",
        neumorph: "8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff"
      },

      spacing: {
        "72": "18rem",
        "84": "21rem",
        "96": "24rem",
      },

      transitionDuration: {
        DEFAULT: "300ms",
      },

      opacity: {
        "85": "0.85",
      },
    },

    container: {
      center: true,
      padding: "20px",
    },
  },
  variants: {
    // Personalización futura si deseas agregar variantes personalizadas
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "base",
    }),
    require("@tailwindcss/typography"),
    require("preline/plugin"),
  ],
};