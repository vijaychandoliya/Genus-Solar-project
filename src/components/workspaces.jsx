/**
 * Workspace primitives — the page frame every screen is built from.
 *
 *   WsPage      breadcrumb · H1 · subtitle · context bar · actions
 *   WsContext   the inherited hierarchy path and page-level facts
 *   WsSection   one vertical band
 *   WsTable     the standard table panel  (90% of tables go through here)
 *   wsCols      tuple → column def
 *
 * IA rules enforced here rather than left to call sites:
 *   · Tables are full width. A table never shares a row with a chart.
 *   · Bands are minWidth: 0, so a wide band scrolls inside itself rather than
 *     scrolling the whole page sideways.
 *   · One H1 per page. Panel titles are h2 inside PanelHeader.
 *   · No page-level table controls — density, export and columns live in the
 *     table's own toolbar.
 */
import { Box, Stack, Typography, Breadcrumbs, Link, Divider } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Panel } from "./molecules.jsx";
import { DataTable } from "./data-table.jsx";
import { StatusChip, GridEmptyOverlay } from "./atoms.jsx";
import { exInt } from "../lib/format.js";
import { panelBorder } from "../lib/theme.js";

/* ── WsPage ──────────────────────────────────────────────────────────────── */

export function WsPage({ breadcrumbs = [], title, subtitle, context, actions, children, sx }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0, ...sx }}>
      <Box sx={{ minWidth: 0 }}>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
            sx={{ mb: 0.5, "& .MuiBreadcrumbs-li": { minWidth: 0 } }}
          >
            {breadcrumbs.map((b, i) =>
              b.href && i < breadcrumbs.length - 1 ? (
                <Link
                  key={i}
                  href={b.href}
                  underline="hover"
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  {b.label}
                </Link>
              ) : (
                <Typography key={i} variant="body2" sx={{ color: "text.tertiary" }}>
                  {b.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ gap: 1.5, alignItems: { sm: "flex-start" }, justifyContent: "space-between", minWidth: 0 }}
        >
          <Box sx={{ minWidth: 0 }}>
            {/* The only h1 on the page. */}
            <Typography component="h1" variant="h4">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Stack direction="row" sx={{ gap: 1, flexShrink: 0, flexWrap: "wrap" }}>
              {actions}
            </Stack>
          )}
        </Stack>
      </Box>

      {context}

      <Stack sx={{ gap: 1.75, minWidth: 0 }}>{children}</Stack>
    </Box>
  );
}

/* ── WsContext ───────────────────────────────────────────────────────────── */

export function WsContext({ items = [], chips = [], sx }) {
  if (!items.length && !chips.length) return null;
  return (
    <Box
      sx={(t) => ({
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: { xs: 1.5, sm: 2.5 },
        px: 2,
        py: 1.25,
        minWidth: 0,
        border: `1px solid ${panelBorder(t)}`,
        borderRadius: `${t.shape.borderRadius}px`,
        backgroundColor: t.palette.surface.subtle,
        ...sx,
      })}
    >
      {items.map((it, i) => (
        <Stack key={it.label ?? i} direction="row" sx={{ alignItems: "center", gap: 1, minWidth: 0 }}>
          <Typography variant="overline" sx={{ color: "text.tertiary", whiteSpace: "nowrap" }}>
            {it.label}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {it.value}
          </Typography>
        </Stack>
      ))}
      {chips.length > 0 && (
        <Stack direction="row" sx={{ gap: 1, ml: { sm: "auto" }, flexWrap: "wrap" }}>
          {chips}
        </Stack>
      )}
    </Box>
  );
}

/* ── WsSection ───────────────────────────────────────────────────────────── */

/** One band. `minWidth: 0` is not optional — see the module note. */
export function WsSection({ title, note, action, children, padded = true, sx }) {
  return (
    <Panel title={title} note={note} action={action} sx={{ minWidth: 0, ...sx }}>
      <Box sx={{ p: padded ? 2 : 0, minWidth: 0 }}>{children}</Box>
    </Panel>
  );
}

/** Two charts side by side. Tables must never use this. */
export function WsSplit({ children, sx }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        gap: 1.75,
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/* ── wsCols ──────────────────────────────────────────────────────────────── */

/**
 * Tuple → column def.
 *   wsCols([
 *     ["name",  "Consumer",  { flex: 1.6 }],
 *     ["count", "Surveys",   { width: 120, align: "right", type: "number" }],
 *     ["state", "Stage",     { width: 140, chip: "info" }],
 *   ])
 *
 * `chip` takes a TONE, not `true`. Inferring a status palette from cell text is
 * how the WFM version ended up painting "Active" amber in a context where
 * active is good.
 */
export function wsCols(defs) {
  return defs.map(([field, headerName, opts = {}]) => {
    const { chip, flex, ...rest } = opts;
    return {
      field,
      headerName,
      minWidth: opts.minWidth ?? 110,
      ...(chip && {
        renderCell: ({ value }) => <StatusChip label={value ?? "—"} tone={chip} />,
      }),
      ...rest,
    };
  });
}

/* ── WsTable ─────────────────────────────────────────────────────────────── */

/**
 * The standard table panel. `search` toggles the ENTIRE toolbar, not just the
 * search box — small embedded tables pass `search={false}` because the toolbar
 * would outweigh the data.
 */
export function WsTable({
  title,
  note,
  action,
  cols,
  rows = [],
  search = true,
  pageSize = 8,
  density = "condensed",
  fontSize = 12,
  highlightId,
  emptyOverlay,
  exportName,
  sx,
  ...rest
}) {
  return (
    <Panel title={title} note={note} action={action} sx={{ minWidth: 0, ...sx }}>
      <DataTable
        columns={cols}
        rows={rows}
        toolbar={search}
        density={density}
        fontSize={fontSize}
        pageSize={pageSize}
        pageSizeOptions={[pageSize, 25, 50]}
        // A pagination bar under three rows is noise.
        hideFooter={rows.length <= pageSize}
        // exportName drives both the CSV filename and the preferences key. A
        // table with no distinct name gets no persistence at all, so give
        // every table a title or an explicit exportName.
        exportName={exportName ?? title}
        emptyOverlay={emptyOverlay ?? <GridEmptyOverlay />}
        overlayHeight={160}
        getRowClassName={
          highlightId != null ? ({ id }) => (String(id) === String(highlightId) ? "ws-row-highlight" : "") : undefined
        }
        sx={{
          "& .ws-row-highlight": {
            backgroundColor: (t) =>
              t.palette.mode === "dark" ? "rgba(16,124,16,0.18)" : "rgba(16,124,16,0.10)",
            transition: (t) => t.transitions.create("background-color", { duration: 280 }),
          },
        }}
        {...rest}
      />
    </Panel>
  );
}

/** "N of M records" — so a short table never looks like an empty one. */
export function resultNote(shown, total, noun = "records") {
  return shown === total
    ? `${exInt(total)} ${noun}`
    : `${exInt(shown)} of ${exInt(total)} ${noun}`;
}

export { Divider };
