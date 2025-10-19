// saved.js - placed in src/saved_articles/saved.js
async function loadPartials() {
  const header = await fetch("../public/partials/header.html").then((r) =>
    r.text(),
  );
  const footer = await fetch("../public/partials/footer.html").then((r) =>
    r.text(),
  );
  document.getElementById("header").innerHTML = header;
  document.getElementById("footer").innerHTML = footer;
}

function fallbackImage() {
  return "../public/images/placeholder.jpg";
}

function renderCard(article, index) {
  const img =
    article.urlToImage ||
    article.image ||
    article.image_url ||
    "https://placehold.co/600x400?text=No+Image";
  const title = article.title || "Untitled";
  const desc = article.description;
  // ? article.description.slice(0, 200) +
  //   (article.description.length > 200 ? "..." : "")
  // : "";

  return `
    <div class="col-12 col-md-6 col-lg-4 mb-4">
      <div class="card h-100 shadow-sm">
        <img
          src="${img}"
          class="card-img-top"
          alt="${title}"
          style="width:100%; height:100%; object-fit:cover; border-bottom:1px solid #ddd;"
        >
        <div class="card-body d-flex flex-column">
          <h6 class="card-title text-truncate" title="${title}">${title}</h6>
          <p class="card-text flex-grow-1" style="
            overflow:hidden;
            text-overflow:ellipsis;
            display:-webkit-box;
            -webkit-line-clamp:4;
            -webkit-box-orient:vertical;
          ">${desc}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary read-saved" data-index="${index}">Read More</button>
            <button class="btn btn-sm btn-outline-danger remove-saved" data-index="${index}">Remove</button>
            <a href="${article.url || "#"}" target="_blank" class="btn btn-sm btn-outline-secondary ms-auto">Original</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function loadSaved() {
  const container = document.getElementById("saved-list");
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
  } catch (e) {
    saved = [];
  }
  if (!saved.length) {
    container.innerHTML =
      "<div class=\"col-12\"><div class=\"alert alert-info\">No saved articles yet.</div></div>";
    return;
  }
  container.innerHTML = saved.map((a, i) => renderCard(a, i)).join("");
  Array.from(document.getElementsByClassName("remove-saved")).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(btn.dataset.index);
      saved.splice(idx, 1);
      localStorage.setItem("savedArticles", JSON.stringify(saved));
      loadSaved();
    });
  });
  Array.from(document.getElementsByClassName("read-saved")).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(btn.dataset.index);
      localStorage.setItem("currentArticle", JSON.stringify(saved[idx]));
      // redirect to article detail page
      window.location.href = "/article_detail_page/article.html";
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  loadSaved();
});
