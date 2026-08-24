import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * Vitest runs the SAME transform pipeline as the app — same plugin, same alias —
 * so a test cannot pass against a differently-compiled module than the one that
 * ships. Kept separate from vite.config.js only because that file is still .js;
 * merge them when the config itself migrates.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
    coverage: {
      provider: "v8",
      // The token engine and generated output are excluded on purpose: the
      // engine's gate is `npm run tokens`, which scores 2,250 real contrast
      // rows. Line coverage would be a worse measure of it, not a better one.
      exclude: ["src/lib/tokens.js", "src/tokens/**", "src/test/**", "**/*.d.ts", "**/mocks/**"],
    },
  },
});
