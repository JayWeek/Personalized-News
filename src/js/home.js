import { getUserLocation } from "../js/api/ipstack.js";
import { getLocalNews } from "../js/api/mediastack.js";
import { getGlobalNews } from "../js/api/mediastack.js";

// Load header/footer
async function loadPartials() {
  const header = await fetch("./partials/header.html").then((res) =>
    res.text(),
  );
  const footer = await fetch("./partials/footer.html").then((res) =>
    res.text(),
  );
  document.getElementById("header").innerHTML = header;
  document.getElementById("footer").innerHTML = footer;
}

// ✅ Update local section title dynamically
function updateLocalTitle(titleText) {
  const title = document.getElementById("local-news-title");
  const mainHeading = document.getElementById("local-news-heading");
  if (title) title.textContent = titleText;
  if (mainHeading) mainHeading.textContent = titleText;
}

// ✅ Render Headline (unchanged except fallback image fix)
function renderHeadline(article) {
  const headline = document.getElementById("headline");
  const imageUrl =
    article.urlToImage ||
    article.image ||
    article.image_url ||
    "https://placehold.co/600x400?text=No+Image";
  headline.innerHTML = `
    <div class="position-relative overflow-hidden rounded shadow-sm" style="min-height:400px;">
      <img src="${imageUrl}" alt="${article.title}" class="img-fluid w-100 headline-img" style="object-fit:cover;height:400px;">
      <div class="headline-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4" style="background:linear-gradient(to top,rgba(0,0,0,0.6),transparent);">
        <h2 class="headline-title text-white fw-bold mb-2">${article.title}</h2>
        <p class="headline-desc text-light mb-3">${article.description || ""}</p>
        <button class="btn btn-primary align-self-start read-more-btn" data-article='${encodeURIComponent(JSON.stringify(article))}'>Read More</button>
      </div>
    </div>
  `;
}

// ✅ Render Local News (deduplicated, fixed heights)
function renderLocalNews(articles) {
  const localNews = document.getElementById("local-news");
  localNews.innerHTML = "";
  const seen = new Set();
  const uniqueArticles = articles.filter((a) => {
    const key = a.title?.trim().toLowerCase() || a.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const limited = uniqueArticles.slice(0, 9);
  limited.forEach((article) => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6 col-sm-12";
    const img =
      article.urlToImage ||
      article.image ||
      article.image_url ||
      "https://placehold.co/600x400?text=No+Image";
    col.innerHTML = `
      <div class="card h-100 shadow-sm" style="height:420px;">
        <img src="${img}" class="card-img-top" alt="${article.title}" style="height:180px;object-fit:cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${article.title}">${article.title}</h5>
          <p class="card-text flex-grow-1" style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;">${article.description || ""}</p>
          <button class="btn btn-sm btn-outline-secondary mt-2 read-more-btn" data-article='${encodeURIComponent(JSON.stringify(article))}'>Read More</button>

        </div>
      </div>
    `;
    localNews.appendChild(col);
  });
}

//  Render Global News
function renderGlobalNews(articles) {
  const globalNews = document.getElementById("global-news");
  globalNews.innerHTML = "";

  const limited = articles.slice(0, 3);
  limited.forEach((article) => {
    const img =
      article.image ||
      article.urlToImage ||
      article.image_url ||
      "./assets/placeholder.jpg";

    const description =
      article.description ||
      article.title ||
      "Click below to read the full story.";

    const row = document.createElement("div");
    row.className = "col-12";
    row.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${img}" class="card-img-top" alt="${article.title}">
        <div class="card-body">
          <h6 class="card-title">${article.title}</h6>
          <p class="card-text">${description}</p>
          <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-secondary mt-2">Read</a>
        </div>
      </div>
    `;
    globalNews.appendChild(row);
  });
}

// ✅ Load category or search results dynamically
async function loadLocalNewsByCategory(category = null, query = null) {
  try {
    updateLocalTitle("Loading...");
    let articles = [];
    if (query) {
      // 🔍 Search
      articles = await getLocalNews("us", 9, query);
      updateLocalTitle(`Search results for "${query}"`);
    } else if (category) {
      // 🗂 Category
      articles = await getLocalNews("us", 9, category);
      updateLocalTitle(
        `Trending in ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      );
    } else {
      // Default local
      const location = await getUserLocation();
      articles = await getLocalNews(location.country_code || "us", 9);
      updateLocalTitle("Local News");
    }

    if (articles.length > 0) {
      renderHeadline(articles[0]);
      renderLocalNews(articles.slice(1));
    } else {
      document.getElementById("local-news").innerHTML =
        "<p>No articles found.</p>";
    }
  } catch (err) {
    console.error("Error loading local news:", err);
  }
}

async function init() {
  await loadPartials();

  // Wait for DOM update
  setTimeout(async () => {
    // Load initial data
    await loadLocalNewsByCategory();
    // Fetch global news via Netlify Function proxy to avoid HTTP 426
    // ✅ Fetch global news directly from Mediastack
    try {
      const globalNews = await getGlobalNews(6);
      renderGlobalNews(globalNews);
    } catch (err) {
      console.error("Failed to load global news:", err);
    }

    // 🗂 Category click
    document.querySelectorAll(".category-link").forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;
        await loadLocalNewsByCategory(category);
      });
    });

    // 🔍 Search form
    const searchForm = document.getElementById("search-form");
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = document.getElementById("search-input").value.trim();
      if (query) await loadLocalNewsByCategory(null, query);
    });
  }, 300);
}

init();

// Intercept read-more buttons created above and navigate to article detail
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".read-more-btn");
  if (!btn) return;
  e.preventDefault();
  const raw = btn.getAttribute("data-article");
  if (!raw) return;
  try {
    const article = JSON.parse(decodeURIComponent(raw));
    localStorage.setItem("currentArticle", JSON.stringify(article));
    // article detail page relative to src/ folder
    window.location.href = "/article_detail_page/article.html";
  } catch (err) {
    console.error("Failed to open article", err);
  }
});
