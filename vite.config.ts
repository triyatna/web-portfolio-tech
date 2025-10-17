// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const base = env.BASE_PATH ?? (globalThis as any).process?.env?.BASE_PATH ?? "/";

  return {
    base,
    plugins: [react(), tailwindcss()],
    build: {
      sourcemap: false,
      outDir: "dist",
      assetsDir: "assets",
      rollupOptions: {
        output: {
          entryFileNames: "assets/js/[name]-[hash].js",
          chunkFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name?.toLowerCase() ?? "";
            const ext = name.split(".").pop() ?? "";
            const img = new Set([
              "png",
              "jpg",
              "jpeg",
              "gif",
              "webp",
              "avif",
              "svg",
              "ico",
              "bmp",
              "tiff",
            ]);
            const fonts = new Set(["woff", "woff2", "ttf", "otf", "eot"]);
            const media = new Set([
              "mp4",
              "webm",
              "ogg",
              "mp3",
              "wav",
              "flac",
              "aac",
              "m4a",
              "3gp",
            ]);

            if (img.has(ext)) return "assets/images/[name]-[hash][extname]";
            if (fonts.has(ext)) return "assets/fonts/[name]-[hash][extname]";
            if (media.has(ext)) return "assets/media/[name]-[hash][extname]";
            if (ext === "css") return "assets/css/[name]-[hash][extname]";
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
  };
});
