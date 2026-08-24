/**
 * The token store — live editing of every token, from the front end.
 *
 * Holds a sparse OVERRIDE layer over the source document. The source is never
 * mutated, which is what makes a draft cheap to keep, cheap to undo, and cheap
 * to describe: `overrides` is exactly the diff, so "what have I changed" needs no
 * computation and export is the same object.
 *
 * Resolution runs through src/lib/token-resolve.js — the same function
 * scripts/build-tokens.mjs uses. So the preview is not an approximation of the
 * build output, it IS the build output. See docs/token-engine-architecture§2.3.
 *
 * How an edit reaches the screen: the resolved bundle is handed to `getTheme()`,
 * which rebuilds the MUI theme. That measures 0.164 ms (§0.3) — the cost is the
 * React commit underneath it, not the theme. Writing CSS custom properties
 * instead would avoid the commit entirely, but this app reads its palette through
 * Emotion (166 `theme.palette.*` refs against 7 CSS-var declarations), so the
 * var route needs the M1 migration first. Rebuild works today; §1.1 has the
 * comparison.
 */
import React, { createContext, useContext, useCallback, useMemo, useReducer, useEffect, useState } from "react";
import source from "../../scripts/figma-tokens.json";
import { resolveTokens, assertResolved, themeBundle, merge } from "./token-resolve.js";
import { lookPatch, lookById, shadowedBy, DEFAULT_LOOK } from "./looks/index.js";

const KEY = "genus-tokens";
const HISTORY_LIMIT = 50;

/* ── persistence ──────────────────────────────────────────────────────────
   Same defence as settings.jsx: a corrupt or unknown draft must never break
   boot. Anything unparseable is dropped, not thrown.                        */

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { look: DEFAULT_LOOK, overrides: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { look: DEFAULT_LOOK, overrides: {} };

    // Drafts written before Looks existed are a bare override tree. Detected by
    // the ABSENCE of the wrapper key rather than by sniffing token names, so a
    // future top-level token group cannot be mistaken for a draft envelope.
    if (!("overrides" in parsed)) return { look: DEFAULT_LOOK, overrides: parsed };

    return {
      look: typeof parsed.look === "string" ? parsed.look : DEFAULT_LOOK,
      overrides: parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
    };
  } catch {
    return { look: DEFAULT_LOOK, overrides: {} };
  }
}

function write(look, overrides) {
  try {
    const clean = look === DEFAULT_LOOK && Object.keys(overrides).length === 0;
    if (clean) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify({ look, overrides }));
  } catch {
    /* quota or private mode — the draft simply does not survive a reload */
  }
}

/* ── diff ─────────────────────────────────────────────────────────────────── */

/** Flatten an override tree to `["primitives.blue.500", …]` leaf paths. */
export function overridePaths(node, prefix = "") {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return prefix ? [prefix] : [];
  return Object.entries(node).flatMap(([k, v]) => overridePaths(v, prefix ? `${prefix}.${k}` : k));
}

/** Read a dotted path out of an object. */
const at = (obj, path) =>
  path.split(".").reduce((o, k) => (o === undefined || o === null ? undefined : o[k]), obj);

/** Build a sparse tree for one dotted path. */
function sparse(path, value) {
  const keys = path.split(".");
  return keys.reduceRight((acc, k, i) => (i === keys.length - 1 ? { [k]: value } : { [k]: acc }), value);
}

/** Remove a dotted path from a tree, pruning empty parents. */
function without(node, keys) {
  if (keys.length === 0 || node === null || typeof node !== "object") return undefined;
  const [head, ...rest] = keys;
  if (!(head in node)) return node;
  const next = rest.length ? without(node[head], rest) : undefined;
  const out = { ...node };
  if (next === undefined) delete out[head];
  else out[head] = next;
  return Object.keys(out).length ? out : undefined;
}

/* ── context ──────────────────────────────────────────────────────────────── */

const TokenContext = createContext(null);

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error("useTokens must be used inside <TokenProvider>");
  return ctx;
}

/* ── history ──────────────────────────────────────────────────────────────
   One reducer over `{ present, past, future }` rather than three useStates.

   The first version nested setPast/setFuture INSIDE a setOverrides updater. That
   is a side effect in a place React treats as pure — StrictMode invokes updaters
   twice, so redo silently did nothing while undo appeared to work. A reducer
   makes every transition atomic and leaves nothing for double-invocation to
   corrupt.                                                                    */

const initial = (overrides) => ({ present: overrides, past: [], future: [] });

/** Push a new present, remembering the old one. `null` means "no change". */
const advance = (state, next) =>
  next === null
    ? state
    : {
        present: next,
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        future: [],
      };

function reducer(state, action) {
  switch (action.type) {
    case "patch":
      return advance(state, merge(state.present, action.patch));

    case "drop": {
      if (at(state.present, action.path) === undefined) return state; // nothing there
      return advance(state, without(state.present, action.path.split(".")) ?? {});
    }

    case "replace":
      return advance(state, action.overrides && typeof action.overrides === "object" ? action.overrides : {});

    case "dropUnder": {
      const keep = {};
      let removed = 0;
      for (const path of overridePaths(state.present)) {
        if (path === action.prefix || path.startsWith(`${action.prefix}.`)) {
          removed += 1;
          continue;
        }
        // Rebuild rather than delete: pruning empty parents out of a nested tree
        // in place is where this kind of code grows bugs.
        Object.assign(keep, merge(keep, sparse(path, at(state.present, path))));
      }
      return removed === 0 ? state : advance(state, keep);
    }

    case "clear":
      return Object.keys(state.present).length === 0 ? state : advance(state, {});

    case "undo": {
      if (!state.past.length) return state;
      return {
        present: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
      };
    }

    case "redo": {
      if (!state.future.length) return state;
      return {
        present: state.future[0],
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
      };
    }

    default:
      return state;
  }
}

export function TokenProvider({ children }) {
  const stored = useMemo(read, []);
  const [history, dispatch] = useReducer(reducer, undefined, () => initial(stored.overrides));
  const overrides = history.present;

  /* The Look is its own axis, deliberately OUTSIDE the undo history.
     `history` is about token EDITS — "Review changes" lists them by path with a
     value to go back to — and a Look is not an edit, it is which baseline those
     edits sit on. Undoing it is picking another Look, which the gallery offers
     directly; folding it into the same stack would make one Ctrl-Z sometimes
     mean "un-apply an appearance" and sometimes "restore one padding value". */
  const [look, setLookState] = useState(stored.look);

  useEffect(() => write(look, overrides), [look, overrides]);

  /** Apply a sparse patch. */
  const apply = useCallback((patch) => dispatch({ type: "patch", patch }), []);

  /**
   * Set one dotted path — "primitives.blue.500", "nonFigma.radius.control".
   *
   * Writing a value equal to the SOURCE value drops the override instead of
   * recording one. Without this a control that fires on mount, or a user who
   * picks the colour that was already there, leaves a no-op entry behind — and
   * then `dirty` over-reports, the export carries changes that change nothing,
   * and "3 tokens changed" stops being a fact. The draft has to be the diff.
   */
  const set = useCallback((path, value) => {
    const sourceValue = at(source, path);
    if (sourceValue !== undefined && sourceValue === value) dispatch({ type: "drop", path });
    else dispatch({ type: "patch", patch: sparse(path, value) });
  }, []);

  /** Drop an override so the token returns to its source value. */
  const revert = useCallback((path) => dispatch({ type: "drop", path }), []);

  /**
   * Drop every override under a dotted prefix — one component, one variant, one
   * state, or a whole tier.
   *
   * The point of this is the middle ground. Per-token revert is precise but
   * tedious after a few edits, and "discard everything" is a cliff: a person who
   * mis-set one padding should not have to choose between hunting it down and
   * losing an afternoon's work. Every reset stays undoable — `advance()` pushes
   * the previous state onto the history — so the destructive-looking button is
   * not actually destructive.
   */
  const revertUnder = useCallback((prefix) => dispatch({ type: "dropUnder", prefix }), []);

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const resetAll = useCallback(() => dispatch({ type: "clear" }), []);

  /** Replace the whole draft — used by import. */
  const replaceDraft = useCallback((next) => dispatch({ type: "replace", overrides: next }), []);

  /* ── resolution ─────────────────────────────────────────────────────────
     One memo drives the whole product. `problems` is carried, never thrown:
     the editor has to render an invalid draft so the user can see what is
     wrong and fix it. Only the build treats problems as fatal.              */

  /* THE AXIS, in one line. A Look is a sparse patch and `resolveTokens` already
     deep-merges one, so it needs no new resolver: the Look goes on first and the
     user's own overrides go on top and keep winning. Applying is a layer, never
     a write — nothing is destroyed and "back to Standard" is one field. */
  const patch = useMemo(() => lookPatch(look), [look]);
  const resolved = useMemo(() => resolveTokens(source, merge(patch, overrides)), [patch, overrides]);

  /* What the user's edits are measured AGAINST. With a Look applied that is the
     Look's value, not the shipped one — otherwise "changed from" would report
     every value the Look moved as though the user had moved it. */
  const baseline = useMemo(() => (Object.keys(patch).length ? merge(structuredClone(source), patch) : source), [patch]);

  /**
   * Which of the user's edits will keep overriding this Look.
   *
   * Applying never destroys an edit, so an earlier one can silently SHADOW the
   * Look and make it look broken. The apply dialog names these before anything
   * happens — never resolved silently in either direction.
   */
  const shadowedByLook = useMemo(() => shadowedBy(patch, overrides), [patch, overrides]);

  const setLook = useCallback((id) => setLookState(lookById(id) ? id : DEFAULT_LOOK), []);
  const bundle = useMemo(() => themeBundle(resolved), [resolved]);
  const problems = useMemo(() => assertResolved(resolved), [resolved]);

  const changed = useMemo(() => overridePaths(overrides), [overrides]);

  /** Which overrides sit under a prefix — for a reset button that states its scope. */
  const changedUnder = useCallback(
    (prefix) => (prefix ? changed.filter((p) => p === prefix || p.startsWith(`${prefix}.`)) : changed),
    [changed],
  );

  /** Every edit as `{ path, from, to }`, newest last — the "what did I change" list. */
  const changeList = useMemo(
    () => changed.map((path) => ({ path, from: at(baseline, path), to: at(resolved.source, path) })),
    [changed, resolved.source, baseline],
  );

  /** What a token is now, and what it was — for the "changed from shipped" UI. */
  const compare = useCallback(
    (path) => ({ current: at(resolved.source, path), original: at(baseline, path), isOverridden: changed.includes(path) }),
    [resolved.source, changed, baseline],
  );

  const value = useMemo(
    () => ({
      source,
      overrides,
      look,
      setLook,
      lookMeta: lookById(look),
      shadowedByLook,
      resolved,
      bundle,
      problems,
      changed,
      dirty: changed.length,
      set,
      revert,
      revertUnder,
      changedUnder,
      changeList,
      apply,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      resetAll,
      replaceDraft,
      compare,
    }),
    [overrides, look, setLook, shadowedByLook, resolved, bundle, problems, changed, changeList, set, revert, revertUnder, changedUnder, apply, undo, redo, history.past.length, history.future.length, resetAll, replaceDraft, compare],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}
