/**
 * TanStack Query configuration — 🟩 PRODUCTION.
 *
 * Defaults are set once here rather than per call, so every screen retries,
 * caches and refetches the same way. A per-hook override is a deliberate
 * exception, not the norm.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AppError } from "../../services/http/errors.js";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        // The HTTP client already retries idempotent requests with backoff.
        // Retrying again here would multiply the two — 2 × 3 = 6 attempts for
        // one failure — so Query's own retry is limited to the cases the client
        // deliberately does not handle.
        retry: (failureCount, error) =>
          error instanceof AppError && error.retryable && failureCount < 1,
        refetchOnWindowFocus: false,
      },
      // Never retry a mutation by default: a retried POST creates two rows.
      mutations: { retry: false },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // In state, not module scope, so tests and StrictMode get a fresh client and
  // one suite's cache cannot leak into the next.
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
