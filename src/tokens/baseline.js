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
 * The 113 break down into three causes, not 113 problems:
 *
 *   81  THE BRAND COLOUR AS 14px TEXT. `action/primary/rest` is ramp[400] in dark
 *       mode — picked to work as a fill and as a 3:1 indicator, but it gives
 *       4.08:1 as a label where 4.5:1 is needed. Hits every outlined button, text
 *       button, active nav row and selected tab, in all nine schemes. Found by
 *       the tier-3 layer: the semantic contract declared this token `ui` (3:1),
 *       which passes, and only recording how a component actually USES it
 *       revealed that it is also a label. The fix mirrors focus/ring — derive a
 *       brand-as-text step. §5.6.
 *   18  The contained label vs its hover and pressed fills. The label derives
 *       from the REST fill, and in light mode the ramp crosses the luminance
 *       point where the required foreground flips, so no single label serves all
 *       three states. §5.3 / §0.6.
 *   14  The original semantic-tier set: 12 hover/pressed label shortfalls plus
 *       Sunset's brand failing 3:1 as an indicator on the two white surfaces.
 *
 * See docs/token-engine-architecture.md §0.5–0.6 and §5.
 */
export const EXPECTED_DEFECTS = 113;
