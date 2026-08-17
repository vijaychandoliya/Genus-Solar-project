/**
 * Theme Customization — the shell preferences drawer.
 *
 * ── Density, and where the negative space went ───────────────────────────
 * The first version gave every section a 40px tinted icon tile and a collapse
 * chevron. Checked against eight shipped appearance panels on Mobbin — Wrike,
 * Todoist, X, Revolut, Perplexity, Twenty, Deel, Fabric — NOT ONE does either.
 * Six coloured squares in a 400px column is six claims on attention for
 * navigation the user is already looking at, and six chevrons is a control per
 * section for a panel that scrolls anyway. Both are gone.
 *
 * What the references do instead, and what this now does:
 *   · quiet section labels, no ornament, generous space above each
 *   · preview cards ONLY where a preview earns its place — layout, direction
 *     and mode, where the choice changes the shape of the shell
 *   · colour as a row of circular swatches (the X pattern), not nine repeats
 *     of the same layout diagram, which saved roughly 200px of column
 *   · typography as compact chips set in their own face
 *   · selection as a ring plus a check, so it survives greyscale and is not
 *     carried by colour alone
 */
import { useState } from "react";
import { Box, Drawer, Stack, Typography, IconButton, Button, Divider, Tooltip, alpha } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useSettings } from "../../lib/settings.jsx";
import { schemes, fonts, layout as layoutTokens } from "../../lib/tokens.js";
import { focusRing } from "../../lib/theme.js";

/* ── previews ─────────────────────────────────────────────────────────────
   Schematics of the shell, drawn from tokens so they follow the theme rather
   than sitting as a fixed picture of one mode.                              */

const RAIL = 0.28;
const MINI_RAIL = 0.14;

function Frame({ children, sx }) {
  return (
    <Box
      aria-hidden
      sx={(t) => ({
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 10",
        borderRadius: `${t.shape.borderRadius / 2}px`,
        overflow: "hidden",
        backgroundColor: t.palette.surface.canvas,
        border: `1px solid ${t.palette.border.subtle}`,
        display: "flex",
        ...sx,
      })}
    >
      {children}
    </Box>
  );
}

function RailLines({ count = 3, dot = false }) {
  return (
    <Stack sx={{ gap: "3px", p: "5px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={(t) => ({
            height: 2.5,
            width: dot ? 2.5 : `${70 - i * 8}%`,
            minWidth: dot ? 2.5 : 8,
            borderRadius: 999,
            backgroundColor: alpha(t.palette.text.primary, 0.22),
          })}
        />
      ))}
    </Stack>
  );
}

function ContentPane({ children, sx }) {
  return (
    <Box
      sx={(t) => ({
        position: "relative",
        flex: 1,
        m: "5px",
        borderRadius: `${t.shape.borderRadius / 3}px`,
        backgroundColor: t.palette.surface.base,
        border: `1px solid ${t.palette.border.subtle}`,
        ...sx,
      })}
    >
      {children}
    </Box>
  );
}

export function Preview({ variant }) {
  switch (variant) {
    case "layout-default":
    case "dir-ltr":
      return (
        <Frame>
          <Box sx={(t) => ({ width: `${RAIL * 100}%`, backgroundColor: t.palette.surface.subtle })}>
            <RailLines />
          </Box>
          <ContentPane />
        </Frame>
      );

    case "dir-rtl":
      return (
        <Frame sx={{ flexDirection: "row-reverse" }}>
          <Box sx={(t) => ({ width: `${RAIL * 100}%`, backgroundColor: t.palette.surface.subtle })}>
            <RailLines />
          </Box>
          <ContentPane />
        </Frame>
      );

    case "layout-horizontal":
      return (
        <Frame sx={{ flexDirection: "column" }}>
          <Stack
            direction="row"
            sx={(t) => ({
              alignItems: "center",
              gap: "4px",
              px: "5px",
              height: "26%",
              backgroundColor: t.palette.mode === "dark" ? "#0f1622" : "#232f45",
            })}
          >
            <Box sx={{ width: 3.5, height: 3.5, borderRadius: "50%", bgcolor: "common.white" }} />
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={(t) => ({
                  height: 2.5,
                  width: 9,
                  borderRadius: 999,
                  backgroundColor: alpha(t.palette.common.white, 0.45),
                })}
              />
            ))}
          </Stack>
          <ContentPane sx={{ mt: "3px" }} />
        </Frame>
      );

    case "layout-mini":
      return (
        <Frame>
          <Box
            sx={(t) => ({ width: `${MINI_RAIL * 100}%`, backgroundColor: t.palette.surface.subtle })}
          >
            <RailLines dot />
          </Box>
          <ContentPane />
        </Frame>
      );

    case "mode-light":
      return (
        <Frame sx={{ backgroundColor: "#ffffff", borderColor: "#e0e0e0" }}>
          <Box sx={{ width: `${RAIL * 100}%`, backgroundColor: "#c7c7c7" }} />
          <Box sx={{ flex: 1, m: "5px", borderRadius: "3px", backgroundColor: "#f7f7f7" }} />
        </Frame>
      );

    case "mode-dark":
      return (
        <Frame sx={{ backgroundColor: "#141414", borderColor: "#333333" }}>
          <Box sx={{ width: `${RAIL * 100}%`, backgroundColor: "#333333" }} />
          <Box sx={{ flex: 1, m: "5px", borderRadius: "3px", backgroundColor: "#242424" }} />
        </Frame>
      );

    case "mode-system":
      return (
        <Frame sx={{ backgroundColor: "#ffffff", borderColor: "#c7c7c7" }}>
          <Box sx={{ width: `${RAIL * 100}%`, backgroundColor: "#c7c7c7" }} />
          <Box sx={{ flex: 1, position: "relative", backgroundColor: "#ffffff" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#1c2430",
                clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
              }}
            />
          </Box>
        </Frame>
      );

    case "width-fluid":
      return (
        <Frame>
          <Box sx={(t) => ({ width: `${RAIL * 100}%`, backgroundColor: t.palette.surface.subtle })} />
          <ContentPane />
        </Frame>
      );

    case "width-container":
      return (
        <Frame>
          <Box sx={(t) => ({ width: `${RAIL * 100}%`, backgroundColor: t.palette.surface.subtle })} />
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <ContentPane sx={{ flex: "0 0 62%" }} />
          </Box>
        </Frame>
      );

    default:
      return <Frame />;
  }
}

/* ── selection affordances ────────────────────────────────────────────────
   Every reference marks the chosen option with a ring AND a check. The check
   is not decoration — it is what keeps the selection legible in greyscale and
   for colour-vision deficiency, where a ring alone can vanish.              */

function CheckDot({ size = 16 }) {
  return (
    <Box
      aria-hidden
      sx={(t) => ({
        position: "absolute",
        top: -5,
        insetInlineEnd: -5,
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        backgroundColor: t.palette.primary.main,
        color: t.palette.primary.contrastText,
        border: `2px solid ${t.palette.surface.raised}`,
        "& svg": { fontSize: size - 6 },
      })}
    >
      <CheckIcon />
    </Box>
  );
}

/** A visual radio. The whole card is the target, not just the label. */
export function OptionCard({ label, selected, onSelect, children }) {
  return (
    <Box
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={(t) => ({ cursor: "pointer", minWidth: 0, ...focusRing(t) })}
    >
      <Box
        sx={(t) => ({
          position: "relative",
          borderRadius: `${t.shape.borderRadius}px`,
          padding: "3px",
          border: `2px solid ${selected ? t.palette.primary.main : "transparent"}`,
          transition: t.transitions.create("border-color", {
            duration: t.transitions.duration.shortest,
          }),
          "&:hover": { borderColor: selected ? t.palette.primary.main : t.palette.border.default },
        })}
      >
        {children}
        {selected && <CheckDot />}
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 0.75,
          textAlign: "center",
          fontWeight: selected ? 600 : 400,
          color: selected ? "text.primary" : "text.secondary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/* ── section ──────────────────────────────────────────────────────────────
   A quiet label and a lot of air above it. No icon, no chevron, always open. */

function Section({ title, note, children, first }) {
  return (
    <Box component="section" sx={{ pt: first ? 3 : 4, pb: 1 }}>
      <Typography variant="h6" sx={{ fontSize: 15 }}>
        {title}
      </Typography>
      {note && (
        <Typography variant="body2" sx={{ color: "text.tertiary", mt: 0.25, mb: 2 }}>
          {note}
        </Typography>
      )}
      {children}
    </Box>
  );
}

/**
 * Always three tracks, whatever the option count.
 *
 * Giving a two-option group two tracks made its cards half again as tall as the
 * three-option groups' — same kind of thing, visibly different size, which is a
 * Law of Similarity break the eye reads as sloppiness. Two options now fill two
 * of three slots and the trailing gap reads as deliberate.
 */
function CardGrid({ label, children }) {
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 1.5,
      }}
    >
      {children}
    </Box>
  );
}

/* ── colour swatches ──────────────────────────────────────────────────────
   Nine repeats of the same layout diagram told the reader nothing nine times.
   A swatch row says the only thing that differs — the hue — and names the
   current choice underneath, which is recognition rather than recall.       */

function SchemeSwatches({ value, onChange }) {
  const current = schemes[value] ?? schemes.default;
  return (
    <Box>
      <Box
        role="radiogroup"
        aria-label="Color scheme"
        sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}
      >
        {Object.entries(schemes).map(([id, sc]) => {
          const selected = id === value;
          return (
            <Tooltip key={id} title={sc.label}>
              <Box
                role="radio"
                aria-checked={selected}
                aria-label={sc.label}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onChange(id);
                  }
                }}
                sx={(t) => ({
                  position: "relative",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  cursor: "pointer",
                  backgroundColor: sc.swatch,
                  display: "grid",
                  placeItems: "center",
                  color: t.palette.common.white,
                  boxShadow: selected
                    ? `0 0 0 2px ${t.palette.surface.raised}, 0 0 0 4px ${t.palette.primary.main}`
                    : `0 0 0 1px ${alpha(t.palette.common.black, 0.12)}`,
                  transition: t.transitions.create("box-shadow", {
                    duration: t.transitions.duration.shortest,
                  }),
                  "& svg": { fontSize: 18 },
                  ...focusRing(t),
                })}
              >
                {selected && <CheckIcon />}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
        {current.label}
        {!current.fromFigma && (
          <Box component="span" sx={{ color: "text.tertiary" }}>
            {" · generated, not a published Figma ramp"}
          </Box>
        )}
      </Typography>
    </Box>
  );
}

/* ── typography chips ─────────────────────────────────────────────────────── */

function FontChips({ value, onChange }) {
  return (
    <Box
      role="radiogroup"
      aria-label="Typography"
      sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
    >
      {Object.entries(fonts).map(([id, f]) => {
        const selected = id === value;
        return (
          <Box
            key={id}
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(id);
              }
            }}
            sx={(t) => ({
              cursor: "pointer",
              // Set in its own face, so the chip is the specimen.
              fontFamily: f.stack,
              fontSize: 14,
              fontWeight: selected ? 600 : 400,
              lineHeight: "20px",
              px: 1.5,
              py: 0.75,
              borderRadius: `${t.shape.borderRadius / 2}px`,
              color: selected ? t.palette.primary.main : t.palette.text.secondary,
              border: `1px solid ${selected ? t.palette.primary.main : t.palette.border.subtle}`,
              backgroundColor: selected
                ? alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.16 : 0.05)
                : "transparent",
              "&:hover": {
                borderColor: selected ? t.palette.primary.main : t.palette.border.strong,
              },
              ...focusRing(t),
            })}
          >
            {f.label}
          </Box>
        );
      })}
    </Box>
  );
}

/* ── the drawer ───────────────────────────────────────────────────────────── */

const LAYOUTS = [
  { id: "default", label: "Default", preview: "layout-default" },
  { id: "horizontal", label: "Horizontal", preview: "layout-horizontal" },
  { id: "mini", label: "Mini", preview: "layout-mini" },
];

const DIRECTIONS = [
  { id: "ltr", label: "LTR", preview: "dir-ltr" },
  { id: "rtl", label: "RTL", preview: "dir-rtl" },
];

const MODES = [
  { id: "light", label: "Light", preview: "mode-light" },
  { id: "dark", label: "Dark", preview: "mode-dark" },
  { id: "system", label: "System", preview: "mode-system" },
];

const WIDTHS = [
  { id: "fluid", label: "Fluid", preview: "width-fluid" },
  { id: "container", label: "Container", preview: "width-container" },
];

export function ThemeCustomizer({ open, onClose }) {
  const s = useSettings();
  const PAD = 3;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: layoutTokens.settingsPanel },
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* header — a plain surface, not a saturated band. Every reference panel
          keeps its chrome quiet so the options carry the colour. */}
      <Stack
        direction="row"
        sx={(t) => ({
          alignItems: "flex-start",
          gap: 2,
          px: PAD,
          pt: 3,
          pb: 2.5,
          flexShrink: 0,
          borderBottom: `1px solid ${t.palette.border.subtle}`,
        })}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5">Theme customization</Typography>
          <Typography variant="body2" sx={{ color: "text.tertiary", mt: 0.25 }}>
            Layout, colour, direction and typography
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close theme customization" sx={{ mt: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </Stack>

      {/* body */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: PAD, pb: 2 }}>
        <Section title="Layout" note="Where navigation sits" first>
          <CardGrid label="Layout">
            {LAYOUTS.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                selected={s.layout === o.id}
                onSelect={() => s.set({ layout: o.id })}
              >
                <Preview variant={o.preview} />
              </OptionCard>
            ))}
          </CardGrid>
        </Section>

        <Divider />

        <Section title="Mode" note="Light, dark, or follow the system">
          <CardGrid label="Mode">
            {MODES.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                selected={s.mode === o.id}
                onSelect={() => s.set({ mode: o.id })}
              >
                <Preview variant={o.preview} />
              </OptionCard>
            ))}
          </CardGrid>
        </Section>

        <Divider />

        <Section title="Colour" note="Changes the brand hue only — never the status colours">
          <SchemeSwatches value={s.scheme} onChange={(v) => s.set({ scheme: v })} />
        </Section>

        <Divider />

        <Section title="Typography" note="Body typeface">
          <FontChips value={s.font} onChange={(v) => s.set({ font: v })} />
        </Section>

        <Divider />

        <Section title="Direction" note="Reading order of the whole shell">
          <CardGrid label="Direction">
            {DIRECTIONS.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                selected={s.direction === o.id}
                onSelect={() => s.set({ direction: o.id })}
              >
                <Preview variant={o.preview} />
              </OptionCard>
            ))}
          </CardGrid>
        </Section>

        <Divider />

        <Section title="Content width" note="Fluid, or capped at a reading measure">
          <CardGrid label="Content width">
            {WIDTHS.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                selected={s.width === o.id}
                onSelect={() => s.set({ width: o.id })}
              >
                <Preview variant={o.preview} />
              </OptionCard>
            ))}
          </CardGrid>
        </Section>
      </Box>

      {/* sticky footer */}
      <Stack
        direction="row"
        sx={(t) => ({
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: PAD,
          py: 2,
          borderTop: `1px solid ${t.palette.border.subtle}`,
          backgroundColor: t.palette.surface.raised,
        })}
      >
        <Button variant="text" onClick={s.reset}>
          Reset to defaults
        </Button>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </Stack>
    </Drawer>
  );
}
