export async function handler(event) {
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=8&apiKey=${process.env.NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch NewsAPI data" }),
    };
  }
}
