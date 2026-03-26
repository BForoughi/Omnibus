import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This will redirect any requests to yourwebsite.com/api to the Express.js server
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
