import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: process.env.DEPLOY_TARGET === "node" ? { preset: "node-server" } : undefined,
  // إضافة إعدادات Vite المباشرة هنا
  vite: {
    preview: {
      host: "0.0.0.0",
      port: 10000,
      allowedHosts: ["staad-tv-platform.onrender.com"]
    },
    server: {
      host: "0.0.0.0",
      port: 10000,
      allowedHosts: ["staad-tv-platform.onrender.com"]
    }
  }
});
