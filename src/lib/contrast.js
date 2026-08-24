/**
 * WCAG 2.1 contrast maths — the single implementation for the whole product.
 *
 * Lives in src/ because the running app needs it (the token editor scores every
 * edit live) and the build needs it (scripts/check-a11y.mjs gates the result).
 * scripts/contrast.mjs re-exports this file rather than keeping a second copy: a
 * generator and a gate that disagree about what 4.5:1 means is worse than having
 * no gate at all.
 *
 * See docs/token-engine-architecture.md §1.3 for why these constants and not the
 * alternatives.
 */

/**
 * Linearise one sRGB channel.
 *
 * The threshold is 0.04045, not the 0.03928 of the older WCAG text. The
 * difference is under one 8-bit step and never changes a verdict, but pinning it
 * keeps this in agreement with browser devtools and keeps CI stable.
 */
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** #rgb / #rrggbb → [r, g, b] as 0–255. Throws on anything else. */
export function rgb(hex) {
  const h = String(hex).trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(h);
  if (short) return short.slice(1).map((c) => parseInt(c + c, 16));
  const full = /^#([0-9a-f]{6})$/i.exec(h);
  if (!full) throw new Error(`not a hex colour: ${hex}`);
  const n = parseInt(full[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const isHex = (v) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v).trim());

/** [r,g,b] 0–255 → #rrggbb. */
export const hex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;

/** Relative luminance, 0–1. */
export function luminance(color) {
  const [r, g, b] = rgb(color).map((v) => v / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio between two opaque colours. Order-independent, 1–21. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Composite a translucent colour over its backdrop, in gamma sRGB — which is
 * what the browser does — so the result matches what a reader actually sees.
 * Contrast against a translucent token is undefined without this.
 */
export function composite(color, alpha, backdrop) {
  const [r, g, b] = rgb(color);
  const [br, bg, bb] = rgb(backdrop);
  return hex([r * alpha + br * (1 - alpha), g * alpha + bg * (1 - alpha), b * alpha + bb * (1 - alpha)]);
}

/**
 * The ratio a pair must clear, or `null` when WCAG asks for nothing.
 *
 * `decorative` returns null and that is load-bearing. SC 1.4.11 requires 3:1 of
 * *user interface components and graphical objects* — a panel edge or a card
 * border is neither. Treating it as text was a real bug: it demanded 4.5:1 of a
 * border, which made enforcement mode block 15 of 28 perfectly good colours on
 * a slot that has no contrast requirement at all. The exemption belongs to the
 * KIND, decided here once, not to each caller remembering.
 *
 * `large scale` is ≥18pt (24px), or ≥14pt (18.66px) at bold. Run against the
 * Genus ramp only display/xl (56), heading/2 (32) and heading/3 (28) qualify —
 * title/l at 20/600 does NOT, because 20px is under 24 and 600 is semibold. So
 * this is COMPUTED from the type token and never taken on trust from a caller.
 */
export function requiredRatio(kind, typeToken, typeStyles) {
  if (kind === "decorative") return null;
  if (kind === "ui") return 3;
  const s = typeToken ? typeStyles?.[typeToken] : null;
  const large = Boolean(s) && (s.size >= 24 || (s.size >= 18.66 && s.weight >= 700));
  return large ? 3 : 4.5;
}

/** Does this type style qualify as WCAG large-scale text? */
export const isLargeText = (style) =>
  Boolean(style) && (style.size >= 24 || (style.size >= 18.66 && style.weight >= 700));

/**
 * The first candidate foreground that clears `min` against `fill`.
 *
 * Candidates are tried in order, so put the house default first and the blunt
 * instrument last: white reads as the brand's own voice, near-black is the
 * fallback, and pure black is only reached by fills that need it. Two of the
 * nine schemes do — Indigo and Periwinkle in light mode sit at the luminance
 * where neither white nor neutral-950 reaches 4.5:1 (§0.5).
 *
 * Returns `{ fg, ratio, exact }`. `exact: false` means NOTHING cleared `min`
 * and this is merely the best available — callers must treat that as a failure,
 * never as a result.
 */
export function bestOn(fill, candidates, min = 4.5) {
  let best = null;
  for (const fg of candidates) {
    const ratio = contrast(fg, fill);
    if (ratio >= min) return { fg, ratio, exact: true };
    if (!best || ratio > best.ratio) best = { fg, ratio, exact: false };
  }
  return best;
}

/**
 * The first step in `order` whose ramp colour clears `min` against `against`.
 *
 * `order` is explicit because the direction that helps depends on the mode: in
 * light mode a ring must go DARKER to separate from a pale surface, in dark mode
 * LIGHTER. Encoding that as "walk up the numbers" would be right in one mode and
 * exactly wrong in the other.
 */
export function stepClearing(ramp, order, against, min = 3) {
  let best = null;
  for (const step of order) {
    const ratio = contrast(ramp[step], against);
    if (ratio >= min) return { step: String(step), ratio, exact: true };
    if (!best || ratio > best.ratio) best = { step: String(step), ratio, exact: false };
  }
  return best;
}

/* ── APCA, advisory only ──────────────────────────────────────────────────
   Reported as a second opinion in the editor, never as a gate. WCAG 2.1 AA is
   what ADA and EAA conformance is measured against, and APCA scores are not
   back-compatible — a pair can pass one and fail the other. This is the
   published APCA-W3 0.1.9 formulation; treat the number as indicative.        */

const apcaY = (color) => {
  const [r, g, b] = rgb(color).map((v) => (v / 255) ** 2.4);
  return 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
};

/** Lightness contrast, roughly −108…+108. Sign carries polarity. */
export function apca(text, background) {
  const clamp = (y) => (y < 0.022 ? y + (0.022 - y) ** 1.414 : y);
  const yt = clamp(apcaY(text));
  const yb = clamp(apcaY(background));
  const dark = yb > yt; // dark text on a light background
  const raw = dark
    ? (yb ** 0.56 - yt ** 0.57) * 1.14
    : (yb ** 0.65 - yt ** 0.62) * 1.14;
  const out = dark
    ? Math.max(0, raw - 0.027) * 100
    : Math.min(0, raw + 0.027) * 100;
  return Math.abs(out) < 7.5 ? 0 : out;
}

/**
 * APCA's own guidance, as a readable band. Body copy at 16px regular wants
 * roughly Lc 60–75.
 */
export function apcaBand(lc) {
  const a = Math.abs(lc);
  if (a >= 90) return "excellent";
  if (a >= 75) return "body text";
  if (a >= 60) return "large text";
  if (a >= 45) return "headlines";
  if (a >= 30) return "non-text";
  return "insufficient";
}
