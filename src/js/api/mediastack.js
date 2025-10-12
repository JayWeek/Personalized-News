export async function getLocalNews(countryCode = "us") {
  const key = import.meta.env.VITE_MEDIASTACK_KEY;
  if (!key) throw new Error("Missing VITE_MEDIASTACK_KEY in .env");

  const url = `https://api.mediastack.com/v1/news?access_key=${key}&countries=${countryCode}&limit=9`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

  const json = await res.json();
  if (json.error)
    throw new Error(json.error.info || JSON.stringify(json.error));

  return json.data; // Mediastack returns articles under "data"
}
