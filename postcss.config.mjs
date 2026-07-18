/**
 * PostCSS configuration for Tailwind CSS v4.
 *
 * Tailwind v4 moved its PostCSS integration into a dedicated package
 * (`@tailwindcss/postcss`). There is no `tailwind.config.js` by default —
 * configuration now lives in CSS via `@theme` (see styles/globals.css).
 * Autoprefixer is bundled inside the Tailwind plugin, so it isn't listed here.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
