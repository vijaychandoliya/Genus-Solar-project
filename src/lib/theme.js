/**
 * The MUI theme, assembled entirely from generated tokens.
 *
 * There is not a single colour, font size or radius literal in this file — every
 * value dereferences src/lib/tokens.js, which is generated from the Figma export.
 * If a value looks wrong, fix it in Figma and re-run `npm run tokens`.
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
} from "./tokens.js";

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

function bandPalette(s) {
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

export function getTheme(mode = "light", direction = "ltr", scheme = "default", fontId = "inter") {
  const dark = mode === "dark";
  const base = semantic[dark ? "dark" : "light"];

  // A colour scheme swaps the brand hue and NOTHING else. Neutrals, surfaces,
  // text, borders and the status ramps are identical in every scheme, so no
  // preset can break contrast or restyle a warning.
  const sch = (schemes[scheme] ?? schemes.default)[dark ? "dark" : "light"];
  const s = {
    ...base,
    "action/primary/rest": sch.rest,
    "action/primary/hover": sch.hover,
    "action/primary/pressed": sch.pressed,
    "focus/ring": sch.focus,
  };

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

      primary: {
        main: s["action/primary/rest"],
        light: s["action/primary/hover"],
        dark: s["action/primary/pressed"],
        contrastText: s["text/on-brand"],
      },
      secondary: {
        main: s["action/accent/rest"],
        light: s["action/accent/hover"],
        dark: s["action/accent/pressed"],
        contrastText: s["text/on-brand"],
      },

      success: {
        main: primitives.success[500],
        light: s["status/success/background"],
        dark: s["status/success/foreground"],
        contrastText: s["text/on-brand"],
      },
      warning: {
        main: primitives.warning[500],
        light: s["status/warning/background"],
        dark: s["status/warning/foreground"],
        contrastText: s["text/on-brand"],
      },
      error: {
        main: primitives.danger[500],
        light: s["status/danger/background"],
        dark: s["status/danger/foreground"],
        contrastText: s["text/on-brand"],
      },
      info: {
        main: primitives.info[500],
        light: s["status/info/background"],
        dark: s["status/info/foreground"],
        contrastText: s["text/on-brand"],
      },

      background: { default: s["surface/base"], paper: s["surface/raised"] },
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
      band: bandPalette(s),
    },

    typography,

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
          outlined: { borderColor: s["border/subtle"] },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.control,
            minHeight: 32,
            paddingInline: spacing[3],
            ...font["label/l"],
            textTransform: "none",
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
          root: { borderRadius: radius.pill, ...font["label/m"], height: 22 },
          label: { paddingInline: spacing[2] },
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
          paper: { backgroundColor: s["surface/canvas"], borderColor: s["border/subtle"] },
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
