# Looks — the file format

A **Look** is a complete, named, versioned appearance: colour, type, spacing, shape and depth, in
light and dark, guaranteed to pass the contrast gate.

One file per Look, `<id>.look.json`, registered in [`src/lib/looks/index.js`](../../lib/looks/index.js).

---

## Why a Look is just a patch

`resolveTokens(src, overrides)` already deep-merges a sparse patch over the source document. So a
Look needs no new resolver, no new modifier machinery, and no change to the resolution algorithm —
it is the same override layer the editor has always used, applied underneath the user's own edits:

```js
resolveTokens(source, merge(lookPatch(look), userOverrides))
```

The Look applies first; **the user's own changes stay on top and keep winning.** Applying a Look is
therefore a layer, not a write — nothing is destroyed, and "go back to Standard" is one field, not
an undo.

---

## Shape

| Field | Required | What |
|---|---|---|
| `id` | ✓ | Filename stem. Stable forever — it is persisted in settings |
| `version` | ✓ | Semver. A **patch** may not change any resolved value; a **minor** may add categories; a **major** may change values |
| `label` | ✓ | What the user sees. Never a token name |
| `blurb` | ✓ | One plain-language line for the gallery card. No jargon — see the terminology map in the research doc §6.3 |
| `character` | ✓ | Machine-readable, so the gallery can sort and filter without parsing prose. `contrast`, `shape`, `depth`, `density` |
| `provenance` | ✓ | `source`, `generator`, `seededFrom`, `licence`, `attribution`, `authoredOn` |
| `requires` | ✓ | `schema` semver range, checked at load. A Look from the future is refused with a clear message, never partially applied |
| `audit` | ✓ | The gate result at author time. The build re-scores anyway; this is for the UI badge and for review |
| `patch` | ✓ | A sparse `scripts/figma-tokens.json` override. **This is the whole Look** |

### `provenance.licence` is load-bearing

If it is non-null, the UI **must** display `attribution`. That is machine-enforced so nobody has to
remember. See the research doc §11.7 — permissive licences grant copyright and patent rights but not
trademark, so **no Look is named after another company's design system.**

---

## What a patch may and may not touch

| May | May not |
|---|---|
| `primitives` — the neutral and brand ramps | `components` — tier 3 must FOLLOW tier 2, never be set directly. A Look that pins a component slot stops following its own semantic layer |
| `semantic` — all 29 roles | `$meta` — provenance of the Figma export |
| `type` — family and the style ramp | `schemes` — a scheme is the user's separate choice, layered on top |
| `nonFigma.spacing` / `radius` / `shadow` / `layout` | The status ramps, without signed approval — status colour is safety-critical in a utility platform, and a Look that restyles "warning" is a hazard, not a preference |

---

## The admission rule

**A new Look must score zero defects.** `EXPECTED_DEFECTS` covers `standard` only — those 125 are the
product's pre-existing known defects, not something a Look introduced. Any other Look that fails a
single contract row fails the build.

That is deliberate and non-negotiable: the whole promise of this feature to a non-expert is *"pick
one, it will be readable."* A Look shipping with its own defect list would make that promise false.

Authoring loop, entirely mechanical:

```bash
npm run tokens
```

The gate names the exact pair, the exact ratio and the exact shortfall. Adjust, re-run, repeat.

---

## Adding one

1. Copy `standard.look.json`, change `id`, `label`, `blurb`, `character`.
2. Write the `patch`.
3. Add one import line to [`src/lib/looks/index.js`](../../lib/looks/index.js).
4. `npm run tokens` until it exits 0 with your Look at 0 defects.
5. Record the result in `audit`.
