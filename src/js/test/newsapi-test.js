import { fetchLocalNews } from "../../js/api/newsapi";

async function loadNews() {
  const grid = document.getElementById("news-grid");

  try {
    const articles = await fetchLocalNews("us"); // change to your country code if you want
    grid.innerHTML = articles
      .slice(0, 12)
      .map(
        (a) => `
      <div class="news-card">
        <img src="${a.urlToImage || 'https://via.placeholder.com/360x200?text=No+Image'}" alt="${a.title}" />
        <div class="news-content">
          <h3>${a.title}</h3>
          <p>${a.description || ''}</p>
          <div class="news-meta">
            <span><strong>${a.source.name}</strong></span>
            <span>${a.author}</span>
            <span>${a.publishedAt}</span>
          </div>
          <a href="${a.url}" target="_blank">Read more</a>
        </div>
      </div>`
      )
      .join("");
  } catch (err) {
    grid.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

loadNews();
