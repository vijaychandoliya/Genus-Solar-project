import { AppError, isAbort } from "./errors.js";

/**
 * Retry idempotent requests only.
 *
 * A retried POST creates two alarm rules, which is worse than one visible
 * failure. So the default is deliberately narrow — GET and HEAD — and anything
 * else must opt in explicitly, having convinced itself the endpoint is
 * idempotent. Making retry the default everywhere is how duplicate writes get
 * shipped by a helpful abstraction.
 */
const IDEMPOTENT = new Set(["GET", "HEAD", "OPTIONS"]);

export interface RetryPolicy {
  attempts?: number;
  baseDelayMs?: number;
}

export async function withRetry<T>(
  run: () => Promise<T>,
  { policy, method }: { policy?: RetryPolicy | undefined; method: string },
): Promise<T> {
  const attempts = policy?.attempts ?? (IDEMPOTENT.has(method) ? 2 : 0);
  const base = policy?.baseDelayMs ?? 250;

  let lastError: unknown;
  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      // A cancelled request is not a failure to retry — the caller left.
      if (isAbort(error)) throw error;
      if (!(error instanceof AppError) || !error.retryable) throw error;
      if (attempt === attempts) throw error;
      // Exponential, with jitter so a fleet of tabs does not retry in lockstep.
      const delay = base * 2 ** attempt + Math.random() * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
