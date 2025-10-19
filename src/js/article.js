// src/js/article.js
// Loads header/footer partials, reads currentArticle from localStorage,
// renders the article and provides "Save for Later".

async function loadPartials() {
  const header = await fetch("/partials/header.html").then((r) => r.text());
  const footer = await fetch("/partials/footer.html").then((r) => r.text());
  document.getElementById("header").innerHTML = header;
  document.getElementById("footer").innerHTML = footer;
}

function fallbackImage() {
  // adjust path to your placeholder if different
  return "https://placehold.co/600x400?text=No+Image";
}

function isSaved(article) {
  try {
    const saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
    return saved.some(
      (a) =>
        (a.url && article.url && a.url === article.url) ||
        a.title === article.title,
    );
  } catch (e) {
    return false;
  }
}

function markSavedButton(btn) {
  btn.textContent = "Saved";
  btn.classList.remove("btn-outline-primary");
  btn.classList.add("btn-success");
  btn.disabled = true;
}

function createArticleHTML(article) {
  const image =
    article.urlToImage || article.image || article.image_url || fallbackImage();
  const published =
    article.publishedAt || article.published
      ? new Date(article.publishedAt || article.published).toLocaleString()
      : "";
  return `
    <div class="col-12">
      <div class="card mb-3 shadow-sm">
        <img src="${image}" alt="${article.title || "Article"}" class="card-img-top article-detail">
        <div class="card-body">
          <h1 class="card-title">${article.title || ""}</h1>
          <p class="text-muted mb-2">${article.source?.name || article.author || "Unknown Source"} ${published ? "• " + published : ""}</p>
          <p class="lead">${article.description || ""}</p>
          <div class="article-content mb-3">${article.content ? article.content : ""}</div>
          <div class="d-flex gap-2">
            <a href="${article.url || "#"}" target="_blank" rel="noopener" class="btn btn-outline-secondary">Read Original</a>
            <button id="save-article-btn" class="btn btn-outline-primary">Save for Later</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();

  const raw = localStorage.getItem("currentArticle");
  if (!raw) {
    document.getElementById("article-detail").innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">Article not found. Return to <a href="../index.html">home</a>.</div>
      </div>`;
    return;
  }

  let article;
  try {
    article = JSON.parse(raw);
  } catch (e) {
    document.getElementById("article-detail").innerHTML =
      `<div class="alert alert-danger">Error reading article.</div>`;
    return;
  }

  document.getElementById("article-detail").innerHTML =
    createArticleHTML(article);

  const btn = document.getElementById("save-article-btn");
  if (isSaved(article)) {
    markSavedButton(btn);
  }

  btn.addEventListener("click", () => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
      const exists = saved.some(
        (a) =>
          (a.url && article.url && a.url === article.url) ||
          a.title === article.title,
      );
      if (!exists) {
        saved.unshift(article); // newest first
        localStorage.setItem("savedArticles", JSON.stringify(saved));
      }
      markSavedButton(btn);
      // optional: show a toast or alert here if you want UX feedback
    } catch (e) {
      console.error("Save failed", e);
    }
  });
});
