import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

const base = process.env.BASE_PATH || "./";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    outDir: "dist",
    assetsDir: "assets",
  },
});
