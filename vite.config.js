import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        article: resolve(__dirname, "src/article_detail_page/article.html"),
        saved: resolve(__dirname, "src/saved_articles/index.html"),
      },
    },
  },
});
