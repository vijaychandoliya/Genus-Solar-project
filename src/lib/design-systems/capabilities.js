/**
 * What a design system can and cannot express.
 *
 * This exists so the UI can say **"Not supported"** instead of inventing a
 * mapping. Radix Themes defines no spacing scale and no elevation model; a
 * spacing editor that silently showed our Standard values under a Radix heading
 * would be lying about whose design it is. `false` here greys the control and
 * states the reason.
 *
 * Every key is REQUIRED on every adapter. There is no default, on purpose:
 * an omitted capability is indistinguishable from an unconsidered one, and the
 * whole point is that somebody looked.
 *
 * See docs/design-system-adapters.md §6.
 */

/** Every capability key, in the order the UI groups them. */
export const CAPABILITY_KEYS = [
  "colorPrimitives",
  "semanticColor",
  "darkMode",
  "typographyScale",
  "typefaces",
  "spacingScale",
  "radiusScale",
  "elevation",
  "motion",
  "componentTokens",
  "interactionStates",
  "cssVariables",
  "runtimeThemeSwitch",
  "density",
  "rtl",
  "highContrast",
];

export const CONTRAST_GUARANTEES = ["structural", "documented", "none"];

/**
 * Which canonical categories a capability governs.
 *
 * The link matters: if `spacingScale` is false, the adapter MUST NOT write
 * `nonFigma.spacing`. Claiming a category you declared unsupported is the
 * contradiction `validate()` looks for — it means either the flag or the patch
 * is wrong, and we cannot tell which, so both are refused.
 */
export const CAPABILITY_SCOPE = {
  colorPrimitives: ["primitives"],
  semanticColor: ["semantic"],
  typographyScale: ["type.styles"],
  typefaces: ["type.fontFamily"],
  spacingScale: ["nonFigma.spacing"],
  radiusScale: ["nonFigma.radius"],
  elevation: ["nonFigma.shadow"],
  motion: ["nonFigma.motion"],
  componentTokens: ["components"],
};

/** Human-readable, for the "Not supported" copy. Never says "token". */
export const CAPABILITY_LABEL = {
  colorPrimitives: "Colour palette",
  semanticColor: "Colour roles",
  darkMode: "Dark mode",
  typographyScale: "Text sizes",
  typefaces: "Typefaces",
  spacingScale: "Spacing",
  radiusScale: "Corner roundness",
  elevation: "Shadows and depth",
  motion: "Animation timing",
  componentTokens: "Per-component styling",
  interactionStates: "Hover and pressed states",
  cssVariables: "CSS variables",
  runtimeThemeSwitch: "Switching without a reload",
  density: "Density",
  rtl: "Right-to-left",
  highContrast: "High-contrast variant",
};

/**
 * A capability set with everything off. Adapters spread this and turn on what
 * they can actually do, so adding a NEW capability key defaults every existing
 * adapter to "no" rather than to a silent yes.
 */
export const NO_CAPABILITIES = Object.freeze({
  ...Object.fromEntries(CAPABILITY_KEYS.map((k) => [k, false])),
  contrastGuarantee: "none",
});

/** Structural check only — `validate()` checks capabilities against the patch. */
export function assertCapabilities(caps, adapterId) {
  const problems = [];
  for (const key of CAPABILITY_KEYS)
    if (typeof caps?.[key] !== "boolean")
      problems.push(`${adapterId}.capabilities.${key} must be a boolean, got ${typeof caps?.[key]}`);

  if (!CONTRAST_GUARANTEES.includes(caps?.contrastGuarantee))
    problems.push(
      `${adapterId}.capabilities.contrastGuarantee must be one of ${CONTRAST_GUARANTEES.join(" | ")}`,
    );

  for (const key of Object.keys(caps ?? {}))
    if (key !== "contrastGuarantee" && !CAPABILITY_KEYS.includes(key))
      problems.push(`${adapterId}.capabilities.${key} is not a known capability`);

  return problems;
}

/**
 * The categories a given capability set forbids an adapter from writing.
 * Returns `[capabilityKey, path]` pairs so the error can name the capability
 * the author has to raise, not just the path they have to delete.
 */
export function forbiddenPaths(caps) {
  return Object.entries(CAPABILITY_SCOPE)
    .filter(([key]) => caps?.[key] === false)
    .flatMap(([key, paths]) => paths.map((path) => [key, path]));
}
