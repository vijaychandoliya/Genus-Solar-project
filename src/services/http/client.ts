/**
 * The only `fetch` in the codebase.
 *
 * Everything a feature would otherwise re-implement — and re-implement slightly
 * differently each time — lives here once: base URL, auth header, timeout,
 * cancellation, retry, status handling, error normalisation, logging.
 *
 * A module that calls `fetch` directly has bypassed all of it. That is why the
 * dependency rules forbid it outside this file.
 */
import { env } from "../../config/env.js";
import { normaliseError, NetworkError, TimeoutError, isAbort } from "./errors.js";
import { withRetry, type RetryPolicy } from "./retry.js";
import { authHeader } from "../auth/token-storage.js";

const JSON_TYPE = "application/json";

export interface RequestOptions {
  /** From the caller — a React effect cleanup, or TanStack Query. */
  signal?: AbortSignal | undefined;
  timeoutMs?: number | undefined;
  retry?: RetryPolicy | undefined;
  headers?: Record<string, string> | undefined;
  /** Query parameters. `null`/`undefined`/`""` entries are dropped. */
  params?: Record<string, string | number | boolean | null | undefined> | undefined;
}

function buildUrl(path: string, params: RequestOptions["params"]): string {
  const url = `${env.apiBaseUrl}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== null && value !== undefined && value !== "") search.set(key, String(value));
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(
  path: string,
  method: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.params);
  const requestId = crypto.randomUUID();

  // Compose the caller's cancellation with our timeout, so "the user navigated
  // away" and "the server is slow" arrive downstream as the same kind of thing.
  const timeout = AbortSignal.timeout(options.timeoutMs ?? env.apiTimeoutMs);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

  const run = async (): Promise<T> => {
    const started = performance.now();
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        signal,
        headers: {
          Accept: JSON_TYPE,
          ...(body === undefined ? {} : { "Content-Type": JSON_TYPE }),
          "X-Request-Id": requestId,
          ...authHeader(),
          ...options.headers,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch (cause) {
      // `fetch` rejects only on network failure or abort — NEVER on 4xx/5xx.
      // Distinguishing our timeout from the caller's abort matters: one is a
      // problem to report, the other is a component that unmounted.
      if (timeout.aborted)
        throw new TimeoutError(`${method} ${path} timed out after ${options.timeoutMs ?? env.apiTimeoutMs}ms`, { requestId, cause });
      if (isAbort(cause)) throw cause;
      throw new NetworkError(`${method} ${path} could not reach the server`, { requestId, cause });
    }

    if (env.enableLogging)
      console.debug(`[http] ${method} ${path} → ${response.status} (${Math.round(performance.now() - started)}ms)`, { requestId });

    if (!response.ok) throw await normaliseError(response, { requestId, method, path });
    if (response.status === 204) return null as T;
    return (await response.json()) as T;
  };

  return withRetry(run, { policy: options.retry, method });
}

export const http = {
  get:    <T>(path: string, options?: RequestOptions) => request<T>(path, "GET", undefined, options),
  post:   <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, "POST", body, options),
  put:    <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, "PUT", body, options),
  patch:  <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, "PATCH", body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, "DELETE", undefined, options),
};

export type HttpClient = typeof http;
