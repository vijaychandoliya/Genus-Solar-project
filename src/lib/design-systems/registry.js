/**
 * The design-system registry.
 *
 * THIS FILE IS THE ONLY PLACE THAT NAMES AN ADAPTER. Everywhere else asks the
 * registry. That is the difference between adding a design system by creating a
 * folder and adding one by editing a conditional in six files.
 *
 * Static imports on purpose — no dynamic import, no remote fetch, no lazy
 * loading. A design system is a few kilobytes of values, the set is known at
 * build time, and a registry that can fail to load is a registry that can leave
 * the product unstyled.
 *
 * Adding a system:
 *   1. create src/lib/design-systems/adapters/<id>/
 *   2. add ONE import line and ONE array entry below
 *   3. `npm run tokens` scores it like everything else
 *
 * See docs/design-system-adapters.md §5.
 */
import standard from "./adapters/standard/index.js";
import { assertAdapterShape } from "./validate.js";

/* One line per adapter. Keep `standard` first — it is the default and the
   permanent fallback, and ordering here is the ordering the picker shows. */
const ALL = [standard];

/* Fail at BOOT, not at click. A malformed adapter that only breaks when someone
   selects it is a defect that ships, because nobody selects all of them. */
for (const adapter of ALL) assertAdapterShape(adapter);

/**
 * Only adapters whose licence someone actually checked.
 *
 * An adapter with `licence: null` is not "unlicensed and probably fine" — it is
 * values whose redistribution terms nobody read. Filtering here rather than at
 * the point of use means a forgotten licence makes a system INVISIBLE rather
 * than making it a legal question later.
 */
export const DESIGN_SYSTEMS = ALL.filter((a) => a.metadata.licence !== null);

export const BY_ID = Object.fromEntries(DESIGN_SYSTEMS.map((a) => [a.id, a]));

export const DEFAULT_SYSTEM = "standard";

/** Never returns undefined. An unknown id degrades to Standard rather than
 *  leaving the product with no tokens at all. */
export const adapterFor = (id) => BY_ID[id] ?? BY_ID[DEFAULT_SYSTEM];

export const capabilitiesOf = (id) => adapterFor(id).capabilities;

/** Whether a category is expressible in the selected system. Drives the
 *  "Not supported" state rather than letting the UI invent a mapping. */
export const supports = (id, capability) => Boolean(capabilitiesOf(id)[capability]);

/**
 * Systems that may be shown BY NAME in a tenant-facing build.
 *
 * A permissive licence grants copyright and patent rights and explicitly not
 * trademark rights — Apache-2.0 says so in §6. So "can we redistribute the
 * values" and "can we put the name in a dropdown a customer sees" are two
 * different questions with two different answers, and this is the second one.
 */
export const nameable = () => DESIGN_SYSTEMS.filter((a) => a.metadata.trademarkCleared);

/* ── patch construction ───────────────────────────────────────────────────── */

const CACHE = new Map();

/**
 * The canonical patch for one design system: normalize → map → fill → validate.
 *
 * Pure and memoised by id, because an adapter's input is vendored and its output
 * cannot change between calls. Returns `{ patch, report }` — the caller merges
 * the patch and shows the report.
 *
 * A failing adapter throws rather than returning a partial patch. Half a design
 * system applied is worse than none: it looks deliberate.
 */
export function systemPatch(id) {
  if (CACHE.has(id)) return CACHE.get(id);

  const adapter = adapterFor(id);
  const { tokens } = adapter.normalize(adapter.raw);
  const { patch, provenance, unmapped } = adapter.map(tokens);
  const { patch: filled } = adapter.fill(patch);
  const report = adapter.validate(filled, provenance);

  if (!report.ok) {
    const detail = report.errors.map((e) => `  ${e.path}: ${e.message}`).join("\n");
    throw new Error(`Design system "${id}" failed validation and was not applied:\n${detail}`);
  }

  const result = { patch: filled, report, unmapped: unmapped ?? {} };
  CACHE.set(id, result);
  return result;
}

/** For tests and the adapter report — drops the memo so a re-run is honest. */
export const clearPatchCache = () => CACHE.clear();
