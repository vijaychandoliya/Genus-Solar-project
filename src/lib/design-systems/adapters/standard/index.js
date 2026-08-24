/**
 * Standard — the identity adapter.
 *
 * Our own design language, expressed through the same contract every foreign
 * system has to satisfy. Its patch is EMPTY: the canonical document already is
 * Standard, so there is nothing to override.
 *
 * It exists for three reasons, and none of them is symmetry for its own sake:
 *
 *   1. The registry has no special case. `adapterFor(id)` always returns an
 *      adapter, `systemPatch(id)` always returns a patch, and there is no
 *      `if (id === "standard")` anywhere — which is the whole point of §5.
 *   2. It is the permanent escape hatch. Standard can never be removed and never
 *      fails validation, so a broken foreign adapter always has somewhere to
 *      fall back to.
 *   3. It proves the contract is satisfiable. If our OWN design system cannot be
 *      expressed as an adapter, the contract is wrong — and we would rather find
 *      that out here than in the third foreign adapter.
 *
 * See docs/design-system-adapters.md §5 and §13 (phase P2).
 */
import { NO_CAPABILITIES } from "../../capabilities.js";

/** @type {import("../../contract").DesignSystemAdapter} */
const standard = {
  id: "standard",
  name: "Standard",
  version: "1.0.0",

  metadata: {
    upstreamVersion: "n/a",
    source: "scripts/figma-tokens.json",
    // Our own work. Non-null so the registry lists it and validation passes;
    // the licence check exists to stop us redistributing OTHER people's values
    // without terms, not to make us license our own product to ourselves.
    licence: "PROPRIETARY",
    attribution: null,
    trademarkCleared: true,
    extractedOn: "2026-08-24",
  },

  capabilities: {
    ...NO_CAPABILITIES,
    colorPrimitives: true,
    semanticColor: true,
    darkMode: true,
    typographyScale: true,
    typefaces: true,
    spacingScale: true,
    radiusScale: true,
    elevation: true,
    motion: true,
    componentTokens: true,
    interactionStates: true,
    runtimeThemeSwitch: true,
    density: true,
    rtl: true,
    highContrast: true,
    // `cssVariables` is FALSE and that is not an oversight. We emit 227 custom
    // properties and read 9; the transport is the MUI theme object. Claiming
    // otherwise here would be the first lie in a system built to prevent them.
    // Flips to true with milestone M1 — docs/design-system.md §14.
    cssVariables: false,
    // Structural, and enforced rather than asserted: contracts.json scores 129
    // pairs across every scheme and mode, and the build fails on any shortfall.
    contrastGuarantee: "structural",
  },

  /* ── the four required methods ─────────────────────────────────────────── */

  normalize: () => ({ tokens: {}, warnings: [] }),

  map: () => ({ patch: {}, provenance: {}, unmapped: {} }),

  fill: (patch) => ({ patch, derived: [] }),

  // Deliberately not delegating to validateAdapter(): the identity adapter must
  // pass unconditionally, because it is the fallback the others fall back TO.
  // A fallback that can fail is not a fallback.
  validate: () => ({
    ok: true,
    adapter: "standard",
    errors: [],
    warnings: [],
    coverage: {
      semantic: { exact: 0, derived: 0, approximate: 0, fallback: 0, unsupported: 0 },
      directPercent: 100,
    },
    unmappedCount: 0,
  }),
};

export default standard;
