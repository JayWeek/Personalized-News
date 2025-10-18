// src/js/api/mediastack.js
import { getUserLocation } from "./ipstack.js";

export async function getLocalNews(country = "us", limit = 9, filter = null) {
  const key = import.meta.env.VITE_MEDIASTACK_KEY;
  if (!key) throw new Error("Missing VITE_MEDIASTACK_KEY in .env");

  // Determine if filter is a category or a search query
  let categoryParam = "";
  let queryParam = "";

  if (filter) {
    const categories = ["technology", "sports", "business", "politics"];
    if (categories.includes(filter.toLowerCase())) {
      categoryParam = `&categories=${filter.toLowerCase()}`;
    } else {
      queryParam = `&keywords=${encodeURIComponent(filter)}`;
    }
  }

// Use user’s location if available
let resolvedCountry = country;

if (!resolvedCountry) {
  const loc = await getUserLocation();
  resolvedCountry = loc?.country_code?.toLowerCase() || "us";
}

// Construct the API URL
const url = `https://api.mediastack.com/v1/news?access_key=${key}&countries=${resolvedCountry.toLowerCase()}&limit=${limit}${categoryParam}${queryParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mediastack HTTP ${res.status}`);

  const data = await res.json();

  if (!data || !data.data) throw new Error("No data returned from Mediastack");

  // Filter out any incomplete articles
  const articles = data.data.filter(
    (a) => a.title && a.url && a.source && a.category
  );

  return articles;
}
