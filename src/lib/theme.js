/**
 * The MUI theme, assembled entirely from tokens.
 *
 * There is not a single colour, font size or radius literal in this file — every
 * value comes from a token bundle. By default that is src/lib/tokens.js, the
 * generated snapshot. The token editor (`/admin/design-tokens`) passes a
 * live-resolved bundle instead, which is how an edit repaints the product
 * without a reload.
 *
 * If a value looks wrong, change the token — in the editor, or in
 * scripts/figma-tokens.json followed by `npm run tokens`. Never here.
 */
import { createTheme, alpha } from "@mui/material/styles";
import {
  primitives,
  semantic,
  type,
  radius,
  motion,
  spacing,
  font,
  schemes,
  fonts,
  contrastOn,
  components,
  componentDefs,
  layout,
  shadow,
} from "./tokens.js";
import { semanticFor, componentsFor } from "./token-resolve.js";

/* ── type ramp → MUI variants ─────────────────────────────────────────────
   The Figma ramp is the authority: 10/12/14/16/18/20/28/32/56 at weights
   400/500/600/700. Sizes 24 and 40 exist in the older WFM ramp and are
   deliberately absent here — do not reintroduce them to "fix" a heading.     */
const VARIANT_OF = {
  h1: "display/xl",
  h2: "heading/2",
  h3: "heading/3",
  h4: "title/l",
  h5: "title/m",
  h6: "label/l",
  subtitle1: "body/l",
  subtitle2: "label/m",
  body1: "body/m",
  body2: "body/s",
  button: "label/l",
  caption: "body/s",
  overline: "label/s",
};

/** Semantic band → the palette pair that paints it. See docs §5.1. */
export const BANDS = ["normal", "watch", "warning", "critical", "unknown"];

function bandPalette(s, primitives) {
  return {
    // `normal` is intentionally colourless — emphasis is a zero-sum budget and a
    // grid where every cell is tinted has no exceptions left to notice.
    normal: { fg: s["text/primary"], bg: "transparent", dot: "transparent" },
    watch: { fg: s["text/secondary"], bg: "transparent", dot: primitives.warning[500] },
    warning: {
      fg: s["status/warning/foreground"],
      bg: s["status/warning/background"],
      dot: primitives.warning[500],
    },
    critical: {
      fg: s["status/danger/foreground"],
      bg: s["status/danger/background"],
      dot: primitives.danger[500],
    },
    unknown: { fg: s["text/tertiary"], bg: s["surface/subtle"], dot: s["border/strong"] },
    // Reserved for a question the reader actually asked — "is this healthy?" —
    // never as a default for an in-range number.
    good: {
      fg: s["status/success/foreground"],
      bg: s["status/success/background"],
      dot: primitives.success[500],
    },
    info: {
      fg: s["status/info/foreground"],
      bg: s["status/info/background"],
      dot: primitives.info[500],
    },
  };
}

/**
 * The generated snapshot, used unless a caller passes an edited bundle. Keeping
 * this as the default means the app boots with zero resolution cost and the
 * token editor is purely additive.
 */
const DEFAULT_TOKENS = {
  primitives, semantic, type, radius, motion, spacing, layout, shadow, font, schemes, fonts,
  contrastOn, components, componentDefs,
};

/**
 * Build the MUI theme.
 *
 * `T` is a token bundle — the generated one by default, or a live-resolved one
 * from the token editor (see src/lib/token-store.jsx). It is destructured into
 * names that SHADOW the module-level imports, so every reference in the body
 * below reads from whichever bundle was passed without another line changing.
 */
export function getTheme(mode = "light", direction = "ltr", scheme = "default", fontId = "inter", T = DEFAULT_TOKENS) {
  const {
    primitives, semantic, type, radius, motion, spacing, font, schemes, fonts, contrastOn, components,
  } = T;
  const dark = mode === "dark";
  const base = semantic[dark ? "dark" : "light"];

  // A colour scheme swaps the brand hue and NOTHING else. Neutrals, surfaces,
  // text, borders and the status ramps are identical in every scheme, so no
  // preset can break contrast or restyle a warning.
  const sch = (schemes[scheme] ?? schemes.default)[dark ? "dark" : "light"];
  const s = semanticFor(T, scheme, dark ? "dark" : "light");

  // Derived label colours for the fills a scheme does not change. `sch.onBrand`
  // covers the brand fill, which does change per scheme.
  const on = contrastOn[dark ? "dark" : "light"];

  // Tier 3, for this mode. Read by the MuiButton/MuiChip overrides below and
  // exposed on the theme root as `component` for custom components.
  // Re-resolved for THIS scheme. Reading `components[mode]` here pinned every
  // component slot to the default scheme's blue — outlined buttons, text buttons,
  // active nav rows and selected tabs stayed blue in all nine schemes.
  const comp = componentsFor(T, scheme, dark ? "dark" : "light");
  const outlined = comp.button.variants.outlined.states;
  const textBtn = comp.button.variants.text.states;

  const family = (fonts[fontId] ?? fonts.inter).stack;

  const typography = {
    fontFamily: family,
    ...Object.fromEntries(
      Object.entries(VARIANT_OF).map(([variant, styleKey]) => [variant, { ...font[styleKey] }]),
    ),
  };
  typography.button.textTransform = "none";
  typography.overline.textTransform = "uppercase";

  return createTheme({
    direction,
    // cssVariables is deliberately off — it rewrites every palette reference into
    // var() indirection, which breaks alpha() in sx callbacks across the app.
    palette: {
      mode: dark ? "dark" : "light",

      // `contrastText` is DERIVED per fill, not read from `text/on-brand`.
      //
      // Figma declares one on-brand colour — white — and it does not survive
      // contact with the fills it lands on. White clears 4.5:1 on 3 of the 18
      // scheme/mode brand fills, and is 1.9:1 on warning-500. Every value below
      // comes from build-tokens.mjs, which picks the first of
      // white / neutral-950 / black that clears AA on that specific fill and
      // fails the build if none does. See docs/token-engine-architecture.md §0.5.
      primary: {
        main: s["action/primary/rest"],
        light: s["action/primary/hover"],
        dark: s["action/primary/pressed"],
        contrastText: sch.onBrand,
      },
      secondary: {
        main: s["action/accent/rest"],
        light: s["action/accent/hover"],
        dark: s["action/accent/pressed"],
        contrastText: on.accent,
      },

      success: {
        main: primitives.success[500],
        light: s["status/success/background"],
        dark: s["status/success/foreground"],
        contrastText: on.success,
      },
      warning: {
        main: primitives.warning[500],
        light: s["status/warning/background"],
        dark: s["status/warning/foreground"],
        contrastText: on.warning,
      },
      error: {
        main: primitives.danger[500],
        light: s["status/danger/background"],
        dark: s["status/danger/foreground"],
        contrastText: on.danger,
      },
      info: {
        main: primitives.info[500],
        light: s["status/info/background"],
        dark: s["status/info/foreground"],
        contrastText: on.info,
      },

      // The reference "Dashboard Template" screen in the Genus Design System
      // (Figma node 271:445) is unambiguous and consistent across every panel
      // in it: the page canvas is `surface/canvas`, and every card, the
      // sidebar, and the operational table all sit on `surface/raised` — not
      // `surface/base`, which this file had bound to the page instead. That
      // swap is what made panels read as barely distinct from the page in
      // dark mode; `surface/base` (Neutral-900, #242424) and `surface/raised`
      // (Neutral-800, #333333) are only one ramp step apart, while
      // `surface/canvas` (Neutral-950, #141414) and `surface/raised` are two.
      background: { default: s["surface/canvas"], paper: s["surface/raised"] },
      text: {
        primary: s["text/primary"],
        secondary: s["text/secondary"],
        tertiary: s["text/tertiary"],
        disabled: s["text/disabled"],
      },
      divider: s["border/subtle"],

      /* ── custom slots ───────────────────────────────────────────────────── */
      surface: {
        canvas: s["surface/canvas"],
        base: s["surface/base"],
        raised: s["surface/raised"],
        subtle: s["surface/subtle"],
        overlay: s["surface/overlay"],
      },
      border: {
        subtle: s["border/subtle"],
        default: s["border/default"],
        strong: s["border/strong"],
      },
      focusRing: s["focus/ring"],
      band: bandPalette(s, primitives),
    },

    typography,

    /**
     * TIER 3, on the theme root rather than inside `palette` — a component slot
     * bag holds dimensions and type styles as well as colours, and burying
     * `padding` inside `palette` would be a lie about what it is.
     *
     *   sx={(t) => ({ p: `${t.component.kpiTile.padding}px` })}
     */
    component: comp,

    /**
     * Elevation, for THIS mode — `sx={(t) => ({ boxShadow: t.elevation.md })}`.
     *
     * Nothing reads these yet: the product is deliberately flat, MuiPaper
     * defaults to elevation 0, and cards are separated by borders. They exist so
     * a Look can differ in DEPTH, which is the most legible difference after
     * colour. Named `elevation` rather than `shadows` because MUI's own
     * `theme.shadows` is a fixed 25-entry array and overwriting it would change
     * every MUI component that reads an elevation number.
     */
    elevation: shadow[dark ? "dark" : "light"],

    // Surfaces. Controls get 4 through the component overrides below — never
    // change `shape` to fix a control, it rescales every borderRadius in the app.
    shape: { borderRadius: radius.surface },

    // MUI's spacing scale is 8px-based, and every `p`/`gap`/`px` in this app was
    // written expecting that — `p: 2` meaning 16px, not 8. Basing it on the
    // token grid's 4px step instead silently halved every padding and gap in
    // the product, which is what made the UI feel airless. The 4px grid is
    // still reachable through half-steps: `p: 0.5` is 4px.
    spacing: (n) => n * spacing[2],

    transitions: {
      duration: { shortest: motion.fast, short: motion.medium, standard: motion.slow },
      easing: { easeInOut: motion.easing, easeOut: motion.easing, sharp: motion.easing },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*:focus-visible": {
            outline: `2px solid ${s["focus/ring"]}`,
            outlineOffset: 2,
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          // MUI paints an alpha-white overlay on dark elevated paper. That fights
          // the token system, and pinned table cells stop being opaque.
          root: { backgroundImage: "none", backgroundColor: s["surface/raised"] },
          // `border/subtle` and `surface/raised` are the SAME colour in dark
          // mode (#333333, Neutral-800 — Figma's own alias table, not a typo
          // here). A card's border and its fill being identical is a 1.00:1
          // contrast ratio — the edge is literally invisible, which is why
          // every outlined panel (KPI tiles most visibly, six side by side)
          // read as one merged block instead of six cards. `border/default`
          // is a full ramp step lighter and reads as a real edge in both
          // modes without touching the token values themselves.
          outlined: { borderColor: dark ? s["border/default"] : s["border/subtle"] },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          // TIER 3 — Components → Button in the token editor.
          root: {
            borderRadius: comp.button.radius,
            minHeight: comp.button.minHeight,
            paddingInline: comp.button.paddingInline,
            fontSize: comp.button.labelType.size,
            fontWeight: comp.button.labelType.weight,
            lineHeight: `${comp.button.labelType.lineHeight}px`,
            textTransform: "none",

            // Outlined and text had NO override, so they fell through to MUI's
            // defaults — whose outline is alpha(primary.main, .5), about 1.9:1 on
            // white in Sunset: a border you cannot see. Driving them from tier 3
            // is also what makes the token document TRUE, which is the whole
            // point of the tier: it names a border colour for these states, and
            // the product was painting a different one.
            //
            // Written as class selectors rather than `styleOverrides.variants`
            // because MUI v9 does not apply that form here — verified in the
            // browser, not assumed. The doubled class raises specificity above
            // MUI's own variant styles, which is what makes it stick.
            "&.MuiButton-outlined.MuiButton-colorPrimary": {
              color: outlined.rest.fg,
              borderColor: outlined.rest.border,
              "&:hover": { borderColor: outlined.hover.border, backgroundColor: outlined.hover.bg },
              "&:active": {
                color: outlined.pressed.fg,
                borderColor: outlined.pressed.border,
                backgroundColor: outlined.pressed.bg,
              },
              "&.Mui-focusVisible": { borderColor: outlined.focus.border },
              "&.Mui-disabled": { color: outlined.disabled.fg, borderColor: outlined.disabled.border },
            },
            "&.MuiButton-text.MuiButton-colorPrimary": {
              color: textBtn.rest.fg,
              "&:hover": { backgroundColor: textBtn.hover.bg },
              "&:active": { color: textBtn.pressed.fg, backgroundColor: textBtn.pressed.bg },
              "&.Mui-disabled": { color: textBtn.disabled.fg },
            },
          },
          sizeSmall: { minHeight: 28, ...font["label/m"] },
          containedPrimary: {
            backgroundColor: s["action/primary/rest"],
            "&:hover": { backgroundColor: s["action/primary/hover"] },
            "&:active": { backgroundColor: s["action/primary/pressed"] },
          },
          containedSecondary: {
            backgroundColor: s["action/accent/rest"],
            "&:hover": { backgroundColor: s["action/accent/hover"] },
            "&:active": { backgroundColor: s["action/accent/pressed"] },
          },

        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: radius.control },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: radius.control, ...font["body/m"] },
          input: { paddingBlock: spacing[2], paddingInline: spacing[3] },
          notchedOutline: { borderColor: s["border/default"] },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { ...font["body/m"] } } },
      MuiMenuItem: { styleOverrides: { root: { ...font["body/m"], minHeight: 32 } } },
      MuiSelect: { styleOverrides: { select: { ...font["body/m"] } } },

      MuiChip: {
        styleOverrides: {
          // TIER 3 — Components → Status chip. Colour still comes from the band
          // system; only geometry is a slot.
          root: {
            borderRadius: comp.statusChip.radius,
            height: comp.statusChip.height,
            fontSize: comp.statusChip.labelType.size,
            fontWeight: comp.statusChip.labelType.weight,
            lineHeight: `${comp.statusChip.labelType.lineHeight}px`,
          },
          label: { paddingInline: comp.statusChip.paddingInline },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: dark ? primitives.neutral[700] : primitives.neutral[900],
            color: primitives.white,
            ...font["body/s"],
            borderRadius: radius.control,
            paddingInline: spacing[2],
            paddingBlock: spacing[1],
          },
        },
      },

      MuiDivider: { styleOverrides: { root: { borderColor: s["border/subtle"] } } },

      MuiTableCell: {
        styleOverrides: {
          root: { borderBottomColor: s["border/subtle"], ...font["body/s"] },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          // Figma's own admin shell floats the sidebar as an elevated panel
          // on `surface/raised` — the same surface every card uses, not the
          // page's own `surface/canvas`. The border follows the same dark-mode
          // fix as `panelBorder()`: `border/subtle` on `surface/raised` is a
          // literal colour match in dark mode, so it uses `border/default`
          // there instead.
          paper: {
            backgroundColor: s["surface/raised"],
            borderColor: dark ? s["border/default"] : s["border/subtle"],
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { backgroundColor: s["surface/overlay"], borderRadius: radius.surface },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: { ...font["label/l"], textTransform: "none", minHeight: 40 },
        },
      },
    },
  });
}

/**
 * The border colour for a box whose FILL is `surface.subtle` or
 * `surface.raised` — never `t.palette.border.subtle` directly for that case.
 *
 * In dark mode, `border/subtle`, `surface/subtle` and `surface/raised` are
 * all the same Neutral-800 hex (#333333) in Figma's own alias table. A
 * border drawn in the same colour as its own fill is a 1.00:1 contrast
 * ratio — genuinely invisible, not just subtle — which is why outlined
 * panels and tinted tags read as one merged block in dark mode. This picks
 * `border/default` (a full ramp step lighter) in dark mode instead, and
 * leaves light mode untouched, where `border/subtle` (#e0e0e0) against white
 * or `surface/subtle` (#f0f0f0) was never a problem.
 */
export const panelBorder = (t) => (t.palette.mode === "dark" ? t.palette.border.default : t.palette.border.subtle);

/**
 * The focus treatment, for anywhere a custom control needs it explicitly.
 * 2px solid, offset 2 — WCAG 2.4.11.
 */
export const focusRing = (t) => ({
  "&:focus-visible": {
    outline: `2px solid ${t.palette.focusRing}`,
    outlineOffset: 2,
  },
});

/** Minimum interactive target — WCAG 2.5.8. */
export const TARGET_MIN = 24;

export { motion as MOTION };
