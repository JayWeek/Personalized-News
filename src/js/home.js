// src/js/home.js
import { getUserLocation } from "../js/api/ipstack.js";
import { getLocalNews } from "../js/api/mediastack.js";
import { getGlobalNews } from "../js/api/newsapi.js";

// Load header and footer
async function loadPartials() {
  const header = await fetch("./partials/header.html").then((res) => res.text());
  const footer = await fetch("./partials/footer.html").then((res) => res.text());
  document.getElementById("header").innerHTML = header;
  document.getElementById("footer").innerHTML = footer;
}

// Render headline
function renderHeadline(article) {
  const headline = document.getElementById("headline");

  // Fix: ensure fallback image works even if image property is empty or invalid
  let imageUrl = article.image && article.image.trim() !== "" ? article.image : "https://placehold.co/600x400";

  headline.innerHTML = `
    <div class="position-relative overflow-hidden rounded shadow-sm">
      <img 
        src="${imageUrl}" 
        alt="${article.title || 'Headline image'}" 
        class="img-fluid w-100 headline-img" 
        style="object-fit: cover; height: 400px;" 
        onerror="this.onerror=null; this.src='https://placehold.co/600x400';"
      >
      <div class="headline-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4" style="background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);">
        <h2 class="headline-title text-white fw-bold mb-2">${article.title}</h2>
        <p class="headline-desc text-light mb-3">${article.description || ""}</p>
        <a href="${article.url}" target="_blank" class="btn btn-primary align-self-start">Read More</a>
      </div>
    </div>
  `;
}

// Render Local News (3 rows × 4 columns, no duplicates)
function renderLocalNews(articles) {
  const localNews = document.getElementById("local-news");
  localNews.innerHTML = "";

  // ✅ Deduplicate by title or URL (whichever unique)
  const seen = new Set();
  const uniqueArticles = articles.filter((a) => {
    const key = a.title?.trim().toLowerCase() || a.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ✅ Limit to 12 unique cards max
  const limited = uniqueArticles.slice(0, 12);

  limited.forEach((article) => {
    // ✅ Reliable fallback image
    const imageUrl =
      article.image && article.image.trim() !== ""
        ? article.image
        : "https://placehold.co/600x400";

    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6 col-sm-12";

    col.innerHTML = `
      <div class="card h-100 shadow-sm overflow-hidden">
        <img 
          src="${imageUrl}" 
          alt="${article.title || "Local news image"}" 
          class="card-img-top" 
          style="object-fit: cover; height: 200px;" 
          onerror="this.onerror=null; this.src='https://placehold.co/600x400';"
        >
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title">${article.title}</h5>
            <p class="card-text text-muted small">${article.description || ""}</p>
          </div>
          <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">Read More</a>
        </div>
      </div>
    `;

    localNews.appendChild(col);
  });
}

// Render Global News (3 rows, 1 per row)
function renderGlobalNews(articles) {
  const globalNews = document.getElementById("global-news");
  globalNews.innerHTML = "";

  const limited = articles.slice(0, 3);
  limited.forEach((article) => {
    const row = document.createElement("div");
    row.className = "col-12";
    row.innerHTML = `
      <div class="card shadow-sm h-100">
        <img src="${article.urlToImage || "./assets/placeholder.jpg"}" class="card-img-top" alt="${article.title}">
        <div class="card-body">
          <h6 class="card-title">${article.title}</h6>
          <p class="card-text">${article.description || ""}</p>
          <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-secondary mt-2">Read</a>
        </div>
      </div>
    `;
    globalNews.appendChild(row);
  });
}

async function init() {
  await loadPartials();

  try {
    // 1️⃣ Detect user location
    // const location = await getUserLocation();
    const countryCode = "us" //location.country_code;

    // 2️⃣ Fetch data
    const localNews = await getLocalNews(countryCode, 12);
    const globalNews = await getGlobalNews(3);

    // 3️⃣ Render to DOM
    if (localNews.length > 0) {
      renderHeadline(localNews[0]); // Headline (first item)
      renderLocalNews(localNews.slice(1)); // The rest (max 12)
    }
    renderGlobalNews(globalNews);
  } catch (err) {
    console.error("Error loading news:", err);
  }
}

init();
