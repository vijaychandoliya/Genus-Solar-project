/**
 * Build-time entry point for the ramp maths.
 *
 * No implementation here on purpose — the single copy lives in src/lib/ramp.js,
 * because the token editor's live preview has to generate the same ramps the
 * generator emits, or the preview would be a lie.
 */
export { RAMP_LIGHTNESS, hexToHsl, hslToHex, generateRamp, rampFor } from "../src/lib/ramp.js";
