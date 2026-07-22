import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Cloudflare Pages 運用では "/" のまま変更不要
  server: {
    host: true, // Codespaces 等コンテナ環境からのポートフォワーディングに対応
  },
});
