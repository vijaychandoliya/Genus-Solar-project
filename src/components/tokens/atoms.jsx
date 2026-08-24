/**
 * Editing atoms for the token manager.
 *
 * Every verdict carries a WORD, never colour alone — the same rule the band
 * system enforces, and it matters more on this screen than anywhere else in the
 * product: a contrast linter that communicates only in colour is unusable by
 * exactly the people it exists to protect.
 */
import React from "react";
import { Box, Stack, Tooltip, Typography, IconButton } from "@mui/material";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { alpha } from "@mui/material/styles";
import { contrast, apca, apcaBand, isHex } from "../../lib/contrast.js";

/* ── verdict ──────────────────────────────────────────────────────────────── */

const TONE = {
  pass: (t) => ({ fg: t.palette.text.tertiary, bg: "transparent" }),
  fail: (t) => ({ fg: t.palette.band.critical.fg, bg: t.palette.band.critical.bg }),
  exempt: (t) => ({ fg: t.palette.text.tertiary, bg: t.palette.surface.subtle }),
  unknown: (t) => ({ fg: t.palette.band.warning.fg, bg: t.palette.band.warning.bg }),
  defect: (t) => ({ fg: t.palette.band.warning.fg, bg: t.palette.band.warning.bg }),
};

const LABEL = { pass: "Pass", fail: "Fail", exempt: "Exempt", unknown: "Unknown", defect: "Known defect" };

/**
 * A verdict chip. `pass` is deliberately colourless — emphasis is zero-sum, and
 * a 486-row audit where every row is tinted has no exceptions left to notice.
 */
export function VerdictChip({ level, defect = false, title }) {
  const key = level === "fail" && defect ? "defect" : level;
  const chip = (
    <Box
      component="span"
      sx={(t) => {
        const { fg, bg } = (TONE[key] ?? TONE.unknown)(t);
        return {
          display: "inline-block",
          ...t.typography.overline,
          color: fg,
          backgroundColor: bg,
          borderRadius: 999,
          px: bg === "transparent" ? 0 : 0.75,
          whiteSpace: "nowrap",
        };
      }}
    >
      {LABEL[key] ?? key}
    </Box>
  );
  return title ? <Tooltip title={title}>{chip}</Tooltip> : chip;
}

/* ── swatch ───────────────────────────────────────────────────────────────── */

export function Swatch({ color, size = 18, radius = 999, title }) {
  const ok = isHex(color);
  const sw = (
    <Box
      sx={(t) => ({
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: `${radius}px`,
        backgroundColor: ok ? color : "transparent",
        border: `1px solid ${ok ? alpha(t.palette.text.primary, 0.22) : t.palette.band.critical.fg}`,
        // A missing colour must not render as a plausible empty square.
        backgroundImage: ok
          ? "none"
          : `linear-gradient(45deg, transparent 45%, ${t.palette.band.critical.fg} 45%, ${t.palette.band.critical.fg} 55%, transparent 55%)`,
      })}
    />
  );
  return title ? <Tooltip title={title}>{sw}</Tooltip> : sw;
}

/* ── ratio ────────────────────────────────────────────────────────────────── */

export function Ratio({ value, required }) {
  const short = value < required;
  return (
    <Box component="span" sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
      <Box component="span" sx={(t) => ({ fontWeight: short ? 700 : 500, color: short ? t.palette.band.critical.fg : "inherit" })}>
        {value.toFixed(2)}
      </Box>
      <Box component="span" sx={(t) => ({ color: t.palette.text.tertiary })}>
        {" "}/ {required}
      </Box>
    </Box>
  );
}

/* ── contrast meter ───────────────────────────────────────────────────────── */

/**
 * One pair, judged, with the glyphs rendered at their real size.
 *
 * The sample text is not decoration. A ratio is an abstraction, and 4.52:1 at
 * 12px reads very differently from 4.52:1 at 28px — the number passes either
 * way. Showing the actual type token is what lets someone notice that.
 */
export function ContrastMeter({ fg, bg, required = 4.5, typeStyle, label, sample = "Handgloves 24" }) {
  const usable = isHex(fg) && isHex(bg);
  const ratio = usable ? contrast(fg, bg) : 0;
  const lc = usable ? apca(fg, bg) : 0;

  return (
    <Box sx={(t) => ({ border: `1px solid ${t.palette.border.default}`, borderRadius: `${t.shape.borderRadius}px`, overflow: "hidden", minWidth: 0 })}>
      <Box
        sx={{
          backgroundColor: usable ? bg : "transparent",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          minHeight: 56,
        }}
      >
        <Typography
          sx={{
            color: usable ? fg : "text.disabled",
            ...(typeStyle ?? {}),
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {usable ? sample : "unresolved"}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1.5}
        sx={(t) => ({ alignItems: "center", px: 2, py: 1, backgroundColor: t.palette.surface.subtle, flexWrap: "wrap" })}
      >
        {label && (
          <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 0 }}>
            {label}
          </Typography>
        )}
        <Box sx={{ flex: 1, minWidth: 8 }} />
        {usable ? (
          <>
            <Typography variant="body2">
              <Ratio value={ratio} required={required} />
            </Typography>
            <VerdictChip level={ratio >= required ? "pass" : "fail"} />
            <Tooltip title="APCA — advisory only. WCAG 2.1 AA is the gate; APCA is the proposed WCAG 3 method and is not back-compatible.">
              <Typography variant="body2" sx={{ color: "text.tertiary", fontVariantNumeric: "tabular-nums" }}>
                Lc {Math.round(lc)} · {apcaBand(lc)}
              </Typography>
            </Tooltip>
          </>
        ) : (
          <VerdictChip level="unknown" title="One side of this pair is not a resolvable colour" />
        )}
      </Stack>
    </Box>
  );
}

/* ── override marker ──────────────────────────────────────────────────────── */

/**
 * Marks a token as changed from its shipped value, with a one-click revert.
 * Showing the original matters: the whole point of a draft is that it is
 * reversible, and a reader has to be able to see what they are reverting TO.
 */
export function OverrideMark({ original, onRevert, what }) {
  // The label names the TOKEN, not just the value. "Revert to 12" tells a
  // screen-reader user nothing about which of the eleven spacing steps they are
  // about to change back — and this screen is an accessibility tool, so its own
  // labels have to be the example.
  const label = what ? `Revert ${what} to ${original}` : `Revert to ${original}`;
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
      <Tooltip title={`Changed from ${original}`}>
        <Box
          component="span"
          sx={(t) => ({
            ...t.typography.overline,
            color: t.palette.primary.main,
            backgroundColor: alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.2 : 0.09),
            borderRadius: 999,
            px: 0.75,
            whiteSpace: "nowrap",
          })}
        >
          Edited
        </Box>
      </Tooltip>
      <Tooltip title={label}>
        <IconButton size="small" onClick={onRevert} aria-label={label}>
          <UndoOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/* ── field label ──────────────────────────────────────────────────────────── */

export function FieldLabel({ children, hint }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "baseline", mb: 0.5, minWidth: 0 }}>
      <Typography sx={(t) => ({ ...t.typography.overline, color: t.palette.text.tertiary })}>{children}</Typography>
      {hint && (
        <Typography variant="body2" sx={{ color: "text.tertiary", minWidth: 0 }}>
          {hint}
        </Typography>
      )}
    </Stack>
  );
}
