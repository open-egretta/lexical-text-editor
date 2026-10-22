import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // 套件以 file:.. 連結時，避免從上層 node_modules 載入第二份 React / Lexical
    dedupe: [
      "react",
      "react-dom",
      "lexical",
      "@lexical/react",
      "@lexical/html",
      "@lexical/code",
      "@lexical/table",
      "@lexical/markdown",
      "@lexical/rich-text",
      "@lexical/list",
      "@lexical/link",
      "@lexical/selection",
      "@lexical/utils",
    ],
  },
});
