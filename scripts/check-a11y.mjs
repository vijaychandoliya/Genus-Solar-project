/**
 * The contrast gate. Runs after build-tokens.mjs on `npm run tokens`.
 *
 * Scores every declared pair — the semantic contract in src/tokens/contracts.json
 * plus every tier-3 component variant and state — against all 9 colour schemes ×
 * 2 modes, and exits non-zero on any shortfall.
 *
 * It does NOT reimplement any of that. It calls the same `audit()` the token
 * editor calls, over the same `resolveTokens()` the generator emits from. An
 * earlier version had its own copy of the palette logic and consequently scored
 * 486 pairs while the editor scored 2,322 — the gate was passing a product the
 * editor knew was broken. One engine, three callers.
 *
 * Four verdicts, and the two extra ones carry the design:
 *   fail     scored below its threshold. The only verdict that blocks.
 *   exempt   a declared WCAG provision (disabled controls, decoration).
 *            Reported, never scored. NOT a pass.
 *   unknown  cannot be judged. A gap in the contract, not a defect by a
 *            designer, so it never blocks.
 *   knownDefect  a real shortfall whose fix is a design decision. Scored,
 *            printed every run, and held to an exact count.
 *
 * See docs/token-engine-architecture.md §2.4.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { resolveTokens } from "../src/lib/token-resolve.js";
import { audit, summarise } from "../src/lib/a11y.js";
import { EXPECTED_DEFECTS } from "../src/tokens/baseline.js";
import { LOOKS, lookPatch, DEFAULT_LOOK } from "../src/lib/looks/index.js";

const root = (p) => fileURLToPath(new URL(p, import.meta.url));
const src = JSON.parse(readFileSync(root("./figma-tokens.json"), "utf8"));

/* Every Look is scored, not just the shipped one.
   A Look is a sparse patch and `resolveTokens` already merges one, so auditing a
   Look is the SAME call with the patch applied. `standard` carries the product's
   existing known defects; every OTHER Look must score zero, because the whole
   promise of this feature to a non-expert is "pick one, it will be readable" —
   and a Look shipping with its own defect list makes that promise false.
   See src/tokens/looks/README.md and S3.4 of docs/looks-workplan.md. */
const expectedFor = (id) => (id === DEFAULT_LOOK ? EXPECTED_DEFECTS : 0);

const resolved = resolveTokens(src);
const rows = audit(resolved);
const totals = summarise(rows);

/** One printable line per shortfall. */
const describe = (r) =>
  `${r.scheme}/${r.mode}  ` +
  (r.component
    ? `${r.component}${r.variant ? `/${r.variant}` : ""}${r.state ? `/${r.state}` : ""} ${r.slotRole ?? "text"}`
    : `${r.fg} on ${r.bg}`) +
  `  ${r.verdict.ratio.toFixed(2)}:1 < ${r.verdict.required}:1  ` +
  `(${r.verdict.fg} on ${r.verdict.bg}${r.typeToken ? `, ${r.typeToken}` : ""})`;

const failures = rows.filter((r) => r.verdict.level === "fail" && !r.verdict.knownDefect).map(describe);
const defects = rows.filter((r) => r.verdict.level === "fail" && r.verdict.knownDefect).map(describe);
const gaps = rows.filter((r) => r.verdict.level === "unknown");

const problems = [...resolved.problems];

if (gaps.length) {
  const unique = [...new Set(gaps.map((g) => `${g.fg} on ${g.bg} — ${g.verdict.reason}`))];
  console.warn(`contrast gate — ${unique.length} contract gap(s), not scored:\n  ` + unique.join("\n  "));
}

// Printed on every run and deliberately not silenced. These are open defects
// awaiting a design decision — see docs/token-engine-architecture.md §5.
if (defects.length) {
  const shown = defects.slice(0, 20);
  console.warn(
    `\ncontrast gate — ${defects.length} KNOWN DEFECT(S), not blocking:\n  ` +
      shown.join("\n  ") +
      (defects.length > shown.length ? `\n  … ${defects.length - shown.length} more of the same rows` : ""),
  );
}

// The ratchet, pointing both ways: a fixed defect must drop its marker, and a new
// shortfall must not hide behind one.
if (defects.length !== EXPECTED_DEFECTS)
  problems.push(
    `known-defect count moved: expected ${EXPECTED_DEFECTS}, found ${defects.length}. ` +
      (defects.length < EXPECTED_DEFECTS
        ? "Something got FIXED — lower EXPECTED_DEFECTS in src/tokens/baseline.js and drop the knownDefect marker."
        : "Something got WORSE — a new shortfall is hiding behind a knownDefect marker."),
  );

/* ── every other Look ───────────────────────────────────────────────────────
   Scored with the same audit, the same contract and the same maths. A Look that
   cannot clear the gate does not ship — there is no marker to hide behind,
   because a marker means "we know, a human owns it", and nobody owns a defect in
   an appearance that was generated last Tuesday.                             */
const lookReport = [];
for (const look of LOOKS) {
  const lookResolved = look.id === DEFAULT_LOOK ? resolved : resolveTokens(src, lookPatch(look.id));
  const lookRows = look.id === DEFAULT_LOOK ? rows : audit(lookResolved);
  const bad = lookRows.filter((r) => r.verdict.level === "fail");
  const expected = expectedFor(look.id);

  problems.push(...lookResolved.problems.map((m) => `look "${look.id}": ${m}`));
  lookReport.push(`${look.id} ${bad.length === expected ? "✓" : "✗"} ${bad.length}/${expected}`);

  if (bad.length !== expected)
    problems.push(
      `look "${look.id}" scores ${bad.length} failing row(s), expected ${expected}. ` +
        (look.id === DEFAULT_LOOK
          ? "Update EXPECTED_DEFECTS in src/tokens/baseline.js."
          : "A Look must clear the gate at zero — see src/tokens/looks/README.md. First:\n    " +
            bad.slice(0, 3).map(describe).join("\n    ")),
    );
}

if (failures.length || problems.length) {
  if (failures.length)
    console.error(`\nContrast gate FAILED — ${failures.length} shortfall(s) of ${totals.pass + totals.fail} scored:\n  ` + failures.join("\n  "));
  if (problems.length) console.error(`\n  ` + problems.join("\n  "));
  process.exit(1);
}

const schemes = Object.keys(resolved.schemes).length;
const perCombo = rows.length / (schemes * 2);
console.log(
  `contrast OK — ${totals.pass + totals.fail} scored of ${rows.length} rows ` +
    `(${perCombo} pairs × ${schemes} schemes × 2 modes), ` +
    `${totals.exempt} exempt, ${totals.defect} known defects\n` +
    `looks OK — ${lookReport.join(" · ")}`,
);
