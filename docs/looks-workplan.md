# Looks — implementation workplan

Executable plan for [design-system-presets-research.md](design-system-presets-research.md).
Built for **minimum AI token cost per unit of shipped work**.

---

## The economics of this plan

Three properties of this repo make the feature far cheaper than it looks. The plan is shaped around
them.

**1 · A Look is already expressible — it is an override patch.**
`resolveTokens(src, overrides)` deep-merges a sparse patch over the source document
([token-resolve.js:189](../src/lib/token-resolve.js#L189)). So the entire "new resolver axis" from the
research is one expression:

```js
resolveTokens(source, merge(lookPatch, userOverrides))
```

Look applies first, user overrides win — exactly the layering §6.1 of the research specified.
**No new resolver, no new modifier machinery, no rewrite.** This removes what looked like the largest
engineering item.

**2 · `npm run tokens` is a deterministic oracle.**
It scores 129 pairs × 9 schemes × 2 modes and exits non-zero on any regression. Every step below is
verified by a command, not by a model re-reading code. **Verification costs ~200 tokens, not ~20,000.**

**3 · `audit(resolved, scope)` already scopes** by scheme and mode
([a11y.js:218](../src/lib/a11y.js#L218)). Auditing a Look is `audit(resolveTokens(src, lookPatch))` —
no new audit engine.

### Cost model

| Class | Typical cost | Examples |
|---|---|---|
| **JSON-only** | 1–3k | Authoring a Look, adding contract rows |
| **New module** | 4–8k | `src/lib/looks/index.js`, a script |
| **Targeted edit** to a file already summarised here | 4–10k | `ramp.js`, `check-a11y.mjs` |
| **Edit to a large unread file** | 15–30k | `theme.js` (420 ln), `design-tokens.jsx` (990 ln) |

The plan front-loads the first three classes and touches the fourth exactly twice.

---

## Ground rules — read before starting any step

1. **One step per prompt.** Say `do S3.2`. The step ID is the whole brief; do not re-explain the
   feature. This file is the context.
2. **Never re-read to verify.** Run the step's Verify command. Edit tools error if a change failed;
   the gate errors if behaviour regressed.
3. **Paste output, not files.** When a step fails, paste the *gate output*. Never paste a source file.
4. **New files beat edits.** Anything that can live in a new module should.
5. **Batch the JSON steps.** S4.2–S4.5 are one prompt, not four.
6. **Stop at a 🛑.** Those need a human decision, not more code.
7. **Do not open `design-tokens.jsx` or `theme.js`** except in the two steps that name them.

---

## Phase map

```
P0  Instrument      S0.1 ✅                 ── DONE. Killed S1.1, found S1.0
P1  Generator       S1.0 ✅  S1.1 ⛔  S1.2 ✅ ── DONE. The audit now measures
                                              what the product paints
P2  Capacity        S2.1 ✅  S2.2 ✅          ── DONE. Looks can differ in
                                              depth and shape, not just hue
P3  The axis        S3.1  S3.2  S3.3  S3.4  ── the engine
P4  The Looks       S4.1 … S4.5             ── JSON only, cheapest phase
P5  The UI          S5.1  S5.2  S5.3        ── the only expensive phase
P6  Deferred        S6.x                    ── not in V1
```

---

## Phase 0 · Instrument

Nothing is decided before there is a number. This mirrors the architecture doc's own rule —
*"If only one thing gets built, build M0."*

### S0.1 ✅ · Measure HSL vs OKLCH · **spent ~9k**

**Done.** `src/lib/ramp.js` gained OKLCH conversion and a `space` argument (default `"hsl"`, so
nothing changed); `scripts/ramp-compare.mjs` scores the document once per space with the same audit
the gate uses. Re-run any time with `node scripts/ramp-compare.mjs`.

**Result — the flip is not worth making:**

| space | failing rows | generated schemes | given ramps (control) |
|---|---:|---:|---:|
| `hsl` (today) | **113** | 87 | 26 |
| `oklch` (offset port) | **113** | 87 | 26 |
| `oklch-abs` (fixed targets) | **113** | 87 | 26 |

Not a flat measurement — two rows per generated scheme *do* move
(`@onBrand on action/primary/pressed` went 2.46:1 → 2.26:1). They move within the same verdict, so
the count is unchanged. **The 113 is not sensitive to the ramp colour space, because it is not
caused by the ramp.** Which is what S1.0 below turned out to be about.

**Two defects found by measuring:**

1. **Invalid hex from `generateRamp` — fixed in this step.** `hslToHex` did not clamp, and
   `generateRamp` *offsets* lightness from the base, so any base above ~55% HSL lightness drove step
   100 past 100%, making `c` negative and emitting an eleven-character non-hex — `#12511e101`.
   Three of seven generated schemes (indigo, violet, periwinkle) did this, and `RING_ORDER.dark`
   reaches step 100, so the value was reachable and was being scored as if it were a colour.
   Clamped; all ramps now valid in all three spaces; gate unchanged at 113.
2. **Tier 3 is scheme-blind** — see S1.0. This is the real finding.

### S1.1 ⛔ · Flip the ramp to OKLCH — **cancelled**

Measured at zero benefit (above). It would have moved seven schemes' colours and cost a sign-off
round for nothing. The OKLCH code stays in `ramp.js`, unused by default, because P4 needs it: a Look
that seeds a ramp from an arbitrary brand hue wants the perceptual space even though the existing
schemes do not. **Do not revisit without a new measurement.**

---

## Phase 1 · Make the audit true — ✅ COMPLETE

**Result: 113 → 125 known defects, 0 unmarked, gate green.** The number went UP because
the audit now measures the colour actually painted instead of blue everywhere. Twelve rows were
always failing; nothing could see them. Three things shipped:

1. **`componentsFor()`** re-resolves tier 3 per scheme. Verified in the browser: Sunset's outlined
   button label is now `rgb(238,115,4)`, not `#0467b2`.
2. **`action/primary/indicator`** — a derived brand step clearing 3:1, the same treatment
   `focus/ring` has. 18 derivations across 9 schemes × 2 modes; **11 of them moved off the fill
   step**, meaning in 11 of 18 combinations the brand fill would NOT have cleared 3:1 as an
   indicator. Sunset light: `#d96a00` instead of `#ee7304`.
3. **`MuiButton` outlined and text wired to tier 3.** They had no override at all and fell through
   to MUI's default `alpha(primary.main, .5)` outline — about 1.9:1 on white in Sunset, an invisible
   border. This was not in the original S1.2 scope, but moving a contract row onto a token the
   product does not paint would have made the audit *less* true, which is the opposite of this
   phase's purpose.

> **Note for S5.x and S6.1.** `styleOverrides.variants` is **not applied by MUI v9** in this
> codebase — verified in a browser after a clean dev-server restart, not assumed. Component
> overrides must use class selectors (`"&.MuiButton-outlined.MuiButton-colorPrimary"`), whose
> doubled class also clears MUI's own variant specificity. Anything that styles a component from a
> token must follow that shape.

### S1.0 ✅ · Tier 3 does not follow the scheme · **spent ~16k**

**Found by S0.1 and more important than anything it replaced.**

`getTheme()` substitutes the scheme into exactly four semantic roles
([theme.js:110](../src/lib/theme.js#L110)) and then reads component slots from `components[mode]` —
which `resolveTokens` produced **before** any scheme existed, off the semantic layer, where
`action/primary/rest` dereferences the fixed `blue` family. `paletteFor` does the same
([a11y.js:145](../src/lib/a11y.js#L145)).

So all 292 component slots are pinned to blue in all nine schemes. In Sunset, a contained button is
orange and the outlined button beside it is **blue** — and the same for every active nav row and
selected tab. The audit is right; the product is wrong.

It also inflates the headline number: **11 of the 13 failing rows per scheme are the same
scheme-blind rows counted nine times.** Roughly 81 of the 113 are one defect wearing nine hats — the
architecture doc's §0.6 already suspected this from the other direction.

| | |
|---|---|
| **Why it blocks Looks** | A Look patches source `semantic` and re-runs `resolveTokens`, so components *do* follow a Look. But P4 audits every Look **× every scheme**, and every one of those combinations is currently mis-scored on 11 rows. Zero-defect admission (S3.4) is meaningless until the audit measures what is painted. This is research risk **R7**, confirmed and worse than described. |
| **Files** | `src/lib/token-resolve.js` (`resolveSlot` already takes a `ctx` — the seam) · `src/lib/a11y.js` (`paletteFor`) · **`src/lib/theme.js`** (`comp`) |
| **Do** | Re-resolve component slots against a scheme-substituted semantic map rather than the base one. Keep `resolved.components` as the default-scheme value so nothing downstream breaks, and add a per-scheme resolution used by `paletteFor` and `getTheme`. Do **not** change any token value. |
| **Verify** | `npm run tokens` — expect `EXPECTED_DEFECTS` to *move*, and the message names the new number. Then: `node -e` the audit for `sunset/dark` and confirm the outlined-button rows no longer read `#5598d0`. |
| **🛑** | It changes rendered colours in eight schemes — outlined buttons, text buttons, active nav rows and selected tabs stop being blue and start matching the scheme. That is the intended behaviour and a **visible change**, so it needs the same sign-off S1.1 would have needed — but this one is a bug fix with a measured cause, which is a much easier conversation. |
| **Depends** | — |

### S1.2 ✅ · Split fill from indicator · **spent ~9k**

`action/primary/rest` is a button background *and* an active-nav indicator. The first needs nothing
against the surface; the second needs 3:1. Sunset fails at 2.96:1. Hue-dependent, so a library of
Looks hits it repeatedly (research §9.2).

| | |
|---|---|
| **Files** | `src/lib/token-resolve.js` (derive `action/primary/indicator` the way `focus/ring` is derived, via `stepClearing`) · `src/tokens/contracts.json` (move the two `ui` rows onto the new token, drop their `knownDefect`) |
| **Do** | Add the derived token beside the existing ring derivation. Do **not** rewire call sites — that is S6.1. |
| **Verify** | `npm run tokens` exits 0 with `EXPECTED_DEFECTS` reduced by 18 (2 rows × 9 schemes) |
| **Depends** | S1.0 — do it after, or the two changes fight over the same `EXPECTED_DEFECTS` number |

---

## Phase 2 · Capacity — ✅ COMPLETE

Five elevation levels (`none`/`xs`/`sm`/`md`/`lg`) and seven radius steps
(`none`/`sharp`/`control`/`surface`/`large`/`xl`/`pill`) — the original three radius names and
values are untouched, so nothing that referenced them moved.

Two decisions worth keeping:

- **`darkAlpha` is declared per level, never derived.** A shadow is a shortfall of light; the alpha
  that reads on white is invisible on a dark surface. `md` is 0.10 light and 0.44 dark. One
  multiplier would have quietly flattened every dark-mode Look.
- **Exposed as `theme.elevation`, not `theme.shadows`.** MUI's `shadows` is a fixed 25-entry array
  and overwriting it would change every component that reads an elevation number.

Nothing reads these yet — the product stays deliberately flat, `MuiPaper` still defaults to
elevation 0 and cards are still separated by borders. They exist so P4 has something to vary.

Research §4.2: we have **no shadow tokens** and only 3 radius values. Every system reviewed has more.
Depth and shape are the most legible differences after colour — without these, Looks vary only in hue
and the feature reads as decoration (risk R4).

### S2.1 ✅ · Add the `shadow` category · **spent ~11k**

| | |
|---|---|
| **Files** | `scripts/figma-tokens.json` (`nonFigma.shadow`, 5 levels) · `src/lib/token-resolve.js` (pass through + `themeBundle`) · `scripts/build-tokens.mjs` (emit `--genus-shadow-*`) · **`src/lib/theme.js`** (expose as `theme.shadows`) |
| **Do** | Model as DTCG `shadow`: `{ offsetY, blur, spread, color, alpha }`, colour as a primitive alias so it darkens correctly per mode. Five levels matching the existing `elevation` usage. |
| **Verify** | `npm run tokens` exits 0 · `grep -c 'genus-shadow' src/tokens.css` ≥ 5 |
| **Depends** | — |
| **Note** | One of only two steps that opens `theme.js`. Do it in one pass. |

### S2.2 ✅ · Expand `radius` · **spent ~1k**

| | |
|---|---|
| **Files** | `scripts/figma-tokens.json` only |
| **Do** | `control 4 · surface 8 · pill 999` → add `none 0 · sharp 2 · large 12 · xl 16`. Existing three keep their names and values, so nothing breaks. |
| **Verify** | `npm run tokens` exits 0 |
| **Depends** | — |

---

## Phase 3 · The Look axis

### S3.1 · Freeze the format · **~3k**

Freezing the contract first is what stops later steps re-reading earlier ones.

| | |
|---|---|
| **Files** | `src/tokens/looks/README.md` · `src/tokens/looks/standard.look.json` |
| **Do** | Write the format from research §11.3: `id`, `version`, `label`, `blurb`, `character`, `provenance`, `requires`, `audit`, `patch`. **`patch` is a sparse `figma-tokens.json` override — the exact shape the editor already exports.** `standard` has an empty patch and is the permanent identity/escape hatch. |
| **Verify** | `node -e "require('./src/tokens/looks/standard.look.json')"` |
| **Depends** | — |

### S3.2 · The registry · **~6k**

| | |
|---|---|
| **Files** | `src/lib/looks/index.js` (new, ~70 lines) |
| **Do** | Static imports of every `*.look.json`. Export `LOOKS` (array for the gallery), `lookById(id)`, `lookPatch(id)` returning `{}` for unknown ids, and `DEFAULT_LOOK = "standard"`. No fetch, no dynamic import — research §11.5. |
| **Verify** | `node -e "import('./src/lib/looks/index.js').then(m=>console.log(m.LOOKS.map(l=>l.id)))"` |
| **Depends** | S3.1 |

### S3.3 · Thread it through the store · **~8k**

| | |
|---|---|
| **Files** | `src/lib/token-store.jsx` (~270 ln, summarised below) |
| **Do** | Add `look` to state, persist beside `overrides` under the existing `genus-tokens` key, and change the one resolution call to `resolveTokens(source, merge(lookPatch(look), overrides))`. Export `look`, `setLook`, and `shadowedByLook` — the list of override paths the current Look also sets, which S5.3 needs. Applying a Look pushes **one** undo entry. |
| **Verify** | `npm run dev`, switch look via the store, confirm repaint and that overrides still win |
| **Depends** | S3.2 |

### S3.4 · Gate every Look · **~7k**

| | |
|---|---|
| **Files** | `scripts/check-a11y.mjs` · `src/tokens/baseline.js` |
| **Do** | Loop `LOOKS`; for each, `audit(resolveTokens(src, lookPatch(id)))`. Change `EXPECTED_DEFECTS` from a number to `{ standard: 113, field: 0, … }`. **Any look other than `standard` must be 0** — research §9.3. Report per-look in the summary line. |
| **Verify** | `npm run tokens` exits 0 and prints one line per Look |
| **Depends** | S3.2 |

> After S3.4 the engine is complete. Everything after is content and interface.

---

## Phase 4 · The Looks · **cheapest phase — batch it**

Each Look is a JSON file plus a gate loop. No source code. Run S4.2–S4.5 as **one prompt**.

| Step | Look | Character | Cost |
|---|---|---|---|
| **S4.1** | `field` | High contrast, larger type, flat, sharp — outdoor/glare use | ~5k |
| **S4.2** | `calm` | Low chroma, soft radius, subtle depth, relaxed density | ~2k |
| **S4.3** | `compact` | Standard colour, condensed rows, tighter spacing | ~2k |
| **S4.4** | `contrast-dark` | Dark-first, high contrast — control-room use | ~2k |
| **S4.5** | `slate` | Near-monochrome, brand only at accents | ~2k |

| | |
|---|---|
| **Files** | `src/tokens/looks/<id>.look.json` only |
| **Do** | Write the patch, run the gate, adjust the numbers it names, repeat until 0 defects. Purely mechanical — the gate says exactly which pair and by how much. |
| **Verify** | `npm run tokens` exits 0 with every non-standard Look at 0 |
| **Depends** | S2.1, S2.2, S3.4 |

> `compact` and `contrast-dark` deliberately differ on axes **other than hue**, to test risk R4 at
> launch rather than after.

---

## Phase 5 · The UI · **the only expensive phase**

### S5.1 · The gallery · **~18k**

| | |
|---|---|
| **Files** | `src/pages/appearance.jsx` (new) |
| **Do** | Cards showing a **miniature of a real Genus screen** — KPI tiles + a slice of the alarms table — rendered in that Look, not swatch rows (research §10.2). Name, one plain line, readability badge. Selecting enters preview; a persistent bar offers Apply / Back. **Never render the word "token".** |
| **Verify** | Browser: gallery renders, preview repaints, apply persists across reload |
| **Depends** | S3.3, P4 |

### S5.2 · Route and navigation · **~4k**

| | |
|---|---|
| **Files** | `src/App.jsx` · `src/components/organisms/shell.jsx` |
| **Do** | `/admin/appearance` under Administration, above Design tokens. Second and last step that touches a large file. |
| **Verify** | Route resolves; nav highlights |
| **Depends** | S5.1 |

### S5.3 · The shadow dialog · **~6k**

| | |
|---|---|
| **Files** | `src/pages/appearance.jsx` |
| **Do** | On apply, if `shadowedByLook` is non-empty: *"3 of your earlier changes will keep overriding this Look"* + the list + **Keep my changes** / **Use the Look's** / **Show me the difference**. Never resolve silently in either direction (research §8.6). |
| **Verify** | Set an override, apply a Look that touches it, confirm the dialog |
| **Depends** | S5.1 |

---

## Phase 6 · Deferred — not V1

| Step | What | Why deferred |
|---|---|---|
| **S6.1** | Rewire ~29 `palette.primary.main` sites to fill vs indicator | Large mechanical diff; S1.2 already stops the bleeding |
| **S6.2** | Look tab in the token editor | Designers can read the JSON meanwhile |
| **S6.3** | Export / import a Look | Editor export already produces the patch shape |
| **S6.4** | Brand-hex seeding ("paste your colour, get a Look") | V1.5 — and the S0 experiment may promote it |
| **S6.5** | DTCG-valid colour objects | Only needed once import exists |
| **S6.6** | Radix adapter | V2 |

**Explicitly not building:** third-party import, a mapping UI, a remote registry, more than ~8 Looks,
per-component preset overrides, APCA as the gate.

---

## Stop points

| # | Decision | Blocks | Owner |
|---|---|---|---|
| ✅ 1 | ~~Tier-3 scheme fix sign-off~~ — **shipped**. Outlined buttons, text buttons, active nav rows and selected tabs now match the scheme instead of being blue in all nine | done | design-system |
| 🛑 2 | **Internal tool or tenant-facing branding?** (architecture doc §5.1) | S3.3 persistence, S5.x permissions | product |
| 🛑 3 | **Per-user or per-tenant Look?** | S3.3 data model | product |

🛑 2 and 🛑 3 only bind at S3.3. Everything from S0.1 to S3.2 is correct either way — **start there
regardless of whether the decisions have landed.**

---

## Total

| Phase | Cost | Cumulative |
|---|---|---|
| P0 Instrument | ~9k ✅ spent | 9k |
| P1 Generator | ~22k | 31k |
| P2 Capacity | ~12k | 43k |
| P3 Axis | ~24k | 67k |
| P4 Looks | ~13k | 80k |
| P5 UI | ~28k | 108k |

**~108k tokens for V1**, against a naive "read everything and build a preset system" approach that
would spend more than that on `design-tokens.jsx` and `theme.js` alone. The saving comes from three
places: the override layer already being the axis, the gate already being the oracle, and this file
already being the context.
