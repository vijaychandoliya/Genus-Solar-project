/**
 * Normalised errors.
 *
 * The UI must never branch on a status code. It branches on a `kind`, which is a
 * closed set — so a component's error handling is exhaustive by construction, and
 * a backend adding a 429 does not require touching a component.
 *
 * Every error carries `requestId`, because that is the first thing support will
 * ask for and the last thing anyone thinks to surface.
 */

export type ErrorKind =
  | "network"     // could not reach the server at all
  | "timeout"     // reached it; it did not answer in time
  | "auth"        // 401 — not signed in, or the session expired
  | "permission"  // 403 — signed in, not allowed
  | "not-found"   // 404
  | "validation"  // 400/409/422, or a response that failed its schema
  | "server"      // 5xx
  | "client";     // any other 4xx

export interface AppErrorOptions {
  kind?: ErrorKind;
  status?: number;
  requestId?: string;
  /** Field-level detail, when the server or the schema provides it. */
  details?: readonly string[] | null;
  cause?: unknown;
}

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly status: number | null;
  readonly requestId: string | null;
  readonly details: readonly string[] | null;
  /** Whether retrying could plausibly succeed. Drives the Retry affordance. */
  readonly retryable: boolean;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.kind = options.kind ?? "server";
    this.status = options.status ?? null;
    this.requestId = options.requestId ?? null;
    this.details = options.details ?? null;
    this.retryable = this.kind === "network" || this.kind === "timeout" || this.kind === "server";
  }
}

export class NetworkError extends AppError {
  constructor(m: string, o: AppErrorOptions = {}) { super(m, { ...o, kind: "network" }); }
}
export class TimeoutError extends AppError {
  constructor(m: string, o: AppErrorOptions = {}) { super(m, { ...o, kind: "timeout" }); }
}
export class AuthenticationError extends AppError {
  constructor(m: string, o: AppErrorOptions = {}) { super(m, { ...o, kind: "auth" }); }
}
export class PermissionError extends AppError {
  constructor(m: string, o: AppErrorOptions = {}) { super(m, { ...o, kind: "permission" }); }
}
export class NotFoundError extends AppError {
  constructor(m: string, o: AppErrorOptions = {}) { super(m, { ...o, kind: "not-found" }); }
}
export class ValidationError extends AppError {
  constructor(m: string, o: AppErrorOptions = {}) { super(m, { ...o, kind: "validation" }); }
}
export class ApiError extends AppError {}

const BY_STATUS: Record<number, new (m: string, o: AppErrorOptions) => AppError> = {
  400: ValidationError,
  401: AuthenticationError,
  403: PermissionError,
  404: NotFoundError,
  409: ValidationError,
  422: ValidationError,
};

export interface ErrorContext {
  requestId: string;
  method: string;
  path: string;
}

/**
 * An HTTP failure response → a typed error.
 *
 * The body is parsed defensively: a failing server very often returns HTML, and
 * letting a parse failure escape would turn "503, upstream is down" into
 * "unexpected token <" — hiding the one fact that mattered.
 */
export async function normaliseError(response: Response, ctx: ErrorContext): Promise<AppError> {
  type ErrorPayload = { message?: string; error?: string; details?: string[] };
  let payload: ErrorPayload | null = null;
  try {
    payload = (await response.clone().json()) as ErrorPayload;
  } catch {
    /* not JSON — the status still stands, and that is the part we need */
  }

  const message =
    payload?.message ?? payload?.error ?? `${ctx.method} ${ctx.path} failed (${response.status})`;
  const options: AppErrorOptions = {
    requestId: ctx.requestId,
    status: response.status,
    details: payload?.details ?? null,
  };

  const Specific = BY_STATUS[response.status];
  if (Specific) return new Specific(message, options);

  return new ApiError(message, {
    ...options,
    kind: response.status >= 500 ? "server" : "client",
  });
}

/** True for the one "error" that is not a failure: the caller walked away. */
export const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

/** Plain-language text for the UI. Never leaks a status code to a reader. */
export function messageFor(error: unknown): string {
  if (!(error instanceof AppError)) return "Something went wrong.";
  switch (error.kind) {
    case "network":    return "Can't reach the server. Check your connection and try again.";
    case "timeout":    return "The server took too long to respond.";
    case "auth":       return "Your session has expired. Sign in again to continue.";
    case "permission": return "You don't have permission to view this.";
    case "not-found":  return "We couldn't find what you were looking for.";
    case "validation": return error.message;
    case "server":     return "The server had a problem. This is usually temporary.";
    case "client":     return error.message;
  }
}
