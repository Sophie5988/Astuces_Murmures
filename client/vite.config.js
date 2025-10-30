// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Redirige toutes les requêtes /api/... vers ton backend local
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        // /api/user  ->  http://localhost:5000/user
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "react-helmet-async": "@dr.pogodin/react-helmet",
      "@": path.resolve(__dirname, "src"),
    },
  },
});
