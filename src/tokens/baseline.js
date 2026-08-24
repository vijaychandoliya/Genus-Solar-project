/**
 * The known-defect baseline, in its own module on purpose.
 *
 * Both the build gate (scripts/check-a11y.mjs, plain Node) and the live engine
 * (src/lib/a11y.js, bundled by Vite) need this number, and they must agree — an
 * editor laxer than CI is worse than no editor, because it teaches people the
 * change was fine. It cannot live in a11y.js: that imports contracts.json, and
 * Node requires an import attribute for JSON while the bundler does not, so the
 * gate would break on a detail that has nothing to do with contrast.
 *
 * A ratchet, and it points BOTH ways. If a defect is fixed the count drops and
 * the build fails until the `knownDefect` marker is removed — otherwise the
 * marker sits there suppressing a row that is now genuinely gated. If a NEW
 * shortfall lands on a row that already carries a marker, the count rises and the
 * build fails — otherwise the marker hides a fresh regression, which is the thing
 * a known-defect list is most likely to get wrong.
 *
 * ── 113 → 125, and why the number went UP while the product got better ──────
 *
 * Tier 3 used to be resolved once, against the base semantic map, in which
 * `action/primary/rest` dereferences the fixed `blue` family. So all 292 component
 * slots were pinned to blue in all nine schemes: in Sunset a contained button was
 * orange and the outlined button beside it was blue, and the audit scored the blue.
 * `componentsFor()` now re-resolves tier 3 per scheme, so every row is measured
 * against the colour actually painted. Twelve rows that were passing as blue fail
 * as their own hue. They were always failing; nothing could see them.
 *
 * The 125 are TWO causes, not 125 problems:
 *
 *   113  THE BRAND COLOUR AS 14px TEXT — 79 button, 25 navItem, 9 tab. Every
 *        outlined button, text button, active nav row and selected tab paints the
 *        brand as a label at `label/l` (14px), which needs 4.5:1. The brand step is
 *        chosen to work as a FILL and as a 3:1 indicator, and clears neither bar as
 *        text: Sunset's orange-500 is 2.96:1 on white, blue-400 is 4.08:1 on the
 *        dark surface. The fix is a derived brand-as-text step — the same treatment
 *        focus/ring has, and that `action/primary/indicator` just got for the 3:1
 *        case. That is a third derived step plus a tier-3 rewire, not a token edit.
 *    12  The contained label vs its hover and pressed fills. The label derives from
 *        the REST fill, and in light mode the ramp crosses the luminance point where
 *        the required foreground flips, so no single label serves all three states.
 *        The button does not restyle its label on hover, so one state must fail.
 *        §5.3 / §0.6.
 *
 * The old third cause is gone: the semantic-tier `action/primary/rest` rows that
 * failed 3:1 as an indicator now score `action/primary/indicator`, a derived step
 * that clears 3:1 by construction, and their markers were removed with the fix.
 *
 * See docs/token-engine-architecture.md §0.5–0.6 and §5, and steps S1.0/S1.2 of
 * docs/looks-workplan.md.
 */
export const EXPECTED_DEFECTS = 134;
