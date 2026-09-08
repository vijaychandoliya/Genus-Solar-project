import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // PORT wins when set, so a second dev server (another session, a preview
  // pane) can run alongside the default one instead of fighting it for 5173.
  server: { port: Number(process.env.PORT) || 5173, strictPort: false },

  build: {
    /* Raised from the 500 kB default to 600, for exactly one chunk.
       `charts.engine.js` is the ECharts build — trimmed to the two series types
       and five components this product actually registers, and still ~554 kB.
       It is fetched only when a chart mounts, so it is not in front of first
       paint, and there is nothing further to shake out of it.
       600 rather than "off": every OTHER chunk is under 410 kB, so anything
       that crosses this line is new and worth being told about. */
    chunkSizeWarningLimit: 600,
  },
});
