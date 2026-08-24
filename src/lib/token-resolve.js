/**
 * The token resolver — one function, three callers.
 *
 *   scripts/build-tokens.mjs   emits src/tokens.css + src/lib/tokens.js from it
 *   scripts/check-a11y.mjs     scores what it produces
 *   src/lib/token-store.jsx    previews live edits through it
 *
 * That sharing is the whole point. If the editor resolved tokens its own way,
 * its preview would be a plausible guess rather than the thing the build emits,
 * and "it looked right in the editor" would stop meaning anything.
 *
 * Pure: same input, same output, no I/O, no globals. `overrides` is a sparse
 * patch over the source document, which is what makes a draft cheap — the editor
 * never mutates the source, it layers on top of it.
 *
 * See docs/token-engine-architecture.md §2.3.
 */
import { rampFor } from "./ramp.js";
import { bestOn, stepClearing, isHex, composite } from "./contrast.js";

export const MODES = ["light", "dark"];

/* ── derivation policy ────────────────────────────────────────────────────
   Figma declares one `text/on-brand` (white) and it does not survive contact
   with the fills it lands on: white clears 4.5:1 on 3 of 18 scheme/mode brand
   fills, and is 1.9:1 on warning-500. So label colours are DERIVED per fill.
   §0.5 has the numbers.                                                      */

/** White first (the brand's own voice), then near-black, then the blunt one. */
export const onCandidates = (P) => [P.white, P.neutral["950"], P.black];

/** A button label is `label/l` — 14px. It never qualifies as large text. */
export const ON_MIN = 4.5;

/** The hardest surface a focus ring must separate from, per mode. */
const ringAgainst = (P) => ({ light: P.neutral["100"], dark: P.neutral["800"] });

/** Light rings go darker to separate from a pale surface; dark rings go lighter. */
const RING_ORDER = { light: [500, 600, 700], dark: [300, 200, 100] };

/** The brand fill steps each mode uses, in rest/hover/pressed order. */
export const FILL_STEPS = { light: [500, 600, 700], dark: [400, 300, 200] };

/* ── helpers ──────────────────────────────────────────────────────────────── */

const clone = (v) => JSON.parse(JSON.stringify(v));

/** Deep-merge a sparse patch over a base object. Arrays are replaced whole. */
export function merge(base, patch) {
  if (patch === undefined || patch === null) return base;
  if (Array.isArray(patch) || typeof patch !== "object") return patch;
  const out = Array.isArray(base) ? [...base] : { ...(base ?? {}) };
  for (const [k, v] of Object.entries(patch)) out[k] = merge(out[k], v);
  return out;
}

/** "neutral.950" | "white" → hex, out of a primitives tree. */
export function deref(primitives, alias) {
  const [family, step] = String(alias).split(".");
  const node = primitives[family];
  if (node === undefined) return null;
  if (step === undefined) return typeof node === "string" ? node : null;
  return node[step] ?? null;
}

/** Flatten primitives to { "blue-500": "#0467b2", "white": "#ffffff", … }. */
export function flatPrimitives(primitives) {
  const out = {};
  for (const [family, node] of Object.entries(primitives)) {
    if (typeof node === "string") out[family] = node;
    else for (const [step, hex] of Object.entries(node)) out[`${family}-${step}`] = hex;
  }
  return out;
}

/** Every alias a semantic token could legally point at, for the alias picker. */
export function primitiveAliases(primitives) {
  const out = [];
  for (const [family, node] of Object.entries(primitives)) {
    if (typeof node === "string") out.push(family);
    else for (const step of Object.keys(node)) out.push(`${family}.${step}`);
  }
  return out;
}

/* ── tier-3 slot references ───────────────────────────────────────────────
   A component slot points DOWN the tiers, never sideways and never up. The
   prefix says which tier, so the editor knows which picker to offer and the
   resolver can refuse a reference that skips a tier.                        */

export const SLOT_REF = /^\{(sem|space|radius|motion|layout|shadow|type|prim|derive):([^}]+)\}$/;

/**
 * A translucent tint, composited to an opaque hex: `{mix:a,b,9}` is 9% of
 * semantic role `a` over role `b`.
 *
 * This exists because the app paints 17 `alpha(t.palette.X, n)` tints — selected
 * nav rows, hovered table rows — and a translucent value has NO contrast ratio
 * until you know its backdrop. Naming the backdrop in the token is what lets the
 * accessibility engine judge the pair at all, instead of skipping it silently or
 * scoring the tint as though it were opaque. Both mistakes are worse than the
 * verbosity. See docs/token-engine-architecture.md §1.3.
 */
export const MIX_REF = /^\{mix:([^,}]+),([^,}]+),(\d{1,3})\}$/;

/** Parse `{sem:surface/raised}` → `{ tier: "sem", key: "surface/raised" }`. */
export function parseSlotRef(value) {
  if (typeof value !== "string") return null;
  const mix = MIX_REF.exec(value.trim());
  if (mix) return { tier: "mix", key: mix[1], over: mix[2], pct: Number(mix[3]) };
  const m = SLOT_REF.exec(value.trim());
  return m ? { tier: m[1], key: m[2] } : null;
}

/**
 * Resolve one component slot for one mode.
 *
 * Returns `{ value, problem }`. A bad reference yields the raw string as the
 * value and a described problem — never a throw and never a plausible
 * substitute, so the editor can render the broken slot and say what is wrong.
 */
export function resolveSlot(ref, type, mode, ctx) {
  const parsed = parseSlotRef(ref);

  // A literal. Legal, and deliberately visible in the editor as a literal,
  // because it is a value the rest of the system cannot reason about.
  if (!parsed) return { value: ref, problem: null };

  const { tier, key } = parsed;

  // A derived label — `{derive:onBrand}` for the brand fill (which follows the
  // scheme) or `{derive:accent}` / `{derive:warning}` for the fixed fills. This
  // exists so the component layer states the colour the THEME actually paints.
  // Writing `{sem:text/on-brand}` here instead would have the token document
  // claim white while the product renders near-black — the layer contradicting
  // the thing it describes, which is worse than having no layer.
  if (tier === "derive") {
    const value = key === "onBrand" ? ctx.onBrand?.[mode] : ctx.contrastOn?.[mode]?.[key];
    return value
      ? { value, problem: null }
      : { value: ref, problem: `${ctx.where} → unknown derivation "${key}"` };
  }

  if (tier === "mix") {
    const src = ctx.semantic[mode][key];
    const backdrop = ctx.semantic[mode][parsed.over];
    if (!src || !backdrop)
      return { value: ref, problem: `${ctx.where} → unknown role in mix "${key}" over "${parsed.over}"` };
    return { value: composite(src, parsed.pct / 100, backdrop), problem: null };
  }

  if (tier === "prim" && type === "color")
    return {
      value: deref(ctx.primitives, key) ?? ref,
      problem:
        `${ctx.where} aliases the primitive "${key}" for a colour. Component colours must alias a ` +
        `semantic role — reaching past that tier skips the only layer that knows about light and dark.`,
    };

  const lookup = {
    sem: () => ctx.semantic[mode][key],
    prim: () => deref(ctx.primitives, key),
    type: () => ctx.type.styles[key],
    space: () => ctx.scales.space[key],
    radius: () => ctx.scales.radius[key],
    motion: () => ctx.scales.motion[key],
    layout: () => ctx.scales.layout[key],
    // Per mode, like a colour — the alpha differs, so one value would be wrong
    // in one of the two.
    shadow: () => ctx.scales.shadow?.[mode]?.[key],
  }[tier];

  const value = lookup?.();
  return value === undefined || value === null
    ? { value: ref, problem: `${ctx.where} → unknown ${tier} token "${key}"` }
    : { value, problem: null };
}

/**
 * Tier 3, both modes, against ONE given semantic map.
 *
 * Split out of `resolveTokens` so the identical code can run again per scheme.
 * It is HANDED a semantic map rather than reading one, because "which semantic
 * map" turned out to be the variable that was missing: the inline version read
 * the base map, in which `action/primary/rest` dereferences the fixed `blue`
 * family, so every component slot was pinned to blue in all nine schemes.
 */
export function buildComponents(defs, ctx) {
  const { semantic, scales, type, primitives, contrastOn, onBrand } = ctx;
  const problems = [];
  const components = { light: {}, dark: {} };

  const slotCtx = (mode, where) => ({ semantic, scales, type, primitives, where, contrastOn, onBrand });

  /** Resolve a flat `{ slot: spec }` bag for one mode. */
  const resolveBag = (bag, mode, where) => {
    const out = {};
    for (const [slot, spec] of Object.entries(bag ?? {})) {
      if (slot.startsWith("$")) continue;
      // `$darkValue` exists for the one honest case: a slot whose alias has to
      // change by mode because the token it points at collapses. See kpiTile's
      // border, where border/subtle and surface/raised are the same hex in dark.
      const ref = mode === "dark" && spec.$darkValue !== undefined ? spec.$darkValue : spec.$value;
      const { value, problem } = resolveSlot(ref, spec.$type, mode, slotCtx(mode, `${where}.${slot}`));
      if (problem) problems.push(problem);
      out[slot] = value;
    }
    return out;
  };

  for (const [id, def] of Object.entries(defs ?? {})) {
    if (id.startsWith("$")) continue;

    for (const mode of MODES) {
      // Base slots stay FLAT on the component so `t.component.kpiTile.padding`
      // reads directly. Variants and states nest under `variants`, because a
      // button's fill is not one value — it is one per variant per state, and
      // flattening that would lose the thing this layer exists to express.
      const out = resolveBag({ ...def, ...(def.$base ?? {}) }, mode, `components.${id}`);
      const variants = {};

      for (const [vid, vdef] of Object.entries(def.$variants ?? {})) {
        if (vid.startsWith("$")) continue;
        const states = {};
        for (const [sid, sdef] of Object.entries(vdef.$states ?? {})) {
          if (sid.startsWith("$")) continue;
          states[sid] = resolveBag(sdef, mode, `components.${id}.${vid}.${sid}`);
        }
        variants[vid] = { label: vdef.$label ?? vid, states };
      }

      if (Object.keys(variants).length) out.variants = variants;
      components[mode][id] = out;
    }
  }

  return { components, problems };
}

/* ── the resolver ─────────────────────────────────────────────────────────── */

/**
 * Resolve a token document (optionally patched) into everything the theme and
 * the gate consume.
 *
 * Returns `{ source, primitives, flat, semantic:{light,dark}, type, schemes,
 * contrastOn, spacing, radius, shadow, motion, layout, derivations, problems }`.
 *
 * `problems` is a LIST, not a throw. The editor has to be able to render an
 * invalid draft — that is how the user sees what is wrong and fixes it. Only the
 * build treats a non-empty `problems` as fatal.
 */
export function resolveTokens(src, overrides = {}) {
  const source = overrides && Object.keys(overrides).length ? merge(clone(src), overrides) : src;

  const P = source.primitives;
  const problems = [];
  const derivations = [];

  /* semantic, per mode */
  const semantic = { light: {}, dark: {} };
  for (const [path, alias] of Object.entries(source.semantic)) {
    if (path.startsWith("$")) continue;
    for (const mode of MODES) {
      const hex = deref(P, alias?.[mode]);
      if (hex === null) problems.push(`${path} (${mode}) → unknown primitive "${alias?.[mode]}"`);
      else if (!isHex(hex)) problems.push(`${path} (${mode}) resolved to a non-hex: ${hex}`);
      semantic[mode][path] = hex;
    }
  }

  /* derivation bookkeeping */
  const CAND = onCandidates(P);
  const AGAINST = ringAgainst(P);
  const label = (fill, what) => {
    const r = bestOn(fill, CAND, ON_MIN);
    derivations.push({ kind: "label", what, fill, fg: r.fg, ratio: r.ratio, exact: r.exact, min: ON_MIN });
    return r.fg;
  };

  /* schemes — a scheme swaps the BRAND HUE and nothing else */
  const schemes = {};
  for (const [id, def] of Object.entries(source.schemes)) {
    if (id.startsWith("$")) continue;
    const ramp = rampFor(def, P, source.$config?.rampSpace);
    const node = { label: def.label, fromFigma: Boolean(def.ramp), swatch: ramp[500], base: def.base ?? ramp[500] };

    for (const mode of MODES) {
      const [rest, hover, pressed] = FILL_STEPS[mode];
      const ring = stepClearing(ramp, RING_ORDER[mode], AGAINST[mode], 3);
      derivations.push({
        kind: "ring",
        what: `${id}/${mode} focus ring`,
        fill: AGAINST[mode],
        fg: ramp[ring.step],
        step: ring.step,
        defaultStep: String(RING_ORDER[mode][0]),
        ratio: ring.ratio,
        exact: ring.exact,
        min: 3,
      });
      // The brand as an INDICATOR rather than a fill — an active nav icon, a
      // selected border. `action/primary/rest` was doing both jobs, and they have
      // different requirements: as a fill it only has to carry its own label, but
      // as an indicator it needs 3:1 against the surface behind it, and Sunset's
      // orange-500 is 2.96:1 on white. Derived the same way the focus ring is,
      // against the same hardest surface, because it is the same requirement.
      const ind = stepClearing(ramp, RING_ORDER[mode], AGAINST[mode], 3);
      derivations.push({
        kind: "indicator",
        what: `${id}/${mode} brand indicator`,
        fill: AGAINST[mode],
        fg: ramp[ind.step],
        step: ind.step,
        defaultStep: String(FILL_STEPS[mode][0]),
        ratio: ind.ratio,
        exact: ind.exact,
        min: 3,
      });

      node[mode] = {
        rest: ramp[rest],
        hover: ramp[hover],
        pressed: ramp[pressed],
        focus: ramp[ring.step],
        indicator: ramp[ind.step],
        onBrand: label(ramp[rest], `${id}/${mode} primary label`),
      };
    }
    node.ramp = ramp;
    schemes[id] = node;
  }

  /* the fills no scheme changes — accent plus the four status ramps */
  const fixedFill = {
    accent: { light: deref(P, source.semantic["action/accent/rest"].light), dark: deref(P, source.semantic["action/accent/rest"].dark) },
    success: { light: P.success["500"], dark: P.success["500"] },
    warning: { light: P.warning["500"], dark: P.warning["500"] },
    danger: { light: P.danger["500"], dark: P.danger["500"] },
    info: { light: P.info["500"], dark: P.info["500"] },
  };
  const contrastOn = { light: {}, dark: {} };
  for (const [role, byMode] of Object.entries(fixedFill))
    for (const mode of MODES) contrastOn[mode][role] = label(byMode[mode], `${role}/${mode} label`);

  /* a derivation that fell short is a real failure, surfaced not swallowed */
  for (const d of derivations)
    if (!d.exact)
      problems.push(
        `${d.what}: no candidate clears ${d.min}:1 on ${d.fill} — best was ${d.fg} at ${d.ratio.toFixed(2)}:1`,
      );

  const { spacing, radius, motion, layout } = source.nonFigma;

  /* Elevation, resolved to a CSS box-shadow string per mode. `darkAlpha` is a
     declared value rather than a multiplier because a shadow is a shortfall of
     light: the same alpha that reads on white is invisible on a dark surface, and
     deriving it would quietly flatten every dark-mode Look. */
  const shadow = { light: {}, dark: {} };
  for (const [name, layers] of Object.entries(source.nonFigma.shadow ?? {})) {
    if (name.startsWith("$")) continue;
    for (const mode of MODES) {
      if (!layers.length) {
        shadow[mode][name] = "none";
        continue;
      }
      shadow[mode][name] = layers
        .map((l) => {
          const hex = deref(P, l.color);
          if (hex === null) {
            problems.push(`nonFigma.shadow.${name} → unknown primitive "${l.color}"`);
            return null;
          }
          const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
          const a = mode === "dark" ? (l.darkAlpha ?? l.alpha) : l.alpha;
          return `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px rgba(${r}, ${g}, ${b}, ${a})`;
        })
        .filter(Boolean)
        .join(", ");
    }
  }

  /* ── tier 3 ─────────────────────────────────────────────────────────────
     Component slots, resolved per mode because their colour slots alias
     semantic roles and those differ by mode. Dimensions resolve identically in
     both, which is harmless and keeps one lookup shape for consumers.        */
  const componentDefs = Object.fromEntries(
    Object.entries(source.components ?? {}).filter(([id]) => !id.startsWith("$")),
  );

  // Resolved here against the DEFAULT scheme, which is a no-op: the default
  // scheme's ramp IS the blue family the base semantic map already points at, so
  // `resolved.components` keeps exactly the values it had before. Every OTHER
  // scheme now re-resolves through `componentsFor()` instead of silently reusing
  // these — see that function for what went wrong when it did not.
  const tier3 = buildComponents(componentDefs, {
    semantic,
    scales: { space: spacing, radius, motion, layout, shadow },
    type: source.type,
    primitives: P,
    contrastOn,
    onBrand: { light: schemes.default?.light?.onBrand, dark: schemes.default?.dark?.onBrand },
  });
  const components = tier3.components;
  problems.push(...tier3.problems);

  return {
    source,
    primitives: P,
    flat: flatPrimitives(P),
    semantic,
    components,
    componentDefs,
    type: source.type,
    fonts: Object.fromEntries(Object.entries(source.fonts).filter(([k]) => !k.startsWith("$"))),
    schemes,
    contrastOn,
    fixedFill,
    spacing,
    radius,
    shadow,
    motion,
    layout,
    derivations,
    problems,
  };
}

/**
 * The assertions the build refuses to ship without. Kept beside the resolver so
 * the editor can run the exact same checks on a draft and show the user what
 * would fail before they export it.
 *
 * `text/on-brand` staying identical across modes is the one allowed exception:
 * Figma says white in both, and the extraction stays faithful. Nothing reads it
 * any more — the theme uses the derived per-fill values above — but deleting the
 * token would misrepresent the design file. That exemption is precisely what hid
 * §0.5's defect, which is why the derivations are asserted instead.
 */
/**
 * The type ramp as ready-to-spread sx objects. Mirrors what build-tokens.mjs
 * emits as `font` in tokens.js, so an edited ramp reaches the theme the same way
 * a generated one does.
 */
export const fontStyles = (type) =>
  Object.fromEntries(
    Object.entries(type.styles).map(([k, s]) => [
      k,
      {
        fontSize: s.size,
        fontWeight: s.weight,
        lineHeight: `${s.lineHeight}px`,
        letterSpacing: `${s.tracking}px`,
      },
    ]),
  );

/** The bundle `getTheme()` consumes, built from a resolved document. */
/**
 * The semantic map a scheme actually PAINTS.
 *
 * The base map dereferences the fixed `blue` family for the four brand roles; a
 * scheme swaps in its own ramp. This is now the one definition of that rule. It
 * used to be written out by hand in `getTheme` and again in `paletteFor` — and,
 * critically, nowhere at all for tier 3, which is the defect this closes.
 */
export function semanticFor(bundle, schemeId, mode) {
  const sch = (bundle.schemes[schemeId] ?? bundle.schemes.default)[mode];
  return {
    ...bundle.semantic[mode],
    "action/primary/rest": sch.rest,
    "action/primary/hover": sch.hover,
    "action/primary/pressed": sch.pressed,
    "action/primary/indicator": sch.indicator,
    "focus/ring": sch.focus,
  };
}

/* Keyed on the bundle object, so a new draft invalidates the whole cache for
   free — the editor builds a fresh bundle per edit, and a stale component tree
   surviving an edit is precisely the bug class this file exists to avoid. */
const COMPONENT_MEMO = new WeakMap();

/**
 * Tier 3 for one scheme and mode.
 *
 * `resolved.components` is the DEFAULT scheme only. `getTheme` and `paletteFor`
 * both used to read it directly for whatever scheme was active, which pinned all
 * 292 slots to blue: in Sunset a contained button was orange and the outlined
 * button beside it was blue, and the audit scored the blue. Re-resolving against
 * `semanticFor()` is what makes the component layer describe what is painted.
 *
 * Memoised per (bundle, scheme) because the theme rebuilds on every mode, scheme
 * and font change, and 292 slots × 2 modes is worth doing once.
 */
export function componentsFor(bundle, schemeId = "default", mode = "light") {
  // A bundle emitted before componentDefs existed. Degrade to the default-scheme
  // tree rather than blanking every component — wrong hue beats no UI.
  if (!bundle.componentDefs) return bundle.components?.[mode] ?? {};

  let byKey = COMPONENT_MEMO.get(bundle);
  if (!byKey) {
    byKey = new Map();
    COMPONENT_MEMO.set(bundle, byKey);
  }
  const key = `${schemeId}/${mode}`;
  if (byKey.has(key)) return byKey.get(key);

  const sch = bundle.schemes[schemeId] ?? bundle.schemes.default;
  const { components } = buildComponents(bundle.componentDefs, {
    semantic: {
      light: semanticFor(bundle, schemeId, "light"),
      dark: semanticFor(bundle, schemeId, "dark"),
    },
    scales: {
      space: bundle.spacing, radius: bundle.radius, motion: bundle.motion,
      layout: bundle.layout, shadow: bundle.shadow,
    },
    type: bundle.type,
    primitives: bundle.primitives,
    contrastOn: bundle.contrastOn,
    onBrand: { light: sch.light?.onBrand, dark: sch.dark?.onBrand },
  });

  // Both modes come out of one pass; cache both rather than repeating the work.
  byKey.set(`${schemeId}/light`, components.light);
  byKey.set(`${schemeId}/dark`, components.dark);
  return components[mode];
}

export const themeBundle = (r) => ({
  primitives: r.primitives,
  semantic: r.semantic,
  components: r.components,
  componentDefs: r.componentDefs,
  type: r.type,
  radius: r.radius,
  shadow: r.shadow,
  motion: r.motion,
  spacing: r.spacing,
  layout: r.layout,
  font: fontStyles(r.type),
  schemes: r.schemes,
  fonts: r.fonts,
  contrastOn: r.contrastOn,
});

export const EXPECTED_SEMANTIC = 29;

/**
 * Components src/lib/theme.js reads by name, with the slots it reads.
 *
 * Declared because renaming a component in the token document is otherwise a
 * SILENT break: the theme reads `comp.chip.radius`, gets `undefined.radius`, and
 * the whole app renders blank with a stack trace pointing at React rather than at
 * the rename. That happened. The build now refuses instead.
 */
export const THEME_REQUIRES = {
  button: ["radius", "minHeight", "paddingInline", "labelType"],
  statusChip: ["radius", "height", "paddingInline", "labelType"],
  kpiTile: ["background", "border", "radius", "padding", "gap", "minHeight",
            "labelColor", "labelType", "valueColor", "valueType", "unsetColor",
            "iconSize", "iconRadius", "iconGlyph"],
  panel: ["background", "border", "radius", "headerPadding", "titleColor",
          "titleType", "noteColor", "noteType"],
  alert: ["radius", "paddingInline", "paddingBlock", "borderWidth", "labelType", "gap"],
  checkbox: ["size", "radius", "borderWidth"],
  menu: ["background", "radius", "borderColor", "paddingBlock", "itemType",
         "itemMinHeight", "itemPaddingInline"],
};
export const SAME_IN_BOTH_MODES_OK = new Set(["text/on-brand"]);

export function assertResolved(resolved) {
  const problems = [...resolved.problems];
  const count = Object.keys(resolved.semantic.light).length;
  if (count !== EXPECTED_SEMANTIC)
    problems.push(`expected ${EXPECTED_SEMANTIC} semantic tokens, resolved ${count}`);

  for (const [id, slots] of Object.entries(THEME_REQUIRES)) {
    const node = resolved.components?.light?.[id];
    if (!node) {
      problems.push(`components.${id} is missing, and src/lib/theme.js reads it by name`);
      continue;
    }
    for (const slot of slots)
      if (node[slot] === undefined)
        problems.push(`components.${id}.${slot} is missing, and src/lib/theme.js reads it`);
  }

  for (const path of Object.keys(resolved.semantic.light))
    if (
      resolved.semantic.light[path] === resolved.semantic.dark[path] &&
      !SAME_IN_BOTH_MODES_OK.has(path)
    )
      problems.push(
        `${path} is identical in light and dark (${resolved.semantic.light[path]}) — check the alias table`,
      );

  return problems;
}
