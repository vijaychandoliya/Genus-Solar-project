/**
 * Build-time entry point for the contrast maths.
 *
 * There is deliberately no implementation here. The single copy lives in
 * src/lib/contrast.js because the running app needs it too — the token editor
 * scores every edit live — and a generator, a gate and an editor that disagree
 * about what 4.5:1 means would be worse than having no gate at all.
 */
export {
  rgb,
  hex,
  isHex,
  luminance,
  contrast,
  composite,
  requiredRatio,
  isLargeText,
  bestOn,
  stepClearing,
  apca,
  apcaBand,
} from "../src/lib/contrast.js";
