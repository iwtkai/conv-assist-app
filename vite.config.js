import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/conv-assist/", // ← GitHubリポジトリ名に合わせてください
});
