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
});
