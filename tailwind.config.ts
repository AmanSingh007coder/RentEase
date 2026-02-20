// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
 content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}", // Points to your root app folder
  "./components/**/*.{js,ts,jsx,tsx,mdx}", // Points to your components folder
],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0052CC",    // Primary (Authority)
          charcoal: "#1F2937", // Text/Headings
          teal: "#0D9488",     // Success/Status
        },
        background: "#F9FAFB", // Off-white for less eye strain
      },
    },
  },
  plugins: [],
};
export default config;