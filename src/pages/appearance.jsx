/**
 * Appearance — the operator's half of the token system.
 *
 * A separate route from /admin/design-tokens on purpose. The editor's density is
 * exactly what this page exists to protect people from: 29 semantic roles, 292
 * component slots and a nine-scheme matrix, none of which a brand owner can
 * evaluate. Putting the gallery inside it as an eighth tab would defeat the
 * point. One clearly-labelled door between them, one way by default.
 *
 * ── The rule this page is written to ──────────────────────────────────────
 * The word "token" never appears. Neither does "contrast", "semantic", "alias",
 * "tier", "mode matrix" or a hex value. A scheme is an "accent colour", because
 * that is what it does. A contrast shortfall is "hard to read", because that is
 * what it costs. See docs/design-system-presets-research.md §6.3 for the full
 * terminology map and §10.2 for why the cards preview a REAL screen rather than
 * a swatch row — a swatch row is a token-literate way to preview, and this
 * reader is the one person who cannot read it.
 *
 * ── Selecting applies immediately, and says so ────────────────────────────
 * The plan called for a preview mode that promised "nothing is saved yet". The
 * store persists `look` the moment it changes, so that promise would have been
 * false the instant the bar appeared. Rather than build a shadow copy of the
 * theme to make a sentence true, the page tells the truth: selecting shows the
 * Look everywhere, and the bar offers the way back. For a reversible visual
 * preference that is also the better interaction — the reader gets the real
 * thing in the real product, not a postage stamp.
 */
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { WsPage } from "../components/workspaces.jsx";
import { Panel } from "../components/molecules.jsx";
import { useTokens } from "../lib/token-store.jsx";
import { useSettings } from "../lib/settings.jsx";
import { LOOKS, lookPatch, shadowedBy, DEFAULT_LOOK } from "../lib/looks/index.js";
import { resolveTokens, semanticFor } from "../lib/token-resolve.js";
import source from "../../scripts/figma-tokens.json";

/* ── the miniature ─────────────────────────────────────────────────────────
   A slice of Overview and a slice of Alarms, painted from the Look's OWN
   resolved values rather than the live theme, so a card shows what you would
   get and not what you already have. Resolution is the same function the build
   uses, so the card is not an impression of the result — it is the result, at
   180 pixels.                                                               */

function Miniature({ lookId, scheme, mode }) {
  const p = useMemo(() => {
    const r = resolveTokens(source, lookPatch(lookId));
    return { s: semanticFor(r, scheme, mode), radius: r.radius, type: r.type.styles, layout: r.layout };
  }, [lookId, scheme, mode]);

  const { s, radius, type, layout } = p;

  /* Every dimension below is a px STRING on purpose. MUI's `sx` treats a bare
     number on borderRadius, padding and gap as a MULTIPLE of the theme scale, so
     `borderRadius: 8` renders as 64px and the miniature comes out as a row of
     ovals. These values are the Look's own resolved pixels and must not be
     rescaled by the theme the page happens to be wearing. */
  const px = (n) => `${n}px`;
  const tile = {
    flex: 1,
    minWidth: 0,
    background: s["surface/raised"],
    border: `1px solid ${s["border/subtle"]}`,
    borderRadius: px(radius.surface),
    padding: "8px",
  };
  const row = (i) => ({
    display: "flex",
    alignItems: "center",
    gap: "6px",
    height: px(Math.max(14, Math.round(layout.rowRegular / 3))),
    padding: "0 8px",
    background: i % 2 ? s["surface/subtle"] : s["surface/raised"],
    borderBottom: `1px solid ${s["border/subtle"]}`,
  });
  const bar = (w, h, c) => ({ width: px(w), height: px(h), borderRadius: "2px", background: c, flexShrink: 0 });

  return (
    <Box
      aria-hidden
      sx={{
        background: s["surface/canvas"],
        border: `1px solid ${s["border/default"]}`,
        borderRadius: px(radius.surface),
        p: 1,
        overflow: "hidden",
      }}
    >
      {/* header */}
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, mb: 1 }}>
        <Box sx={bar(28, 6, s["action/primary/rest"])} />
        <Box sx={bar(46, 5, s["text/tertiary"])} />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ ...bar(22, 10, s["action/primary/rest"]), borderRadius: px(radius.control) }} />
      </Stack>

      {/* three KPI tiles */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={tile}>
            <Box sx={{ ...bar(28, 4, s["text/tertiary"]), mb: 0.75 }} />
            <Typography
              sx={{
                fontSize: Math.round(type["heading/3"].size / 2),
                fontWeight: type["heading/3"].weight,
                lineHeight: 1,
                color: i === 0 ? s["action/primary/rest"] : s["text/primary"],
              }}
            >
              {["8.4", "97%", "12"][i]}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* a slice of a table */}
      <Box sx={{ border: `1px solid ${s["border/subtle"]}`, borderRadius: px(radius.surface), overflow: "hidden" }}>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={row(i)}>
            <Box sx={bar(6, 6, [s["status/danger/foreground"], s["status/warning/foreground"], s["status/success/foreground"]][i])} />
            <Box sx={bar(i === 1 ? 34 : 44, 4, s["text/primary"])} />
            <Box sx={{ flex: 1 }} />
            <Box sx={bar(18, 4, s["text/secondary"])} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ── one card ─────────────────────────────────────────────────────────────── */

function LookCard({ look, active, scheme, mode, onChoose }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onChoose(look.id)}
      aria-pressed={active}
      sx={(t) => ({
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
        color: "inherit",
        p: 1.5,
        borderRadius: `${t.shape.borderRadius}px`,
        background: t.palette.surface.raised,
        border: `${active ? 2 : 1}px solid ${active ? t.palette.primary.main : t.palette.border.subtle}`,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        "&:hover": { borderColor: t.palette.border.strong },
        "&:focus-visible": { outline: `2px solid ${t.palette.focusRing}`, outlineOffset: 2 },
      })}
    >
      <Miniature lookId={look.id} scheme={scheme} mode={mode} />

      <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {look.label}
        </Typography>
        {active && (
          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
            In use
          </Typography>
        )}
      </Stack>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {look.blurb}
      </Typography>

      {/* Present on every card, so it reads as furniture rather than as an
          alarm. The claim is only made because the build gate enforces it. */}
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, color: "text.tertiary" }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
        <Typography variant="caption">
          Readable
          {look.audit?.fixedVsStandard > 0 ? ` · fixes ${look.audit.fixedVsStandard} problems` : ""}
        </Typography>
      </Stack>
    </Box>
  );
}

/* ── the page ─────────────────────────────────────────────────────────────── */

export default function Appearance() {
  const { scheme, resolvedMode } = useSettings();
  const { look, setLook, overrides, revert } = useTokens();
  const [pending, setPending] = useState(null);
  const [previous, setPrevious] = useState(null);

  const current = LOOKS.find((l) => l.id === look) ?? LOOKS[0];

  /* Which of the reader's own earlier changes would keep overriding the Look
     they just picked. Applying never destroys an edit — overrides sit on top and
     keep winning — so an edit can silently SHADOW the Look and make it look
     broken. Named before anything happens, never resolved silently either way. */
  const shadowFor = (id) => shadowedBy(lookPatch(id), overrides);

  const choose = (id) => {
    if (id === look) return;
    const clashes = shadowFor(id);
    if (clashes.length) {
      setPending({ id, clashes });
      return;
    }
    setPrevious(look);
    setLook(id);
  };

  const commit = (id, dropOverrides) => {
    if (dropOverrides) shadowFor(id).forEach(revert);
    setPrevious(look);
    setLook(id);
    setPending(null);
  };

  /**
   * "Page background", not "surface/canvas.light".
   *
   * `shadowedBy` returns LEAF paths, so a colour override arrives with its mode
   * still attached. Strip that first — the reader does not need to be told that
   * light and dark are separate values to understand that they changed the page
   * background. Anything with no entry here falls back to a category name rather
   * than to the raw path, because a dialog that says `nonFigma.spacing.3` has
   * failed at the one job this page has.
   */
  const ROLE_LABELS = {
    "surface/canvas": "Page background",
    "surface/base": "Behind the cards",
    "surface/raised": "Card background",
    "surface/subtle": "Alternating rows",
    "surface/overlay": "Pop-up background",
    "text/primary": "Main text colour",
    "text/secondary": "Secondary text colour",
    "text/tertiary": "Faint text colour",
    "text/disabled": "Unavailable text colour",
    "border/default": "Borders",
    "border/subtle": "Faint borders",
    "border/strong": "Strong borders",
  };

  const plain = (path) => {
    const p = path.replace(/\.(light|dark)$/, "");
    if (p.startsWith("semantic.")) return ROLE_LABELS[p.slice(9)] ?? "A colour";
    if (p.startsWith("primitives.")) return "Colour palette";
    if (p.startsWith("nonFigma.radius.")) return "Corner roundness";
    if (p.startsWith("nonFigma.spacing.")) return "Spacing";
    if (p.startsWith("nonFigma.shadow.")) return "Shadows";
    if (p.startsWith("nonFigma.layout.")) return "Row height and layout";
    if (p.startsWith("type.")) return "Text size";
    return "A design setting";
  };

  return (
    <WsPage
      breadcrumbs={[{ label: "Genus Solar", to: "/overview" }, { label: "Administration" }]}
      title="Appearance"
      subtitle="Choose how Genus Solar looks. Every option here has been checked for readability. Picking one changes the whole product straight away, and you can change back at any time."
      actions={
        previous && previous !== look ? (
          <Button size="small" variant="outlined" onClick={() => setLook(previous)}>
            Back to {LOOKS.find((l) => l.id === previous)?.label ?? "Standard"}
          </Button>
        ) : null
      }
    >
      <Panel
        title="Looks"
        note={`Now showing ${current.label}. Your accent colour and light/dark setting stay as they are.`}
      >
        <Box
          sx={{
            p: 2,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          }}
        >
          {LOOKS.map((l) => (
            <LookCard
              key={l.id}
              look={l}
              active={l.id === look}
              scheme={scheme}
              mode={resolvedMode}
              onChoose={choose}
            />
          ))}
        </Box>
      </Panel>

      <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
        Need to change one specific colour or size?{" "}
        <Box component={RouterLink} to="/admin/design-tokens" sx={{ color: "primary.main" }}>
          Fine-tune the design
        </Box>
        .
      </Typography>

      {/* ── the one conflict that can actually bite ───────────────────────── */}
      <Dialog open={Boolean(pending)} onClose={() => setPending(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {pending?.clashes.length} of your earlier changes will keep overriding this Look
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            You changed these yourself, so they stay as you set them and this Look will not affect
            them.
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {[...new Set((pending?.clashes ?? []).map(plain))].map((label) => (
              <Typography key={label} component="li" variant="body2">
                {label}
              </Typography>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: "wrap" }}>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button variant="outlined" onClick={() => commit(pending.id, false)}>
            Keep my changes
          </Button>
          <Button variant="contained" onClick={() => commit(pending.id, true)}>
            Use the Look&apos;s
          </Button>
        </DialogActions>
      </Dialog>
    </WsPage>
  );
}
