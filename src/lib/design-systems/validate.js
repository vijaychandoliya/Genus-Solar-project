/**
 * Adapter validation — the check that runs before a design system is allowed to
 * exist, let alone be selected.
 *
 * The governing rule, from docs/design-system-adapters.md §10.4:
 *
 *   A design system that cannot satisfy a required token produces a VISIBLE
 *   validation result. It never silently substitutes an arbitrary value.
 *
 * So this file is deliberately unforgiving in one direction and permissive in
 * the other: a MISSING role is fine if the adapter says so and says why; a
 * missing role that quietly resolved to something plausible is not.
 *
 * Runs at author time and in CI, not in the render path.
 */
import { assertCapabilities, forbiddenPaths, CAPABILITY_LABEL } from "./capabilities.js";

/** Every semantic role the product renders. Sourced from the canonical document
 *  rather than duplicated here — a second list would drift. */
export function requiredSemanticKeys(source) {
  return Object.keys(source.semantic).filter((k) => !k.startsWith("$"));
}

const at = (obj, path) =>
  path.split(".").reduce((o, k) => (o === undefined || o === null ? undefined : o[k]), obj);

/** Flatten a patch to dotted leaf paths, so coverage can be counted. */
function leaves(node, prefix = "") {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return prefix ? [prefix] : [];
  return Object.entries(node).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

const EMPTY_COVERAGE = { exact: 0, derived: 0, approximate: 0, fallback: 0, unsupported: 0 };

/**
 * Validate one adapter's output.
 *
 * `provenance` is optional because an adapter may legitimately produce a patch
 * with no per-leaf confidence — the `standard` identity adapter, for instance,
 * changes nothing and has nothing to be uncertain about. When it IS present,
 * every non-exact leaf must carry a note.
 */
export function validateAdapter(adapter, patch, provenance, source) {
  const errors = [];
  const warnings = [];
  const push = (list, code, path, message) => list.push({ code, path, message });

  /* ── metadata ─────────────────────────────────────────────────────────── */

  if (adapter.metadata?.licence === null || adapter.metadata?.licence === undefined)
    push(errors, "no-licence", "metadata.licence", `${adapter.id}: no licence declared. An adapter with no licence is not listed — we do not redistribute values whose terms nobody checked.`);

  if (adapter.metadata?.licence && !adapter.metadata?.attribution)
    push(errors, "no-licence", "metadata.attribution", `${adapter.id}: licence "${adapter.metadata.licence}" is declared but no attribution string. If the licence is non-null the UI must be able to show credit.`);

  /* ── capabilities are well-formed ─────────────────────────────────────── */

  for (const message of assertCapabilities(adapter.capabilities, adapter.id))
    push(errors, "capability-contradiction", "capabilities", message);

  /* ── capabilities agree with the patch ────────────────────────────────────
     Claiming a category you declared unsupported means either the flag or the
     patch is wrong. We cannot tell which, so both are refused rather than
     guessing which one the author meant.                                     */

  for (const [capability, path] of forbiddenPaths(adapter.capabilities)) {
    if (at(patch, path) !== undefined)
      push(
        errors,
        "capability-contradiction",
        path,
        `${adapter.id} writes ${path} but declares ${capability} (“${CAPABILITY_LABEL[capability]}”) unsupported. Either raise the capability or drop the values — a system cannot both lack a concept and have opinions about it.`,
      );
  }

  /* ── every required role is accounted for ─────────────────────────────────
     "Accounted for" means: present in the patch, OR explicitly marked
     unsupported in provenance, OR intentionally absent because the adapter
     inherits Standard. The third is legal and is what `fallback` records.    */

  const required = requiredSemanticKeys(source);
  for (const key of required) {
    const value = patch?.semantic?.[key];
    if (value === undefined) continue; // inherits Standard — legal, recorded as fallback
    if (typeof value !== "object" || value.light === undefined || value.dark === undefined)
      push(
        errors,
        "bad-mode-pair",
        `semantic.${key}`,
        `${adapter.id}: semantic/${key} must define BOTH light and dark. A system with no dark mode declares that in capabilities and derives one — an omitted mode is indistinguishable from a broken one downstream.`,
      );
  }

  /* ── provenance discipline ────────────────────────────────────────────── */

  const coverage = { ...EMPTY_COVERAGE };
  if (provenance) {
    for (const path of leaves(provenance)) {
      // `leaves` walks to the primitive fields of Provenanced<T>, so trim back.
      if (!path.endsWith(".confidence")) continue;
      const base = path.slice(0, -".confidence".length);
      const node = at(provenance, base);
      const c = node?.confidence;
      if (c in coverage) coverage[c] += 1;

      if (c !== "exact" && !node?.note)
        push(
          errors,
          "note-required",
          base,
          `${adapter.id}: ${base} is "${c}" with no note. Every value that is not a direct statement by the system has to say what was assumed — an unexplained approximation is the thing this whole mechanism exists to prevent.`,
        );

      if (c === "unsupported" && node?.value !== null && node?.value !== undefined)
        push(
          errors,
          "unsupported-with-value",
          base,
          `${adapter.id}: ${base} is marked "unsupported" but carries a value. Unsupported means the concept does not exist there; a value here is a silent substitution wearing a label.`,
        );
    }
  }

  const scored = Object.values(coverage).reduce((a, b) => a + b, 0);
  const directPercent = scored === 0 ? 100 : Math.round((coverage.exact / scored) * 100);

  if (scored > 0 && directPercent < 50)
    push(
      warnings,
      "missing-required-role",
      "coverage",
      `${adapter.id}: only ${directPercent}% of values are stated directly by the system; the rest are derived, approximated or inherited. Usable, but the result is more ours than theirs — say so in the UI rather than letting the name imply otherwise.`,
    );

  return {
    ok: errors.length === 0,
    adapter: adapter.id,
    errors,
    warnings,
    coverage: { semantic: coverage, directPercent },
    unmappedCount: 0,
  };
}

/** Structural shape check, run at boot for every registered adapter. */
export function assertAdapterShape(adapter) {
  const required = ["normalize", "map", "fill", "validate"];
  const problems = [];

  if (!adapter?.id) problems.push("adapter has no id");
  if (!adapter?.name) problems.push(`${adapter?.id}: no name`);
  if (!adapter?.version) problems.push(`${adapter?.id}: no version`);
  if (!adapter?.metadata) problems.push(`${adapter?.id}: no metadata`);
  if (!adapter?.capabilities) problems.push(`${adapter?.id}: no capabilities`);

  for (const m of required)
    if (typeof adapter?.[m] !== "function") problems.push(`${adapter?.id}: ${m}() is required`);

  if (typeof adapter?.createTheme === "function")
    problems.push(
      `${adapter?.id}: createTheme() is not part of the adapter contract. An adapter that builds its own theme owns the runtime, and then two adapters own it differently and the audit can score only one. Return a canonical patch instead — see docs/design-system-adapters.md §4.`,
    );

  if (problems.length) throw new Error(`Invalid design-system adapter:\n  ${problems.join("\n  ")}`);
  return true;
}
