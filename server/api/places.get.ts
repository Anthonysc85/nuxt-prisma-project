import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const { q, lat, lng } = getQuery(event);

  if (!q || !lat || !lng) {
    return { results: [] };
  }

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    q as string
  )}&location=${lat},${lng}&radius=50000&key=${
    process.env.GOOGLE_MAPS_API_KEY
  }`;

  try {
    const res = await $fetch(url);
    return res;
  } catch (err) {
    console.error("Google Places API error", err);
    return { results: [] };
  }
});
