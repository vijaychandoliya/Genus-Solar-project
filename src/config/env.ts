/**
 * The only module that reads `import.meta.env`.
 *
 * Validated at load, so a missing or malformed variable is a boot failure with a
 * readable message rather than `undefined` surfacing three screens later as a
 * request to `undefined/api/devices`.
 *
 * ── What is safe to put in a VITE_ variable ───────────────────────────────
 * Nothing secret. Vite inlines every `VITE_*` value into the bundle as a literal
 * string at build time — not obscured, not minified away, readable by anyone who
 * opens devtools. Base URLs, timeouts and feature flags are fine. API keys,
 * client secrets and bearer credentials are not, and for a platform handling
 * SBPDCL consumer data a key in a bundle is a disclosed credential permanently,
 * across every cached copy. Anything genuinely secret is held by the backend,
 * which exposes an endpoint instead.
 */

export type DataSource = "mock" | "api";

const raw = import.meta.env;

function required(key: string, fallback?: string): string {
  const value = (raw[key] as string | undefined) ?? fallback;
  if (value === undefined || value === "")
    throw new Error(
      `Missing environment variable ${key}. Copy .env.example to .env.local and fill it in.`,
    );
  return value;
}

function positiveInt(key: string, fallback: string): number {
  const value = Number(required(key, fallback));
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`${key} must be a positive number, got "${raw[key]}"`);
  return value;
}

function dataSource(): DataSource {
  const value = required("VITE_DATA_SOURCE", raw.DEV ? "mock" : "api");
  if (value !== "mock" && value !== "api")
    throw new Error(`VITE_DATA_SOURCE must be "mock" or "api", got "${value}"`);
  return value;
}

export const env = Object.freeze({
  mode: raw.MODE,
  isDev: raw.DEV,
  isProd: raw.PROD,

  apiBaseUrl: required("VITE_API_BASE_URL", raw.DEV ? "http://localhost:8080/api" : undefined),
  apiTimeoutMs: positiveInt("VITE_API_TIMEOUT", "15000"),

  /**
   * THE switch between fixtures and a real backend. Read in exactly one other
   * place — `app/bootstrap/container.ts`. Nothing else in the application is
   * permitted to branch on it, because a second branch is how "swap the mock
   * later" quietly stops being true.
   */
  dataSource: dataSource(),

  enableLogging: ((raw.VITE_ENABLE_LOGGING as string | undefined) ?? String(raw.DEV)) === "true",
});

export type Env = typeof env;
