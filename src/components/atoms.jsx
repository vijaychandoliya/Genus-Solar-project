/**
 * Atoms.
 *
 * Every colour, size, radius and duration here dereferences the theme, which is
 * itself generated from the Figma export. There are no literals — if you need a
 * value that is not in the theme, the answer is a token, not a hex.
 */
import { Box, Typography, Tooltip, Button, alpha } from "@mui/material";
import { BAND_LABEL } from "../lib/bands.js";
import { exInt, exNum, withUnit } from "../lib/format.js";
import { panelBorder } from "../lib/theme.js";

/* ── Numeral ──────────────────────────────────────────────────────────────
   A formatted numeral contains no spaces, so it is never allowed to shrink or
   wrap. Tabular figures so columns of numbers line up.                      */

export function Numeral({ value, unit, dp = 0, variant = "body1", sx, ...rest }) {
  const text = dp > 0 ? exNum(value, dp) : exInt(value);
  return (
    <Typography
      component="span"
      variant={variant}
      dir="ltr"
      sx={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum"',
        whiteSpace: "nowrap",
        unicodeBidi: "isolate",
        ...sx,
      }}
      {...rest}
    >
      {withUnit(text, unit)}
    </Typography>
  );
}

/* ── StatusChip ───────────────────────────────────────────────────────────
   Tone is passed in, never inferred from the label. The WFM version guessed a
   palette from the text and mapped "Active" to warning, which is wrong wherever
   Active is a good state — and this product has several.                    */

const TONES = ["neutral", "good", "info", "warning", "danger"];

export function StatusChip({ label, tone = "neutral", icon, size = "small", sx }) {
  const dense = size === "small";
  return (
    <Box
      component="span"
      sx={(t) => {
        const map = {
          neutral: { fg: t.palette.text.secondary, bg: t.palette.surface.subtle },
          good: { fg: t.palette.band.good.fg, bg: t.palette.band.good.bg },
          info: { fg: t.palette.band.info.fg, bg: t.palette.band.info.bg },
          warning: { fg: t.palette.band.warning.fg, bg: t.palette.band.warning.bg },
          danger: { fg: t.palette.band.critical.fg, bg: t.palette.band.critical.bg },
        };
        const c = map[TONES.includes(tone) ? tone : "neutral"];
        return {
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: c.fg,
          backgroundColor: c.bg,
          borderRadius: `${t.shape.borderRadius * 999}px`,
          paddingInline: dense ? 1 : 1.25,
          paddingBlock: dense ? 0.125 : 0.375,
          ...t.typography.subtitle2,
          lineHeight: dense ? "18px" : "22px",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          ...sx,
        };
      }}
    >
      {icon}
      <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </Box>
    </Box>
  );
}

/* ── BandChip / BandDot ───────────────────────────────────────────────────
   `normal` renders nothing at all. Emphasis is a zero-sum budget: a grid where
   every cell is tinted has no exceptions left to notice.                     */

export function BandDot({ band, size = 8 }) {
  if (band === "normal") return null;
  return (
    <Box
      component="span"
      aria-hidden
      sx={(t) => ({
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        backgroundColor: t.palette.band[band]?.dot ?? t.palette.band.unknown.dot,
      })}
    />
  );
}

export function BandChip({ band, label, sx }) {
  const text = label ?? BAND_LABEL[band] ?? band;
  if (band === "normal") {
    // Colour is never the only signal, and the absence of colour is not a signal
    // at all — so `normal` states itself in words, quietly.
    return (
      <Typography component="span" variant="body2" sx={{ color: "text.tertiary", ...sx }}>
        {text}
      </Typography>
    );
  }
  if (band === "watch") {
    // Watch is a dot and a word, never a fill. A filled watch chip is
    // indistinguishable from a warning at a glance, which collapses two bands
    // into one and spends emphasis the warning needs.
    return (
      <Box
        component="span"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.625, ...sx }}
      >
        <BandDot band="watch" />
        <Typography component="span" variant="subtitle2" sx={{ color: "text.secondary" }}>
          {text}
        </Typography>
      </Box>
    );
  }
  const tone =
    { critical: "danger", warning: "warning", unknown: "neutral", good: "good", info: "info" }[
      band
    ] ?? "neutral";
  return <StatusChip label={text} tone={tone} icon={<BandDot band={band} />} sx={sx} />;
}

/* ── BandedValue ──────────────────────────────────────────────────────────
   The core telemetry renderer. A value, its unit, and its band — the three
   things a reader needs to act without knowing the pack design.             */

export function BandedValue({
  value,
  unit,
  band = "normal",
  dp = 0,
  emphasis = "body1",
  info,
  sx,
}) {
  const unknown = band === "unknown";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        minWidth: 0,
        ...sx,
      }}
    >
      {band !== "normal" && !unknown && <BandDot band={band} />}
      <Typography
        component="span"
        variant={emphasis}
        dir="ltr"
        sx={(t) => ({
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          unicodeBidi: "isolate",
          color: unknown
            ? t.palette.text.tertiary
            : band === "critical" || band === "warning"
              ? t.palette.band[band].fg
              : t.palette.text.primary,
          fontWeight: band === "critical" || band === "warning" ? 600 : undefined,
        })}
      >
        {unknown ? "—" : withUnit(dp > 0 ? exNum(value, dp) : exInt(value), unit)}
      </Typography>
      {info}
    </Box>
  );
}

/* ── FreshnessChip ────────────────────────────────────────────────────────
   Silence must never read as health.                                        */

const FRESHNESS_COPY = {
  live: { label: "Live", tone: "good" },
  late: { label: "Late", tone: "neutral" },
  stale: { label: "Stale", tone: "warning" },
  offline: { label: "Offline", tone: "danger" },
};

export function FreshnessChip({ freshness = "offline", age, sx }) {
  const c = FRESHNESS_COPY[freshness] ?? FRESHNESS_COPY.offline;
  return <StatusChip label={age ? `${c.label} · ${age}` : c.label} tone={c.tone} sx={sx} />;
}

/* ── IconTile ─────────────────────────────────────────────────────────────
   The tinted plate behind a KPI icon. 36px, brand at 8% light / 18% dark.   */

export function IconTile({ children, size = 36, tone = "primary", sx }) {
  return (
    <Box
      sx={(t) => ({
        width: size,
        height: size,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: `${t.shape.borderRadius}px`,
        backgroundColor: alpha(
          t.palette[tone]?.main ?? t.palette.primary.main,
          t.palette.mode === "dark" ? 0.18 : 0.08,
        ),
        color: t.palette[tone]?.main ?? t.palette.primary.main,
        "& svg": { fontSize: size * 0.5 },
        ...sx,
      })}
    >
      {children}
    </Box>
  );
}

/* ── WsTag ────────────────────────────────────────────────────────────────
   A quiet, squared label. Distinct from StatusChip so a tag never reads as a
   status — Law of Similarity works both ways.                              */

export function WsTag({ label, sx }) {
  return (
    <Box
      component="span"
      sx={(t) => ({
        display: "inline-block",
        ...t.typography.subtitle2,
        color: t.palette.text.secondary,
        backgroundColor: t.palette.surface.subtle,
        border: `1px solid ${panelBorder(t)}`,
        borderRadius: `${t.shape.borderRadius / 2}px`,
        paddingInline: 0.75,
        paddingBlock: 0.125,
        whiteSpace: "nowrap",
        ...sx,
      })}
    >
      {label}
    </Box>
  );
}

/* ── SectionLabel ─────────────────────────────────────────────────────────── */

export function SectionLabel({ children, sx }) {
  return (
    <Typography
      variant="overline"
      component="div"
      sx={{ color: "text.tertiary", ...sx }}
    >
      {children}
    </Typography>
  );
}

/* ── EmptyState ───────────────────────────────────────────────────────────
   Four different nothings need four different sentences. The `title` names the
   condition and `action` offers the way out — never a bare "No data".       */

export function EmptyState({ icon, title, body, actionLabel, onAction, minHeight = 180, sx }) {
  return (
    <Box
      role="status"
      sx={{
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        px: 3,
        py: 4,
        textAlign: "center",
        ...sx,
      }}
    >
      {icon && (
        <Box sx={(t) => ({ color: t.palette.text.disabled, "& svg": { fontSize: 32 } })}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" sx={{ color: "text.primary" }}>
        {title}
      </Typography>
      {body && (
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
          {body}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button size="small" variant="outlined" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

/** The default in-table empty state. */
export function GridEmptyOverlay({
  title = "No matching records",
  body = "Adjust the filters or the search to see results.",
  actionLabel,
  onAction,
}) {
  return (
    <EmptyState
      title={title}
      body={body}
      actionLabel={actionLabel}
      onAction={onAction}
      minHeight={160}
    />
  );
}

/* ── NotConfigured ────────────────────────────────────────────────────────
   A configuration gap is not a measurement. This renders where a source is
   absent, and it must never be replaced by a zero.                          */

export function NotConfigured({ hint = "No value has been configured for this field." }) {
  return (
    <Tooltip title={hint}>
      <Typography
        component="span"
        variant="body2"
        sx={{ color: "text.tertiary", fontStyle: "italic", cursor: "help" }}
      >
        Not configured
      </Typography>
    </Tooltip>
  );
}
