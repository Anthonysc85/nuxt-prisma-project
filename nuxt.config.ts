// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  srcDir: "./", // force root as source
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true, // forces Vite to detect changes reliably
        interval: 100,
      },
    },
  },
  runtimeConfig: {
    public: {
      mapboxToken: process.env.MAPBOX_TOKEN,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    },
  },
});
