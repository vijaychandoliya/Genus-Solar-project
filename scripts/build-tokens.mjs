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
import { resolveTokens, assertResolved } from "../src/lib/token-resolve.js";

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

/* ── resolve ──────────────────────────────────────────────────────────────
   The resolution itself lives in src/lib/token-resolve.js, shared with the
   contrast gate and the token editor's live preview. This file only EMITS.

   That split is deliberate: when the editor previews a draft it runs this exact
   function, so "it looked right in the editor" and "this is what the build
   writes" are the same statement rather than two hopeful ones.               */

const varName = (path) => `--genus-${path.replace(/\//g, "-")}`;

const R = resolveTokens(src);
const { flat: prims, semantic, contrastOn, derivations, components, componentDefs } = R;
const light = semantic.light;
const dark = semantic.dark;

// The resolver also returns each scheme's `base` and full `ramp`, which the token
// editor needs to render and re-generate a ramp. They are stripped here: this
// file is the SHIPPED snapshot, and it should not carry data only the editor
// uses. The editor resolves from the source document instead.
const schemes = Object.fromEntries(
  Object.entries(R.schemes).map(([id, s]) => {
    const { base, ramp, ...shipped } = s;
    return [id, shipped];
  }),
);

/* ── sanity checks, so a bad extraction fails loudly here ─────────────────
   assertResolved() is the same function the editor runs against a draft, so the
   editor can tell a user what would fail BEFORE they export.                 */

const problems = assertResolved(R);
const semCount = Object.keys(light).length;

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

const { spacing, radius, motion, layout } = R;

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

/**
 * Compliant label colours for the fills a scheme does NOT change — the accent
 * and the four status ramps. DERIVED, not extracted: Figma's single
 * \`text/on-brand\` (white) is 1.9:1 on warning-500, so one shared value cannot
 * be correct for every fill. See docs/token-engine-architecture.md §0.5.
 */
export const contrastOn = ${j(contrastOn)};

/**
 * TIER 3 — component slots, resolved per mode. \`theme.component.kpiTile.padding\`.
 *
 * A component reads these instead of hard-coding its own geometry and colour, so
 * a designer can retune a card in the editor without a developer opening the
 * file. Every slot aliases a lower tier; see the \`components\` block in
 * scripts/figma-tokens.json for the reference syntax and the tier rule.
 */
export const components = ${j(components)};

/**
 * The RAW tier-3 definitions, still holding their \`{sem:…}\` references.
 * \`components\` above is these resolved against the DEFAULT scheme; every other
 * scheme re-resolves from here via \`componentsFor()\`, because a slot aliasing
 * \`action/primary/rest\` has a different value in every scheme and baking one
 * copy pinned them all to blue.
 */
export const componentDefs = ${j(componentDefs)};

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
    `${Object.keys(src.fonts).filter((k) => !k.startsWith("$")).length} fonts, ` +
    `${derivations.length} derived foregrounds`,
);

// The blast radius of the override, stated so a reader does not have to diff the
// generated files. Labels and rings are counted separately because "could not
// use white" is meaningless for a ring — a ring is a brand step, not a label.
const labels = derivations.filter((d) => d.kind === "label");
const rings = derivations.filter((d) => d.kind === "ring");
const offWhite = labels.filter((d) => d.fg !== src.primitives.white);
const movedRings = rings.filter((d) => d.step !== d.defaultStep);
console.log(
  `  labels: ${offWhite.length} of ${labels.length} cannot use white ` +
    `(${offWhite.filter((d) => d.fg === src.primitives.black).length} need pure black)`,
);
console.log(`  rings:  ${rings.length} derived, ${movedRings.length} moved off the default step`);
