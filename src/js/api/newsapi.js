export async function getGlobalNews() {
  const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
  if (!apiKey) throw new Error("Missing VITE_NEWS_KEY in .env");

  // Step 3: fetch news
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=8&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI HTTP ${res.status}`);

  const data = await res.json();
  if (data.status !== "ok") throw new Error(data.message || "NewsAPI error");

  return data.articles;
}
