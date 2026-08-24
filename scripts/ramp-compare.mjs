/**
 * Measure the ramp colour space before changing it. Step S0.1 of
 * docs/looks-workplan.md.
 *
 * `generateRamp()` interpolates in HSL, whose lightness is not perceptually
 * uniform, so the contrast a step DISTANCE buys varies by hue — which is the
 * root cause behind 81 of the 113 known defects. Moving to OKLCH is decision D1
 * of docs/design-system-presets-research.md, and it is a VISIBLE colour change
 * to the seven generated schemes, so it needs a number before it needs sign-off.
 *
 * Resolves the token document once per space and scores each with the same
 * audit the build gate uses. Writes nothing. Changes nothing.
 *
 *   node scripts/ramp-compare.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { resolveTokens } from "../src/lib/token-resolve.js";
import { audit } from "../src/lib/a11y.js";
import { RAMP_SPACES, rampFor } from "../src/lib/ramp.js";

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const src = JSON.parse(readFileSync(root("./figma-tokens.json"), "utf8"));

/* The two Figma-given ramps cannot move — they are looked up, not generated. So
   they double as a control: if their counts differ between spaces, the harness
   is measuring something other than the space. */
const GENERATED = Object.entries(src.schemes)
  .filter(([id, def]) => !id.startsWith("$") && !def.ramp)
  .map(([id]) => id);
const GIVEN = Object.entries(src.schemes)
  .filter(([id, def]) => !id.startsWith("$") && def.ramp)
  .map(([id]) => id);

const score = (space) => {
  const resolved = resolveTokens(src, { $config: { rampSpace: space } });
  const rows = audit(resolved);
  const fails = rows.filter((r) => r.verdict.level === "fail");
  const byScheme = {};
  for (const r of fails) byScheme[r.scheme] = (byScheme[r.scheme] ?? 0) + 1;
  return {
    total: fails.length,
    byScheme,
    generated: GENERATED.reduce((n, s) => n + (byScheme[s] ?? 0), 0),
    given: GIVEN.reduce((n, s) => n + (byScheme[s] ?? 0), 0),
    unknown: rows.filter((r) => r.verdict.level === "unknown").length,
    resolved,
  };
};

const results = Object.fromEntries(RAMP_SPACES.map((s) => [s, score(s)]));
const base = results.hsl;

const pad = (v, n) => String(v).padEnd(n);
const num = (v, n = 5) => String(v).padStart(n);
const delta = (v) => {
  const d = v - base.total;
  return d === 0 ? "     —" : `${d > 0 ? "+" : ""}${d}`.padStart(6);
};

console.log("\nRAMP SPACE COMPARISON — failing contrast rows, all 9 schemes × 2 modes\n");
console.log(`  ${pad("space", 12)}${num("total")}${num("delta", 7)}${num("generated", 11)}${num("given", 7)}`);
console.log(`  ${"─".repeat(42)}`);
for (const [space, r] of Object.entries(results))
  console.log(`  ${pad(space, 12)}${num(r.total)}${delta(r.total)}${num(r.generated, 11)}${num(r.given, 7)}`);

console.log(`\n  "given" is the control — ${GIVEN.join(", ")} use Figma ramps and must not move.`);

console.log("\nPER GENERATED SCHEME\n");
console.log(`  ${pad("scheme", 12)}${RAMP_SPACES.map((s) => num(s, 12)).join("")}`);
console.log(`  ${"─".repeat(12 + RAMP_SPACES.length * 12)}`);
for (const id of GENERATED)
  console.log(
    `  ${pad(id, 12)}${RAMP_SPACES.map((s) => num(results[s].byScheme[id] ?? 0, 12)).join("")}`,
  );

/* What the colours actually become. The number above decides whether the change
   is worth making; this table is what a brand owner has to sign off on. */
console.log("\nWHAT MOVES — step 500 is verbatim by rule, so only the others shift\n");
const sample = GENERATED[0];
const def = src.schemes[sample];
console.log(`  ${sample} (base ${def.base})\n`);
console.log(`  ${pad("step", 8)}${RAMP_SPACES.map((s) => pad(s, 12)).join("")}`);
console.log(`  ${"─".repeat(8 + RAMP_SPACES.length * 12)}`);
const ramps = Object.fromEntries(RAMP_SPACES.map((s) => [s, rampFor(def, src.primitives, s)]));
for (const step of Object.keys(ramps.hsl))
  console.log(`  ${pad(step, 8)}${RAMP_SPACES.map((s) => pad(ramps[s][step], 12)).join("")}`);

const best = Object.entries(results).sort((a, b) => a[1].total - b[1].total)[0];
console.log(
  `\nVERDICT — lowest defect count is "${best[0]}" at ${best[1].total}, ` +
    `against ${base.total} today.\n` +
    (best[0] === "hsl"
      ? "  HSL already wins. Do NOT flip. Skip S1.1 and go to S1.2.\n"
      : `  Flipping to "${best[0]}" is worth proposing. It is a visible colour change to ` +
        `${GENERATED.length} schemes\n  — take the table above to sign-off before running S1.1.\n`),
);
