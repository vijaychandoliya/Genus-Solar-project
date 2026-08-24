/**
 * The accessibility validation engine — the live half.
 *
 * Scores the declared contract (src/tokens/contracts.json) against a resolved
 * token document, so the editor can judge an edit as it happens. The build gate
 * scores the same contract with the same maths from src/lib/contrast.js; the two
 * cannot disagree because neither owns a second copy.
 *
 * FOUR verdicts, and the two extra ones carry the design:
 *
 *   pass     cleared its threshold
 *   fail     did not. The only verdict that ever blocks.
 *   exempt   a declared WCAG provision. Reported, never scored. NOT a pass —
 *            calling an exemption a pass is how a linter starts lying.
 *   unknown  the pair cannot be judged: a token the contract names is missing,
 *            or a translucent colour has no known backdrop. A gap in the
 *            contract, not a defect by the designer — so it never blocks.
 *
 * That trichotomy is the same discipline AGENTS.md §2 applies to telemetry: a
 * metric whose prerequisites are unmet returns `unknown`, never `normal`.
 *
 * See docs/token-engine-architecture.md §2.4.
 */
import { contrast, requiredRatio, bestOn, isHex } from "./contrast.js";
import { FILL_STEPS, onCandidates, ON_MIN , semanticFor, componentsFor } from "./token-resolve.js";
import rawContracts from "../tokens/contracts.json" with { type: "json" };
import { EXPECTED_DEFECTS } from "../tokens/baseline.js";

export { EXPECTED_DEFECTS };

/** Contract rows only — the file also carries `$note` documentation entries. */
export const CONTRACTS = rawContracts.filter((r) => r.fg && r.bg);

/**
 * Tier-3 rows, derived from each component's own `$pairs` declaration.
 *
 * A component states which of its slots sit on which, so declaring a slot also
 * declares its contrast coverage — no second file to remember to update. That
 * matters because the failure mode here is silent: a new component token with no
 * pair is UNCHECKED, and unchecked reads exactly like compliant.
 */
export function componentContracts(resolved) {
  const rows = [];

  /* A slot painted `transparent` is not unjudgeable — it is judged against
     whatever sits behind it, which in this product is the card surface. Naming
     that here rather than skipping the pair is the difference between "we
     checked" and "we looked away". Same for `@surface`, used by components that
     have no fill of their own. */
  const behind = (mode) => resolved.semantic[mode]["surface/raised"];

  for (const [id, def] of Object.entries(resolved.componentDefs ?? {})) {
    const label = def.$label ?? id;
    const baseType = def.$base?.labelType?.$value ?? def.labelType?.$value;
    const typeOf = (ref) => (typeof ref === "string" ? ref.replace(/^\{type:|\}$/g, "") : undefined);

    /* explicitly declared pairs on the component itself */
    for (const pair of def.$pairs ?? [])
      rows.push({
        ...pair,
        fg: `@c:${id}.${pair.fg}`,
        bg: pair.bg === "@surface" ? "@behind" : `@c:${id}.${pair.bg}`,
        component: id,
        componentLabel: label,
      });

    /* every variant × state, auto-paired */
    for (const [vid, vdef] of Object.entries(def.$variants ?? {})) {
      if (vid.startsWith("$")) continue;
      for (const [sid, sdef] of Object.entries(vdef.$states ?? {})) {
        if (sid.startsWith("$")) continue;
        const path = `${id}.variants.${vid}.states.${sid}`;
        const common = {
          component: id,
          componentLabel: label,
          variant: vid,
          variantLabel: vdef.$label ?? vid,
          state: sid,
        };

        // A known defect can be declared on the STATE or on the whole VARIANT.
        // On the variant when the root cause is the variant's colour choice; on
        // the state when only one state is affected.
        const knownDefect = sdef.$knownDefect ?? vdef.$knownDefect ?? null;

        // WCAG 1.4.3 exempts text that is part of an inactive control. Declared
        // here from the STATE NAME so nobody has to remember to mark it.
        const exempt =
          sid === "disabled"
            ? {
                reason: "disabled-control",
                note: `${label} · ${vdef.$label ?? vid} · disabled — WCAG 1.4.3 exempts inactive controls.`,
                owner: "design-system",
              }
            : undefined;

        if (sdef.fg && sdef.bg)
          rows.push({
            ...common,
            fg: `@c:${path}.fg`,
            bg: sdef.bg.$value === "transparent" ? "@behind" : `@c:${path}.bg`,
            kind: "text",
            typeToken: typeOf(baseType),
            ...(exempt ? { exempt } : knownDefect ? { knownDefect } : {}),
          });

        // A focus ring is a state indicator — SC 1.4.11 and 2.4.11, 3:1.
        if (sdef.ring)
          rows.push({
            ...common,
            fg: `@c:${path}.ring`,
            bg: "@behind",
            kind: "ui",
            slotRole: "ring",
          });

        // A border only earns a 3:1 requirement when it IDENTIFIES the control —
        // declared per component as `$borderRole`, never guessed. A row rule and
        // a field outline look the same in code and are different in WCAG.
        if (def.$borderRole === "control" && sdef.border && sdef.border.$value !== "transparent" && sdef.bg)
          rows.push({
            ...common,
            fg: `@c:${path}.border`,
            bg: sdef.bg.$value === "transparent" ? "@behind" : `@c:${path}.bg`,
            kind: "ui",
            slotRole: "border",
            ...(exempt && { exempt }),
          });
      }
    }
  }
  return rows;
}

/** The documentation entries, so the editor can show the rules to the reader. */
export const CONTRACT_NOTES = rawContracts.filter((r) => r.$note || r.$rule);

/**
 * The palette one scheme + mode actually renders, including the derived
 * foregrounds the contract refers to as `@onBrand` / `@on.*` / `@fill.*`.
 *
 * Mirrors getTheme()'s override order exactly. If this drifted from the theme,
 * the editor would score a palette the product never paints.
 */
export function paletteFor(resolved, schemeId, mode) {
  const scheme = resolved.schemes[schemeId] ?? resolved.schemes.default;
  const sm = scheme[mode];

  // The brand swap lives in semanticFor() now, so this function and getTheme()
  // cannot drift apart on what a scheme actually changes.
  const out = semanticFor(resolved, schemeId, mode);

  // ONE label for all three fill states, because that is what the button
  // renders: containedPrimary overrides only backgroundColor on :hover and
  // :active. Scoring the hover fill against a label derived from the hover fill
  // would flatter the palette by measuring a colour the product never paints.
  out["@onBrand"] = sm.onBrand;
  for (const [role, fg] of Object.entries(resolved.contrastOn[mode])) out[`@on.${role}`] = fg;
  for (const [role, byMode] of Object.entries(resolved.fixedFill)) out[`@fill.${role}`] = byMode[mode];

  // Tier 3. Namespaced so a component slot can never collide with a semantic
  // role, and so a contract row reads unambiguously as which tier it is about.
  out["@behind"] = resolved.semantic[mode]["surface/raised"];
  for (const [id, slots] of Object.entries(componentsFor(resolved, schemeId, mode))) {
    for (const [slot, value] of Object.entries(slots)) {
      if (slot === "variants") continue;
      out[`@c:${id}.${slot}`] = value;
    }
    for (const [vid, v] of Object.entries(slots.variants ?? {}))
      for (const [sid, st] of Object.entries(v.states ?? {}))
        for (const [slot, value] of Object.entries(st))
          out[`@c:${id}.variants.${vid}.states.${sid}.${slot}`] = value;
  }

  return out;
}

/** Judge one contract row in one palette. Never throws. */
export function judge(row, palette, typeStyles) {
  if (row.exempt)
    return { level: "exempt", reason: row.exempt.reason, note: row.exempt.note, owner: row.exempt.owner };

  const fg = palette[row.fg];
  const bg = palette[row.bg];
  if (!fg || !bg || !isHex(fg) || !isHex(bg))
    return { level: "unknown", reason: `${!fg || !isHex(fg) ? row.fg : row.bg} is not a resolvable colour` };

  const ratio = contrast(fg, bg);
  const required = requiredRatio(row.kind, row.typeToken, typeStyles);

  // No requirement means WCAG asks nothing of this pair — SC 1.4.11 covers
  // components and graphical objects, not separators. Reported with its ratio so
  // a reader can still see it, but never scored and never blocking.
  if (required === null)
    return {
      level: "exempt",
      reason: "decorative",
      note: "A separator or edge — SC 1.4.11 covers UI components and graphical objects, not decoration.",
      owner: "design-system",
      ratio,
      fg,
      bg,
    };

  const base = { ratio, required, fg, bg, knownDefect: row.knownDefect ?? null };
  if (ratio >= required) return { ...base, level: "pass" };
  return { ...base, level: "fail", shortfall: required - ratio };
}

/**
 * Score the whole contract across every scheme and mode.
 *
 * `scope` narrows it: `{ scheme, mode }` for the combination on screen, or
 * nothing for the full 486-pair sweep the build runs.
 */
export function audit(resolved, scope = {}) {
  const schemeIds = scope.scheme ? [scope.scheme] : Object.keys(resolved.schemes);
  const modes = scope.mode ? [scope.mode] : ["light", "dark"];
  const typeStyles = resolved.type.styles;
  const contracts = [...CONTRACTS, ...componentContracts(resolved)];
  const rows = [];

  for (const schemeId of schemeIds)
    for (const mode of modes) {
      const palette = paletteFor(resolved, schemeId, mode);
      for (const row of contracts)
        rows.push({ ...row, scheme: schemeId, mode, verdict: judge(row, palette, typeStyles) });
    }
  return rows;
}

/** Every declared pair for one component, judged. Drives the Components tab. */
export function componentRows(resolved, componentId, scope) {
  return audit(resolved, scope).filter((r) => r.component === componentId);
}

/** Counts by verdict level, plus a `blocking` count that ignores known defects. */
export function summarise(rows) {
  const out = { pass: 0, fail: 0, exempt: 0, unknown: 0, blocking: 0, defect: 0 };
  for (const r of rows) {
    out[r.verdict.level] += 1;
    if (r.verdict.level === "fail") {
      if (r.verdict.knownDefect) out.defect += 1;
      else out.blocking += 1;
    }
  }
  return out;
}

/**
 * Every contract row a token participates in, for the inspector. A token with no
 * rows is not "compliant" — it is unchecked, and the editor says so.
 */
export function rowsFor(resolved, tokenPath, scope) {
  const short = tokenPath.replace(/^semantic\./, "");
  return audit(resolved, scope).filter((r) => r.fg === short || r.bg === short);
}

/* ── guardrails ───────────────────────────────────────────────────────────── */

export const GUARD_MODES = ["off", "warn", "enforce"];


/**
 * Would binding `path` to `candidate` break a declared pair?
 *
 * Returns the rows that would fail. ENFORCE blocks only on `fail` — never on
 * `unknown`, because a pair the engine cannot judge is a hole in the contract
 * rather than a mistake by the person editing, and blocking on it teaches people
 * to switch the guard off.
 */
export function violationsIfSet(resolved, path, candidateHex, scope) {
  const short = path.replace(/^semantic\./, "");
  const rows = audit(resolved, scope).filter((r) => r.fg === short || r.bg === short);
  const out = [];
  for (const r of rows) {
    if (r.verdict.level === "exempt" || r.verdict.level === "unknown") continue;
    const fg = r.fg === short ? candidateHex : r.verdict.fg;
    const bg = r.bg === short ? candidateHex : r.verdict.bg;
    if (!fg || !bg) continue;
    const ratio = contrast(fg, bg);
    if (ratio < r.verdict.required)
      out.push({ ...r, would: { ratio, required: r.verdict.required, shortfall: r.verdict.required - ratio } });
  }
  return out;
}

/**
 * The nearest primitives that would fix a failing pair.
 *
 * Deliberately limited to tokens that ALREADY EXIST. An engine that offers
 * `#0b5c9e` to fix a ratio is proposing a new primitive — a design decision with
 * ramp consequences. "Use blue-700, which gives 7.2:1" is a suggestion someone
 * can accept; a novel hex is one they have to escalate.
 */
export function suggestions(resolved, againstHex, required, limit = 4) {
  const out = [];
  for (const [name, hex] of Object.entries(resolved.flat)) {
    const ratio = contrast(hex, againstHex);
    if (ratio >= required) out.push({ token: name, hex, ratio });
  }
  return out.sort((a, b) => a.ratio - b.ratio).slice(0, limit);
}

/**
 * The label colour the theme will derive for a given fill — so the editor can
 * show the consequence of a brand edit before it is made.
 */
export const labelFor = (resolved, fillHex) => bestOn(fillHex, onCandidates(resolved.primitives), ON_MIN);

export { FILL_STEPS };
