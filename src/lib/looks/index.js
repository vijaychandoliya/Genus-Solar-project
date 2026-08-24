/**
 * The Look registry.
 *
 * A Look is a complete named appearance — colour, type, spacing, shape, depth,
 * light and dark — applied UNDER the user's own edits:
 *
 *     resolveTokens(source, merge(lookPatch(id), userOverrides))
 *
 * That is the whole axis. `resolveTokens` already deep-merges a sparse patch, so
 * a Look needs no new resolver and no new modifier machinery — see
 * src/tokens/looks/README.md for why, and docs/looks-workplan.md for the plan.
 *
 * STATIC imports, deliberately. `import.meta.glob` would be shorter but does not
 * exist in plain Node, and scripts/check-a11y.mjs is plain Node — a registry the
 * build gate cannot read is a registry that ships unaudited Looks. Adding a Look
 * is one import line and one array entry; that verbosity is the price of the
 * gate seeing exactly what the app sees.
 */
import standard from "../../tokens/looks/standard.look.json" with { type: "json" };

/** Every Look, in gallery order. Standard is first and is never removable. */
export const LOOKS = [standard];

/** The identity Look. Its patch is empty, which is what makes it unbreakable. */
export const DEFAULT_LOOK = "standard";

/** The schema range this build understands. Bump the major on a breaking change. */
export const SCHEMA_VERSION = "1.0.0";

const BY_ID = Object.fromEntries(LOOKS.map((l) => [l.id, l]));

export const lookById = (id) => BY_ID[id] ?? null;

/**
 * The patch for a Look, or `{}`.
 *
 * An unknown id resolves to the empty patch rather than throwing: a stale value
 * in `localStorage` — a Look that was renamed, or removed between releases —
 * must degrade to Standard and leave the app fully usable, never blank it. The
 * caller can ask `lookById` separately if it wants to say so out loud.
 */
export const lookPatch = (id) => BY_ID[id]?.patch ?? {};

/**
 * Which of a user's override paths this Look also sets.
 *
 * Applying a Look never destroys an edit — the user's overrides sit on top and
 * keep winning — so an earlier edit can silently SHADOW the Look and make it
 * look broken. This is what the apply dialog reads to say "3 of your earlier
 * changes will keep overriding this Look", by name, before anything happens.
 * Never resolve that silently in either direction.
 */
export function shadowedBy(patch, overrides) {
  const leaves = (node, prefix = "") =>
    node === null || typeof node !== "object" || Array.isArray(node)
      ? prefix
        ? [prefix]
        : []
      : Object.entries(node).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));

  const set = new Set(leaves(patch));
  return leaves(overrides).filter((p) => set.has(p));
}
