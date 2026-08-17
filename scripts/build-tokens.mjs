/**
 * Generates src/tokens.css and src/lib/tokens.js from scripts/figma-tokens.json.
 *
 * Run with:  npm run tokens
 *
 * The generated files carry a "do not edit" banner. If a value is wrong, it is wrong
 * in Figma or in the extraction — fix it there and regenerate, never in the output.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const src = JSON.parse(readFileSync(root("./figma-tokens.json"), "utf8"));

const BANNER = `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * Source:    Figma "Genus Design System" ${src.$meta.fileKey}
 *            ${src.$meta.page}
 * Extracted: ${src.$meta.extractedOn}
 * Generator: scripts/build-tokens.mjs  (npm run tokens)
 *
 * Colour and type are Figma's. Spacing, radius, motion and layout are NOT — see
 * the nonFigma.$provenance note in scripts/figma-tokens.json.
 */`;

/* ── helpers ─────────────────────────────────────────────────────────────── */

const varName = (path) => `--genus-${path.replace(/\//g, "-")}`;

/** "neutral.950" | "white" → hex, resolved out of primitives. */
function deref(alias) {
  const [family, step] = alias.split(".");
  const node = src.primitives[family];
  if (node === undefined) throw new Error(`unknown primitive family: ${alias}`);
  if (step === undefined) {
    if (typeof node !== "string") throw new Error(`${family} needs a step`);
    return node;
  }
  const hex = node[step];
  if (!hex) throw new Error(`unknown primitive step: ${alias}`);
  return hex;
}

/** Flatten primitives to { "blue-500": "#0467b2", "white": "#ffffff", … }. */
function flatPrimitives() {
  const out = {};
  for (const [family, node] of Object.entries(src.primitives)) {
    if (typeof node === "string") out[family] = node;
    else for (const [step, hex] of Object.entries(node)) out[`${family}-${step}`] = hex;
  }
  return out;
}

/** Resolve every semantic token for one mode → { "surface/canvas": "#ffffff", … }. */
function resolveSemantic(mode) {
  const out = {};
  for (const [path, alias] of Object.entries(src.semantic)) {
    if (path.startsWith("$")) continue;
    out[path] = deref(alias[mode]);
  }
  return out;
}

/* ── colour schemes ───────────────────────────────────────────────────────
   A scheme swaps the BRAND HUE and nothing else. Neutrals, surfaces, text,
   borders and the status ramps are untouched, so no scheme can break contrast
   or restyle a warning.                                                      */

/** One monotonic lightness curve for every generated ramp. */
const RAMP_LIGHTNESS = { 100: 92, 200: 80, 300: 69, 400: 58, 500: 47, 600: 38, 700: 28 };

function hexToHsl(hex) {
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

function hslToHex(h, s, l) {
  const S = s / 100;
  const L = l / 100;
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

/**
 * Step 500 IS the given base, verbatim — the chosen colour is never "corrected".
 * The other steps keep its hue and saturation and only move lightness, so a
 * muted base stays muted instead of being pushed to a vivid mid-tone.
 */
function generateRamp(base) {
  const { h, s, l } = hexToHsl(base);
  const anchor = RAMP_LIGHTNESS[500];
  return Object.fromEntries(
    Object.entries(RAMP_LIGHTNESS).map(([step, target]) => [
      step,
      Number(step) === 500 ? base : hslToHex(h, s, l + (target - anchor)),
    ]),
  );
}

function buildSchemes() {
  const out = {};
  for (const [id, def] of Object.entries(src.schemes)) {
    if (id.startsWith("$")) continue;
    const ramp = def.ramp ? src.primitives[def.ramp] : generateRamp(def.base);
    out[id] = {
      label: def.label,
      // Figma-sourced schemes are flagged, so a reader can tell which nine of
      // these the design system actually stands behind.
      fromFigma: Boolean(def.ramp),
      swatch: ramp[500],
      light: { rest: ramp[500], hover: ramp[600], pressed: ramp[700], focus: ramp[500] },
      dark: { rest: ramp[400], hover: ramp[300], pressed: ramp[200], focus: ramp[300] },
    };
  }
  return out;
}

const prims = flatPrimitives();
const light = resolveSemantic("light");
const dark = resolveSemantic("dark");
const schemes = buildSchemes();

/* ── sanity checks, so a bad extraction fails loudly here ─────────────────── */

const problems = [];
const EXPECTED_SEMANTIC = 28;
const semCount = Object.keys(light).length;
if (semCount !== EXPECTED_SEMANTIC)
  problems.push(`expected ${EXPECTED_SEMANTIC} semantic tokens, resolved ${semCount}`);

for (const [path, hex] of Object.entries({ ...light, ...dark }))
  if (!/^#[0-9a-f]{6}$/i.test(hex)) problems.push(`${path} resolved to a non-hex: ${hex}`);

// Every semantic token must actually differ between modes, or it is not semantic.
// text/on-brand is the one legitimate exception — white on brand fill in both modes.
const SAME_IN_BOTH_MODES_OK = new Set(["text/on-brand"]);
for (const path of Object.keys(light))
  if (light[path] === dark[path] && !SAME_IN_BOTH_MODES_OK.has(path))
    problems.push(`${path} is identical in light and dark (${light[path]}) — check the alias table`);

if (problems.length) {
  console.error("Token build failed:\n  " + problems.join("\n  "));
  process.exit(1);
}

/* ── emit src/tokens.css ─────────────────────────────────────────────────── */

const cssBlock = (obj, indent = "  ") =>
  Object.entries(obj)
    .map(([k, v]) => `${indent}${varName(k)}: ${v};`)
    .join("\n");

const primBlock = Object.entries(prims)
  .map(([k, v]) => `  --genus-${k}: ${v};`)
  .join("\n");

const { spacing, radius, motion, layout } = src.nonFigma;

const scaleBlock = [
  ...Object.entries(spacing).map(([k, v]) => `  --genus-space-${k}: ${v}px;`),
  ...Object.entries(radius).map(([k, v]) => `  --genus-radius-${k}: ${v}px;`),
  ...Object.entries(motion)
    .filter(([k]) => k !== "easing")
    .map(([k, v]) => `  --genus-motion-${k}: ${v}ms;`),
  `  --genus-motion-easing: ${motion.easing};`,
].join("\n");

const typeBlock = Object.entries(src.type.styles)
  .flatMap(([k, s]) => {
    const n = k.replace(/\//g, "-");
    return [
      `  --genus-font-${n}-size: ${s.size}px;`,
      `  --genus-font-${n}-weight: ${s.weight};`,
      `  --genus-font-${n}-line: ${s.lineHeight}px;`,
      `  --genus-font-${n}-tracking: ${s.tracking}px;`,
    ];
  })
  .join("\n");

const css = `${BANNER}

/* ── primitives — mode-independent ─────────────────────────────────────── */
:root {
${primBlock}

/* ── scales ─────────────────────────────────────────────────────────────── */
  --genus-font-family: "${src.type.fontFamily}", system-ui, -apple-system, "Segoe UI", sans-serif;
${typeBlock}
${scaleBlock}

/* ── semantic — light ───────────────────────────────────────────────────── */
${cssBlock(light)}
}

/* ── semantic — dark, explicit ──────────────────────────────────────────── */
:root[data-mode="dark"] {
${cssBlock(dark)}
  color-scheme: dark;
}

/* ── semantic — dark, following the OS when mode is "system" ────────────── */
@media (prefers-color-scheme: dark) {
  :root[data-mode="system"] {
${cssBlock(dark, "    ")}
    color-scheme: dark;
  }
}

/* ── base ───────────────────────────────────────────────────────────────── */
html, body, #root { height: 100%; }
body {
  margin: 0;
  font-family: var(--genus-font-family);
  background: var(${varName("surface/base")});
  color: var(${varName("text/primary")});
  -webkit-font-smoothing: antialiased;
}
::selection {
  background: var(--genus-blue-100);
  color: var(--genus-blue-900);
}
:root[data-mode="dark"] ::selection {
  background: var(--genus-blue-800);
  color: var(--genus-blue-50);
}
`;

/* ── emit src/lib/tokens.js ──────────────────────────────────────────────── */

const j = (o) => JSON.stringify(o, null, 2);

const js = `${BANNER}

/** Raw palette steps. Mode-independent. Prefer a semantic token over these. */
export const primitives = ${j(src.primitives)};

/** Semantic roles, resolved to hex per mode. This is what the theme consumes. */
export const semantic = {
  light: ${j(light)},
  dark: ${j(dark)},
};

/** Inter ramp. 10/12/14/16/18/20/28/32/56 — sizes 24 and 40 do not exist here. */
export const type = ${j(src.type)};

/**
 * Brand-hue presets for the theme customiser. A scheme changes ONLY the
 * action/primary and focus/ring roles — neutrals, surfaces, text, borders and
 * the status ramps are identical in every scheme, so no preset can break
 * contrast or restyle a warning.
 */
export const schemes = ${j(schemes)};

/** Body-face presets. The ramp itself never changes — only the family. */
export const fonts = ${j(
  Object.fromEntries(Object.entries(src.fonts).filter(([k]) => !k.startsWith("$"))),
)};

export const spacing = ${j(spacing)};
export const radius = ${j(radius)};
export const motion = ${j(motion)};
export const layout = ${j(layout)};

/**
 * Resolve a semantic token for a mode.
 *   sem("dark", "surface/canvas") → "#141414"
 */
export function sem(mode, path) {
  const hex = semantic[mode === "dark" ? "dark" : "light"][path];
  if (!hex) throw new Error(\`unknown semantic token: \${path}\`);
  return hex;
}

/**
 * The CSS custom property for a semantic token, for the rare case something
 * outside MUI needs it (scrollbars, print rules, raw canvas).
 *   cssVar("surface/canvas") → "var(--genus-surface-canvas)"
 */
export const cssVar = (path) => \`var(--genus-\${path.replace(/\\//g, "-")})\`;

/** Every type style as a ready-to-spread sx object. */
export const font = Object.fromEntries(
  Object.entries(type.styles).map(([k, s]) => [
    k,
    {
      fontSize: s.size,
      fontWeight: s.weight,
      lineHeight: \`\${s.lineHeight}px\`,
      letterSpacing: \`\${s.tracking}px\`,
    },
  ]),
);
`;

mkdirSync(root("../src/lib"), { recursive: true });
writeFileSync(root("../src/tokens.css"), css);
writeFileSync(root("../src/lib/tokens.js"), js);

const figmaSchemes = Object.values(schemes).filter((s) => s.fromFigma).length;
console.log(
  `tokens built — ${Object.keys(prims).length} primitives, ${semCount} semantic × 2 modes, ` +
    `${Object.keys(src.type.styles).length} type styles, ` +
    `${Object.keys(schemes).length} schemes (${figmaSchemes} from Figma, ` +
    `${Object.keys(schemes).length - figmaSchemes} generated), ` +
    `${Object.keys(src.fonts).filter((k) => !k.startsWith("$")).length} fonts`,
);
