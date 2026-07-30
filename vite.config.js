import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@":           path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages":      path.resolve(__dirname, "./src/pages"),
      "@hooks":      path.resolve(__dirname, "./src/hooks"),
      "@context":    path.resolve(__dirname, "./src/context"),
      "@images":     path.resolve(__dirname, "./src/assets/images"),
      "@api":        path.resolve(__dirname, "./src/api"),
      "@services":   path.resolve(__dirname, "./src/services"),
      "@badges":     path.resolve(__dirname, "./src/assets/badges"),
    },
  },

  // Redirige toutes les requêtes vers index.html en dev
  // → permet le rechargement direct sur /topfilms, /profil, etc.
  server: {
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});