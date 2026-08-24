import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * Architectural boundaries, enforced.
 *
 * These rules are the ones docs/frontend-architecture.md §11 describes. They are
 * here rather than in a document because a boundary nobody can violate by
 * accident is worth more than one everybody agrees with.
 */
export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/lib/tokens.js", "src/tokens.css", "coverage"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,

      /* ── the architectural boundaries ─────────────────────────────────── */
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: ["**/mocks/**", "**/*.mock.*"],
            message:
              "Mocks are wired in app/bootstrap/container.ts. A module importing one directly has bypassed the seam, which is how 'swap the mock later' stops being true.",
          },
        ],
      }],

      /* Unused vars are an error, but an underscore prefix opts out — the
         standard signal for "deliberately ignored". */
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none",
      }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  /* The container is the ONE place allowed to import a mock. */
  {
    files: ["src/app/bootstrap/container.ts", "src/features/**/repository/*.mock.repository.ts"],
    rules: { "no-restricted-imports": "off" },
  },

  /* Tests may import anything — fixtures, mocks, internals. That is their job. */
  {
    files: ["**/*.test.{ts,tsx,js,jsx}", "src/test/**"],
    rules: { "no-restricted-imports": "off", "@typescript-eslint/no-explicit-any": "off" },
  },

  /* ── the legacy JavaScript ────────────────────────────────────────────
     62 .js/.jsx files predate this config and are not being rewritten here.
     Holding them to the same bar on day one would mean either a large risky
     sweep or a permanently red build, and both teach people to ignore the
     linter.

     So react-hooks findings are WARNINGS in legacy JS and ERRORS in new
     TypeScript, and the count should ratchet DOWN — the same discipline
     EXPECTED_DEFECTS applies to contrast. A warning here is a real finding
     waiting for an owner, not a rule we disagree with.

     The two genuine bugs found when the linter was introduced were FIXED, not
     downgraded: a conditional useMemo in components-tab.jsx that would have
     thrown "rendered fewer hooks than expected", and a deliberate NBSP in
     molecules.jsx now marked as deliberate. */
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-empty": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/use-memo": "warn",
      // Kept an ERROR even in legacy: a conditional hook is a crash, not a smell.
      "react-hooks/rules-of-hooks": "error",
    },
  },
);
