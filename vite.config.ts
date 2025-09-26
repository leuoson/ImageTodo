import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEV_HOST = process.env.TAURI_DEV_HOST ?? "127.0.0.1";
const DEV_PORT = Number(process.env.VITE_DEV_PORT ?? 5173);
const HMR_PORT = DEV_PORT + 1;

export default defineConfig(async () => ({
  plugins: [react()],
  cacheDir: "node_modules/.vite",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  server: {
    host: DEV_HOST,
    port: DEV_PORT,
    strictPort: true,
    origin: `http://${DEV_HOST}:${DEV_PORT}`,
    hmr: {
      host: DEV_HOST,
      protocol: "ws",
      port: HMR_PORT,
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    target: ["es2020", "chrome107", "safari15"],
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
}));
