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
        "primary": "#006a63",
        "primary-container": "#00a69c",
        "primary-fixed": "#7af6eb",
        "primary-fixed-dim": "#5bdacf",
        "on-primary": "#ffffff",
        "on-primary-container": "#003330",
        "secondary": "#5f5e5e",
        "secondary-container": "#e2dfde",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#636262",
        "tertiary": "#984624",
        "tertiary-container": "#db7a53",
        "on-tertiary": "#ffffff",
        "surface": "#f9f9f9",
        "surface-white": "#FFFFFF",
        "surface-dim": "#dadada",
        "surface-bright": "#f9f9f9",
        "surface-container": "#eeeeee",
        "surface-container-low": "#f4f3f3",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#3c4947",
        "outline": "#6c7a78",
        "outline-variant": "#bbc9c7",
        "background": "#f9f9f9",
        "on-background": "#1a1c1c",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f1f1f1",
        "error": "#ba1a1a",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "margin-mobile": "16px",
        "container-max": "1280px",
        "unit": "4px",
        "gutter": "24px",
        "margin-desktop": "64px"
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
