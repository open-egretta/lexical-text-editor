import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["example"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "LexicalTextEditor",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "lexical",
        "@lexical/react",
        "@lexical/rich-text",
        "@lexical/list",
        "@lexical/link",
        "@lexical/selection",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // CSS 會被打包到 dist/style.css
        assetFileNames: (assetInfo) => {
          // 改用 names (陣列) 並使用 some 來檢查是否包含 .css 檔案
          if (assetInfo.names.some((n) => n.endsWith(".css"))) {
            return "style.css"; // 強制命名為 style.css
          }
          // 回傳第一個名稱作為預設值
          return assetInfo.names[0] || "";
        },
      },
    },
    cssCodeSplit: false, // 重要：將所有 CSS 打包成單一檔案
  },
});
