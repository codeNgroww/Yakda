import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-navy": "#1A2A4E",
        "brand-cyan": "#16A2D4",
        "brand-yellow": "#F4B21B",
        "brand-red": "#D93630",
        
        "primary": "#1A2A4E",
        "primary-container": "#16A2D4",
        "on-primary": "#ffffff",
        
        "secondary": "#16A2D4",
        "secondary-container": "#F4B21B",
        
        "tertiary": "#D93630",
        
        "surface": "#F9FAFB",
        "surface-white": "#FFFFFF",
        "surface-container": "#F3F4F6",
        "surface-container-high": "#E5E7EB",
        "surface-container-lowest": "#FFFFFF",
        
        "on-surface": "#1A2A4E",
        "on-surface-variant": "#4B5563",
        "outline": "#9CA3AF",
        "outline-variant": "#E5E7EB",
        "background": "#F9FAFB",
        "on-background": "#1A2A4E",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      fontFamily: {
        body: ["var(--font-fira-sans)", "sans-serif"],
        display: ["var(--font-fira-sans)", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
