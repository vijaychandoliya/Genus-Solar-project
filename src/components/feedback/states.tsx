/**
 * The four states, in one place — 🟩 PRODUCTION.
 *
 * Without this every screen invents its own, they drift, and "empty" quietly
 * becomes indistinguishable from "still loading" on a slow connection — which
 * an operator reads as "there are no alarms". That is a safety problem on a
 * utility platform, not a polish one.
 *
 * Colours and spacing come from the theme. No hex, no px literals: that is what
 * the token system is for.
 */
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { AppError, messageFor } from "../../services/http/errors.js";

const Centre = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ alignItems: "center", justifyContent: "center", gap: 1.5, py: 6, px: 3, textAlign: "center" }}>
    {children}
  </Stack>
);

export function LoadingState({ label = "Loading…" }: { label?: string | undefined }) {
  return (
    <Centre>
      <CircularProgress size={28} aria-label={label} />
      <Typography variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
    </Centre>
  );
}

export function EmptyState({ title = "Nothing to show", detail, action }: {
  title?: string; detail?: string; action?: ReactNode;
}) {
  return (
    <Centre>
      <Typography variant="subtitle2">{title}</Typography>
      {detail && <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>{detail}</Typography>}
      {action}
    </Centre>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: (() => void) | undefined }) {
  const app = error instanceof AppError ? error : null;
  const canRetry = Boolean(onRetry) && (app?.retryable ?? true);

  return (
    <Centre>
      <Typography variant="subtitle2">{messageFor(error)}</Typography>

      {/* Field-level detail when the server or the schema gave us any. */}
      {app?.details && app.details.length > 0 && (
        <Stack component="ul" sx={{ m: 0, pl: 2.5, textAlign: "left" }}>
          {app.details.map((d) => (
            <Typography key={d} component="li" variant="caption" sx={{ color: "text.secondary" }}>{d}</Typography>
          ))}
        </Stack>
      )}

      {canRetry && <Button size="small" variant="outlined" onClick={onRetry}>Try again</Button>}

      {/* The first thing support will ask for, and the last thing anyone
          remembers to surface. Quiet, selectable, always there. */}
      {app?.requestId && (
        <Typography variant="caption" sx={{ color: "text.tertiary", userSelect: "all" }}>
          Reference {app.requestId}
        </Typography>
      )}
    </Centre>
  );
}

/** The shape `useQuery` gives us, narrowed to what this component needs. */
export interface AsyncState<T> {
  isPending: boolean;
  isError: boolean;
  isEmpty?: boolean | undefined;
  error: unknown;
  data: T | undefined;
  refetch?: (() => void) | undefined;
}

/**
 * Loading → error → empty → success, resolved in that order, once.
 *
 * `children` is a function so `data` is non-nullable inside it — the component
 * below cannot be rendered in a state where its data is missing.
 */
export function AsyncBoundary<T>({ state, empty, skeleton, children }: {
  state: AsyncState<T>;
  empty?: ReactNode | undefined;
  skeleton?: ReactNode | undefined;
  children: (data: T) => ReactNode;
}) {
  if (state.isPending) return <>{skeleton ?? <LoadingState />}</>;
  if (state.isError) return <ErrorState error={state.error} onRetry={state.refetch} />;
  if (state.isEmpty) return <>{empty ?? <EmptyState />}</>;
  if (state.data === undefined) return <>{empty ?? <EmptyState />}</>;
  return <Box>{children(state.data)}</Box>;
}
