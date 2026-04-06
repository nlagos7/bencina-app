import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api-cne": {
        target: "https://api.cne.cl",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-cne/, ""),
      },
      "/api-osrm": {
        target: "https://router.project-osrm.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-osrm/, ""),
      },
    },
  },
});
