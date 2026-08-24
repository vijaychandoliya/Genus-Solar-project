/**
 * Ramp generation — the lightness curve behind the generated colour schemes.
 *
 * Lives in src/ because three callers need it: the generator, the contrast gate,
 * and the token editor's live preview. There must be exactly ONE copy of this
 * curve — two copies drifting apart would let the gate score a palette the
 * product does not render, and pass.
 */

/** One monotonic lightness curve for every generated ramp. */
export const RAMP_LIGHTNESS = { 100: 92, 200: 80, 300: 69, 400: 58, 500: 47, 600: 38, 700: 28 };

export function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h, s, l) {
  // Clamp before converting. `generateRamp` OFFSETS lightness from the base, so
  // any base above ~55% HSL lightness drives step 100 past 100% — which made `c`
  // negative and produced an eleven-character non-hex like `#12511e101`. Three of
  // the seven generated schemes (indigo, violet, periwinkle) did exactly that,
  // and `RING_ORDER.dark` reaches step 100, so the value was reachable and was
  // being scored as though it were a colour. Found by scripts/ramp-compare.mjs.
  const S = Math.min(100, Math.max(0, s)) / 100;
  const L = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - c / 2;
  const seg = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ][Math.floor((h % 360) / 60)];
  const to = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(seg[0])}${to(seg[1])}${to(seg[2])}`;
}

/* ── OKLab / OKLCH ─────────────────────────────────────────────────────────
   Björn Ottosson's matrices, inlined rather than taken from a dependency. Both
   the build gate (plain Node) and the bundler import this file, and forty lines
   of arithmetic is cheaper in both than a shared runtime dep — the same reason
   contrast.js carries its own luminance maths.

   Why it exists: HSL lightness is not perceptually uniform, so equal steps on
   the curve above look unequal at high chroma, and the contrast a step DISTANCE
   buys therefore varies by hue. Material guarantees 3:1 at a tone difference of
   40 and 4.5:1 at 50 precisely because its space is perceptual; USWDS's grade
   system is the same trick. See docs/design-system-presets-research.md §9.1. */

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function hexToOklch(hexStr) {
  const n = parseInt(hexStr.slice(1), 16);
  const r = toLinear(((n >> 16) & 255) / 255);
  const g = toLinear(((n >> 8) & 255) / 255);
  const b = toLinear((n & 255) / 255);

  const L = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const M = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const S = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const l = 0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S;
  const a = 1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S;
  const bb = 0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S;

  return { l, c: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180) / Math.PI };
}

/** OKLCH → linear sRGB. Returns components unclamped, so gamut can be tested. */
function oklchToLinear(l, c, h) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

const inGamut = ([r, g, b]) => [r, g, b].every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/**
 * OKLCH → hex, gamut-mapped by reducing chroma.
 *
 * A vivid hue at an extreme lightness has no sRGB representation, and clipping
 * the channels shifts the HUE — which would silently change the brand colour of
 * whichever scheme asked for it. Binary-searching chroma instead keeps hue and
 * lightness exactly and gives up only saturation, which is the one of the three
 * a scheme can afford to lose. This is the CSS Color 4 approach.
 */
export function oklchToHex(l, c, h) {
  const L = clamp01(l);
  let lo = 0;
  let hi = c;
  if (!inGamut(oklchToLinear(L, hi, h))) {
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear(L, mid, h))) lo = mid;
      else hi = mid;
    }
  } else lo = hi;

  const to = (v) =>
    Math.round(clamp01(toSrgb(clamp01(v))) * 255)
      .toString(16)
      .padStart(2, "0");
  const [r, g, b] = oklchToLinear(L, lo, h);
  return `#${to(r)}${to(g)}${to(b)}`;
}

/**
 * The same seven targets, expressed as the perceptual lightness of today's grey
 * at each HSL step. Derived rather than hand-picked on purpose: it makes the
 * OKLCH ramp land in the same perceptual place the HSL one aimed at, so the
 * only variable under test is the SPACE, not the curve.
 */
export const RAMP_LIGHTNESS_OK = Object.fromEntries(
  Object.entries(RAMP_LIGHTNESS).map(([step, l]) => [step, hexToOklch(hslToHex(0, 0, l)).l]),
);

/** `hsl` is today. `oklch` ports the offset rule; `oklch-abs` fixes the targets. */
export const RAMP_SPACES = ["hsl", "oklch", "oklch-abs"];

/**
 * Step 500 IS the given base, verbatim — the chosen colour is never "corrected".
 * The other steps keep its hue and saturation and only move lightness, so a
 * muted base stays muted instead of being pushed to a vivid mid-tone.
 *
 * `space` selects how "move lightness" is interpreted:
 *
 *   hsl        Today. Offsets HSL lightness from the base's own. Not perceptual.
 *   oklch      The direct port — offsets OKLCH lightness by the same delta. Keeps
 *              the "a muted base stays muted" property, gains uniform steps.
 *   oklch-abs  Fixed absolute targets. Gives up the offset rule and in exchange
 *              makes step distance mean the same thing for EVERY base, which is
 *              the property Material and USWDS publish guarantees against.
 *
 * Changing the default is a visible colour change to the seven generated schemes
 * and needs sign-off — docs/token-engine-architecture.md §5.3, and step S1.1 of
 * docs/looks-workplan.md. Measure with `node scripts/ramp-compare.mjs` first.
 */
export function generateRamp(base, space = "hsl") {
  if (space === "hsl") {
    const { h, s, l } = hexToHsl(base);
    const anchor = RAMP_LIGHTNESS[500];
    return Object.fromEntries(
      Object.entries(RAMP_LIGHTNESS).map(([step, target]) => [
        step,
        Number(step) === 500 ? base : hslToHex(h, s, l + (target - anchor)),
      ]),
    );
  }

  const { l, c, h } = hexToOklch(base);
  const anchor = RAMP_LIGHTNESS_OK[500];
  return Object.fromEntries(
    Object.entries(RAMP_LIGHTNESS_OK).map(([step, target]) => [
      step,
      Number(step) === 500
        ? base
        : oklchToHex(space === "oklch-abs" ? target : l + (target - anchor), c, h),
    ]),
  );
}

/** Every scheme's ramp, whether given by Figma or generated from a base hue. */
export const rampFor = (def, primitives, space = "hsl") =>
  def.ramp ? primitives[def.ramp] : generateRamp(def.base, space);
