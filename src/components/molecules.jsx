/**
 * Molecules — panel chrome, KPI surfaces, the info affordance, filters, forms.
 *
 * Two KPI systems live here and the difference is load-bearing:
 *   KpiStrip  — one reading of N measures. Passive. One outlined surface.
 *   TileDeck  — navigation. A real tablist. Individually bordered, selectable.
 * They are separate components because the strip's inset hairline only works in
 * a single row, and because a deck is semantically a set of tabs.
 */
import { useState, useRef, useId, useCallback } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Popover,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { IconTile, SectionLabel } from "./atoms.jsx";
import { METRICS } from "../lib/bands.js";
import { exInt, exNum, withUnit } from "../lib/format.js";
import { focusRing, TARGET_MIN } from "../lib/theme.js";

/* ── MetricInfo ───────────────────────────────────────────────────────────
   Opens on hover OR focus, and pins on click. Hover-only fails WCAG 1.4.13 and
   locks out touch entirely, so all three are wired.                         */

export function MetricInfo({ metricId, title, body, formula, caveat }) {
  const [anchor, setAnchor] = useState(null);
  const m = metricId ? METRICS[metricId] : null;
  const heading = title ?? m?.label ?? "About this figure";
  const text = body ?? m?.hint;
  const warn = caveat ?? m?.caveat;
  const unit = m?.unit;

  const tip = (
    <Box sx={{ maxWidth: 320 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {heading}
        {unit ? ` (${unit})` : ""}
      </Typography>
      {text && <Typography variant="caption" sx={{ display: "block" }}>{text}</Typography>}
    </Box>
  );

  return (
    <>
      <Tooltip title={tip} enterTouchDelay={0} describeChild>
        <IconButton
          size="small"
          aria-label={`About ${heading}`}
          onClick={(e) => {
            e.stopPropagation(); // reading a definition must not also navigate
            setAnchor(e.currentTarget);
          }}
          sx={(t) => ({
            width: TARGET_MIN,
            height: TARGET_MIN,
            color: t.palette.text.tertiary,
            "& svg": { fontSize: 16 },
            ...focusRing(t),
          })}
        >
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { maxWidth: 380, p: 2 } } }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          {heading}
          {unit ? ` (${unit})` : ""}
        </Typography>
        {text && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: formula || warn ? 1.5 : 0 }}>
            {text}
          </Typography>
        )}
        {formula && (
          <>
            <SectionLabel>Formula</SectionLabel>
            <Typography variant="body2" sx={{ mb: warn ? 1.5 : 0 }}>
              {formula}
            </Typography>
          </>
        )}
        {warn && (
          <Box
            sx={(t) => ({
              mt: 1,
              p: 1.25,
              borderRadius: `${t.shape.borderRadius / 2}px`,
              backgroundColor: t.palette.band.warning.bg,
              color: t.palette.band.warning.fg,
            })}
          >
            <Typography variant="caption">{warn}</Typography>
          </Box>
        )}
      </Popover>
    </>
  );
}

/* ── PanelHeader ──────────────────────────────────────────────────────────
   A 4px brand bar, a title that outranks its note, and the note truncating
   first. Secondary text yields before primary gives up a pixel.             */

export function PanelHeader({ title, note, action, id }) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        minWidth: 0,
        borderBottom: (t) => `1px solid ${t.palette.border.subtle}`,
      }}
    >
      <Box
        aria-hidden
        sx={(t) => ({
          width: 4,
          alignSelf: "stretch",
          minHeight: 20,
          borderRadius: 999,
          backgroundColor: t.palette.primary.main,
          flexShrink: 0,
        })}
      />
      <Typography component="h2" id={id} variant="h5" sx={{ flexShrink: 0 }}>
        {title}
      </Typography>
      {note && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {note}
        </Typography>
      )}
      {action && <Box sx={{ ml: "auto", flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}

/** The standard outlined panel. */
export function Panel({ title, note, action, children, sx, labelledBy }) {
  const autoId = useId();
  const headingId = labelledBy ?? `panel-${autoId}`;
  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby={title ? headingId : undefined}
      sx={{ overflow: "hidden", minWidth: 0, ...sx }}
    >
      {title && <PanelHeader id={headingId} title={title} note={note} action={action} />}
      {children}
    </Paper>
  );
}

/* ── Delta ────────────────────────────────────────────────────────────────
   Colour follows polarity, not direction. `good: false` inverts it, so rising
   idleness reads red and falling backlog reads green.                       */

export function Delta({ value, suffix = "%", good = true, sx }) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  const v = Number(value);
  const up = v > 0;
  const positive = good ? up : !up;
  return (
    <Stack
      direction="row"
      component="span"
      sx={{ alignItems: "center", gap: 0.125, minWidth: 0, ...sx }}
    >
      <Box
        component="span"
        aria-hidden
        sx={(t) => ({
          display: "inline-flex",
          color: v === 0 ? t.palette.text.tertiary : positive ? t.palette.band.good.fg : t.palette.band.critical.fg,
          "& svg": { fontSize: 18 },
        })}
      >
        {up ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </Box>
      <Typography
        component="span"
        variant="subtitle2"
        sx={(t) => ({
          color: v === 0 ? t.palette.text.tertiary : positive ? t.palette.band.good.fg : t.palette.band.critical.fg,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        })}
      >
        {`${up ? "+" : ""}${exNum(v, 1)}${suffix}`}
      </Typography>
    </Stack>
  );
}

/* ── KpiTile / KpiStrip ───────────────────────────────────────────────────
   A set of measures read together, on ONE outlined surface divided by inset
   hairlines. Never used for navigation — that is TileDeck.                  */

function KpiBody({ icon, label, value, unit, dp = 0, delta, deltaGood = true, note, metricId, tone }) {
  const formatted =
    value === null || value === undefined
      ? "—"
      : typeof value === "number"
        ? withUnit(dp > 0 ? exNum(value, dp) : exInt(value), unit)
        : String(value);
  // A formatted numeral has no spaces and must never shrink; prose may wrap.
  const isNumeral = !/\s/.test(String(formatted).replace(/ /g, ""));

  return (
    <Stack sx={{ gap: 1, minWidth: 0, flex: 1, p: 2 }}>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, minWidth: 0 }}>
        {icon && <IconTile tone={tone}>{icon}</IconTile>}
        <Stack sx={{ minWidth: 0, gap: 0.25 }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 0.25, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                color: "text.tertiary",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Typography>
            {metricId && <MetricInfo metricId={metricId} />}
          </Stack>
          <Stack direction="row" sx={{ alignItems: "baseline", gap: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              dir="ltr"
              sx={{
                fontVariantNumeric: "tabular-nums",
                whiteSpace: isNumeral ? "nowrap" : "normal",
                unicodeBidi: "isolate",
                minWidth: 0,
              }}
            >
              {formatted}
            </Typography>
            {delta !== undefined && <Delta value={delta} good={deltaGood} />}
          </Stack>
        </Stack>
      </Stack>
      {note && (
        <Typography
          variant="caption"
          sx={{
            color: "text.tertiary",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {note}
        </Typography>
      )}
    </Stack>
  );
}

export function KpiStrip({ items = [], sx }) {
  return (
    <Paper
      variant="outlined"
      role="group"
      aria-label="Key figures"
      sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minWidth: 0, ...sx }}
    >
      {items.map((item, i) => (
        <Box
          key={item.label ?? i}
          sx={(t) => ({
            display: "flex",
            flex: 1,
            minWidth: 0,
            // Inset hairline — a rule between tracks, not a full-bleed border.
            // Only valid in a single row, which is why this is not a deck.
            borderTop: { xs: i === 0 ? "none" : `1px solid ${t.palette.border.subtle}`, md: "none" },
            borderInlineStart: {
              xs: "none",
              md: i === 0 ? "none" : `1px solid ${t.palette.border.subtle}`,
            },
          })}
        >
          <KpiBody {...item} />
        </Box>
      ))}
    </Paper>
  );
}

/* ── KpiTile / KpiDeck ────────────────────────────────────────────────────
   Figma Genus Design System, "09 Dashboard and KPI composition" (node
   246:11 / 254:53). This is the scorecard pattern — individually carded
   tiles, each stating its own tone, delta and freshness — as distinct from
   KpiStrip's single shared-surface "one reading" above.

   The component's own Figma description: "Metric value stays primary; delta
   includes direction and meaning; freshness is always visible." That last
   clause is not decorative — a card with no freshness caption is not this
   component, because a number with no stated age is not trustworthy on an
   operational dashboard. `freshness` is REQUIRED, not optional.

   `tone` reuses the theme's existing status slots — Figma's own
   Neutral/Positive/Attention map onto info/good/warning, so no new tokens
   were needed. `delta` is optional: fabricating a period-over-period change
   with no historical comparison to draw it from would be worse than omitting
   the line the spec shows, so a tile with nothing real to compare against
   simply skips it.                                                          */

const KPI_TONE = {
  info: { bg: "status/info/background", fg: "status/info/foreground" },
  good: { bg: "status/success/background", fg: "status/success/foreground" },
  warning: { bg: "status/warning/background", fg: "status/warning/foreground" },
  // Not in Figma's three tones — added for a metric this dataset genuinely
  // cannot compute yet. Flat, no tint, so it reads as absent rather than as
  // a fourth real status alongside info/good/warning.
  neutral: { bg: null, fg: "text.tertiary" },
};

function toneColors(t, tone) {
  const key = KPI_TONE[tone] ? tone : "info";
  if (key === "neutral") {
    return { bg: t.palette.surface.subtle, fg: t.palette.text.tertiary };
  }
  const slot = { info: "info", good: "good", warning: "warning" }[key];
  return { bg: t.palette.band[slot].bg, fg: t.palette.band[slot].fg };
}

export function KpiTile({
  label,
  value,
  unit,
  dp = 0,
  tone = "info",
  icon,
  delta,
  deltaMeaning,
  deltaGood = true,
  freshness,
  notConfigured,
  sx,
}) {
  const formatted =
    notConfigured || value === null || value === undefined
      ? "—"
      : typeof value === "number"
        ? withUnit(dp > 0 ? exNum(value, dp) : exInt(value), unit)
        : String(value);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: 160,
        p: 2,
        minWidth: 0,
        ...sx,
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, minWidth: 0 }}>
        {/* Genus Label/M — 12/600/16, tracking 0. Not one of MUI's own
            Typography variants, so it is set directly rather than through a
            variant name that would silently fall back to body defaults. */}
        <Typography
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            color: "text.secondary",
            fontWeight: 600,
            fontSize: 12,
            lineHeight: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        {icon && (
          <Box
            aria-hidden
            sx={(t) => {
              const c = toneColors(t, notConfigured ? "neutral" : tone);
              return {
                width: 28,
                height: 28,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: `${t.shape.borderRadius}px`,
                backgroundColor: c.bg,
                color: c.fg,
                "& svg": { fontSize: 20 },
              };
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>

      <Typography
        variant="h4"
        dir="ltr"
        sx={(t) => ({
          fontVariantNumeric: "tabular-nums",
          unicodeBidi: "isolate",
          whiteSpace: "nowrap",
          color: notConfigured ? t.palette.text.tertiary : t.palette.text.primary,
          fontStyle: notConfigured ? "italic" : "normal",
        })}
      >
        {formatted}
      </Typography>

      {delta !== undefined && !notConfigured && (
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.25, minWidth: 0 }}>
          <Box
            component="span"
            aria-hidden
            sx={(t) => ({
              display: "inline-flex",
              color: toneColors(t, tone).fg,
              "& svg": { fontSize: 16 },
            })}
          >
            {Number(delta) < 0 ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
          </Box>
          <Typography
            variant="body2"
            sx={(t) => ({
              color: toneColors(t, tone).fg,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            })}
          >
            {`${Number(delta) > 0 ? "+" : ""}${exNum(Number(delta), 1)}%`}
            {deltaMeaning ? ` · ${deltaMeaning}` : ""}
          </Typography>
        </Stack>
      )}

      <Typography
        variant="overline"
        sx={{
          color: "text.tertiary",
          mt: delta !== undefined && !notConfigured ? 0 : "auto",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {freshness}
      </Typography>
    </Paper>
  );
}

/**
 * The deck grid — Figma's own three breakpoints: 4-up desktop (24px gap),
 * 2-up compact (24px gap), 2-up mobile (16px gap, narrower cards). Unlike the
 * page-level "everything collapses to one column at xs" rule, THIS component
 * stays 2-up even on the smallest breakpoint Figma tested — a deliberate,
 * documented exception in the same source design system, not an oversight.
 */
export function KpiDeck({ children, sx }) {
  return (
    <Box
      role="group"
      aria-label="Key figures"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
        gap: { xs: 2, sm: 3 },
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/* ── TileDeck ─────────────────────────────────────────────────────────────
   Navigation, so it is a real tablist: one tab stop for the whole deck,
   arrows to move, Home/End to jump, and the pane aria-labelledby its tile.
   That is what makes the swap audible to a screen reader.                   */

export function TileDeck({ items = [], value, onChange, idPrefix = "deck", sx }) {
  const theme = useTheme();
  const rtl = theme.direction === "rtl";
  const refs = useRef([]);

  const onKeyDown = useCallback(
    (e) => {
      const i = items.findIndex((it) => it.id === value);
      if (i < 0) return;
      // Arrows follow reading order, not screen geometry — under RTL,
      // ArrowLeft moves forward.
      const fwd = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      let next = null;
      if (e.key === fwd || e.key === "ArrowDown") next = (i + 1) % items.length;
      else if (e.key === back || e.key === "ArrowUp") next = (i - 1 + items.length) % items.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      if (next === null) return;
      e.preventDefault();
      onChange?.(items[next].id);
      refs.current[next]?.focus();
    },
    [items, value, onChange, rtl],
  );

  return (
    <Box
      role="tablist"
      aria-label="Categories"
      onKeyDown={onKeyDown}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
        gap: 1.5,
        minWidth: 0,
        ...sx,
      }}
    >
      {items.map((item, i) => {
        const selected = item.id === value;
        return (
          <Paper
            key={item.id}
            ref={(el) => (refs.current[i] = el)}
            component="button"
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange?.(item.id)}
            variant="outlined"
            sx={(t) => ({
              textAlign: "start",
              cursor: "pointer",
              minWidth: 0,
              font: "inherit",
              p: 0,
              borderColor: selected ? t.palette.primary.main : t.palette.border.subtle,
              borderWidth: selected ? 2 : 1,
              backgroundColor: selected
                ? alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.16 : 0.06)
                : t.palette.surface.raised,
              transition: t.transitions.create(["border-color", "background-color"], {
                duration: t.transitions.duration.shortest,
              }),
              "&:hover": {
                borderColor: selected ? t.palette.primary.main : t.palette.border.strong,
              },
              ...focusRing(t),
            })}
          >
            <KpiBody {...item} tone={item.tone} />
          </Paper>
        );
      })}
    </Box>
  );
}

/** The pane a deck controls. Labelled by its tile, so the swap is announced. */
export function TilePane({ deckId = "deck", value, children, sx }) {
  return (
    <Box
      role="tabpanel"
      id={`${deckId}-panel-${value}`}
      aria-labelledby={`${deckId}-tab-${value}`}
      tabIndex={-1}
      sx={{ minWidth: 0, ...sx }}
    >
      {children}
    </Box>
  );
}

/* ── FilterBar ────────────────────────────────────────────────────────────
   Sits above results and states its effect — "N of M records" — so a short
   list never looks like an empty one.                                       */

export function FilterBar({ children, resultNote, onClear, sx }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
      <Stack direction="row" sx={{ alignItems: "center", gap: 1, ml: "auto" }}>
        {resultNote && (
          <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
            {resultNote}
          </Typography>
        )}
        {onClear && (
          <Button size="small" variant="text" onClick={onClear}>
            Clear all
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

/* ── SettingSection ───────────────────────────────────────────────────────── */

export function SettingSection({ title, note, children, sx }) {
  return (
    <Box component="section" sx={{ mb: 4, minWidth: 0, ...sx }}>
      <Box
        sx={(t) => ({
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: t.palette.surface.base,
          pb: 1,
        })}
      >
        <Typography variant="h5">{title}</Typography>
        {note && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {note}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mt: 1.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/* ── FormDialog ───────────────────────────────────────────────────────────── */

export function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel = "Save",
  children,
  maxWidth = "xs",
  busy = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle sx={{ typography: "h5" }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack sx={{ gap: 2, pt: 1 }}>{children}</Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={busy}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
