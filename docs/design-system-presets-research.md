# Design-system presets — product and technical research

**Question.** Can a user pick a ready-made design system and have it applied to Genus Solar's tokens
automatically, so that non-experts get a coherent, accessible result without understanding tokens?

**Short answer.** Yes, but not the way the question is usually framed. Importing other people's
design systems is the expensive, legally awkward, low-value half of the idea. Generating our own
gate-passing token packs is the cheap, high-value half — and we are already most of the way there.
Ship the generator, package it as a small library of named *Looks*, and treat third-party import as a
V2 capability aimed at designers, not at the users who cannot read a token name.

---

## How to read this

Every substantive claim carries one of three labels.

| Label | Meaning |
|---|---|
| **[V]** | **Verified** — from a primary source (spec, official docs, package README, or this repository), cited or file-referenced. |
| **[R]** | **Reasoned recommendation** — my judgement built on the verified material. Arguable. |
| **[A]** | **Assumption / open question** — needs a decision or a user, not more reading. |

Confidence is stated as **High / Medium / Low** on every major recommendation. Where I could not
confirm something from a primary source, I say so rather than filling the gap.

### Contents

- [1 · Executive summary](#1--executive-summary)
- [2 · Problem definition](#2--problem-definition)
- [3 · Existing landscape](#3--existing-landscape)
- [4 · Design-system comparison](#4--design-system-comparison)
- [5 · Token architecture findings](#5--token-architecture-findings)
- [6 · Recommended product model](#6--recommended-product-model)
- [7 · Canonical token schema](#7--canonical-token-schema)
- [8 · Mapping strategy](#8--mapping-strategy)
- [9 · Accessibility strategy](#9--accessibility-strategy)
- [10 · UX proposal](#10--ux-proposal)
- [11 · Technical architecture](#11--technical-architecture)
- [12 · Roadmap](#12--roadmap)
- [13 · Risks and edge cases](#13--risks-and-edge-cases)
- [14 · User validation plan](#14--user-validation-plan)
- [15 · Final recommendation](#15--final-recommendation)
- [Appendix A · The twenty questions, answered](#appendix-a--the-twenty-questions-answered)
- [Appendix B · Sources](#appendix-b--sources)

---

## 1 · Executive summary

### 1.1 Six findings that decide the shape of this feature

**F1 — We already have the canonical schema. This is an adapter project, not an architecture
project. [V, High]**

`scripts/figma-tokens.json` is a three-tier token document — 9 primitive families, 28 semantic roles,
292 component slots across 16 components, 12 type styles, plus spacing/radius/motion/layout — resolved
by a single pure function, [`src/lib/token-resolve.js`](../src/lib/token-resolve.js), shared by the
build emitter, the CI contrast gate and the live editor. Question 17 ("should we use a canonical
internal schema as an abstraction layer?") is not open. It is built, it is enforced, and it is the
only reason this feature is tractable at all.

**F2 — There is no standard for mapping one design system's semantics onto another's. [V, High]**

DTCG 2025.10 is stable and excellent, and it standardises *syntax only* — `$value`, `$type`, aliases,
groups, modes. It deliberately defines no semantic vocabulary. Two perfectly DTCG-valid files can
share zero role names. Everything the industry calls "token translation" — Style Dictionary,
`sd-transforms`, Terrazzo — translates *format and platform*, never *meaning*. Searching for prior
art on cross-system semantic mapping returns naming-convention blog posts and nothing else. So every
external system we support is bespoke adapter work with no shared leverage, which is exactly the
category of work you build last and least of.

**F3 — Presets collide with the scheme rule as written. [V, High]**

`figma-tokens.json` states the rule plainly: *"A scheme changes the BRAND HUE ONLY. Neutrals,
surfaces, text, borders and the status ramps never change — a colour scheme must not be able to break
contrast or restyle a warning."* Every external design system worth importing changes neutrals,
surfaces and status ramps. A preset is therefore **not a scheme** and must not be smuggled in as one.
It needs its own modifier axis with its own, wider, permission — and its own audit obligation, since
the safety the scheme rule bought us by construction has to be re-bought by measurement.

**F4 — Licensing rules out the naive version of the feature. [V, High]**

Shopify Polaris ships under a modified MIT that restricts use to applications interoperating with
Shopify. Salesforce's icons and images are CC BY-ND — no derivatives. And permissive licences
(Apache-2.0 explicitly, §6) grant copyright and patent rights but **not trademark rights**: shipping a
tenant-facing picker labelled "Material" or "Carbon" is a branding decision, not an engineering one.
The workable version ships *our* Looks, some of them seeded from permissively-licensed palettes with
attribution, described by visual character rather than by someone else's brand name.

**F5 — Generation beats importing, and the whole industry has converged on the same trick. [V, High]**

Material's HCT guarantees a contrast ratio ≥ 3.0 at a tone difference of 40 and ≥ 4.5 at 50. USWDS's
"magic number" says a grade difference of 40 clears AA Large, 50 clears AA, 70 clears AAA. Radix
targets APCA Lc 60 and Lc 90 for its text steps against step 2. Adobe Leonardo inverts the problem
entirely: state the contrast ratio, get the colour. All four are the same move — **fix lightness
targets in a perceptually uniform space so that step distance implies contrast**, converting
accessibility from a check you run into a property you hold.

`RAMP_LIGHTNESS` in [`src/lib/ramp.js`](../src/lib/ramp.js) already has exactly this shape — fixed
lightness targets at 92/80/69/58/47/38/28. It interpolates in **HSL**, whose lightness is not
perceptually uniform, which is why the guarantee does not hold and why we have 113 known defects
rather than zero. Moving that one function to OKLCH is the highest-leverage change in this document.

**F6 — The 113-defect baseline is the real constraint on the roadmap. [V, High]**

`EXPECTED_DEFECTS = 113` in [`src/tokens/baseline.js`](../src/tokens/baseline.js), across 27 scored
pairs × 9 schemes × 2 modes = 486 measurements. Three root causes, all colour-generation problems.
Presets multiply this space: *P* presets × 2 modes × 27 pairs, each needing its own baseline. Shipping
presets on top of an already-failing generator would take a known, documented, bounded defect list and
make it combinatorial. **Fix the generator, then ship the presets it generates.**

### 1.2 The recommendation

> **Build "Looks": a small library of house-authored appearance presets, generated by our own OKLCH
> ramp engine, applied as a new resolver axis, every one of which passes `npm run tokens` at zero
> defects.**
>
> V1 is 6–8 Looks and a preview-and-apply flow. It contains **no external design-system import at
> all**. External adapters arrive in V2 as a designer-facing capability, starting with Radix Colors,
> because Radix is the only major system whose semantics decode into ours mechanically.

Why this and not the literal request: the literal request ("select a design system, get its tokens")
solves a problem the target user does not have. A non-expert user cannot evaluate "IBM Carbon" versus
"Adobe Spectrum" any more than they can evaluate `surface/raised`. What they can evaluate is *"this
one looks calm and this one looks high-contrast, and here is my actual dashboard in both."* The
design-system names are developer-facing packaging on a generator that has to exist either way.

---

## 2 · Problem definition

### 2.1 What exists today

`/admin/design-tokens` ([`src/pages/design-tokens.jsx`](../src/pages/design-tokens.jsx), 990 lines)
exposes seven tabs — Primitives, Semantic roles, Components, Type, Spacing & scale, Schemes, Audit —
and edits every token live. Drafts are sparse override patches in `localStorage`, resolved through the
same `resolveTokens()` the build uses, so the preview *is* the build output. Nothing writes to disk;
landing a change means Export → merge → `npm run tokens`.

That is a genuinely good authoring tool. It is also, precisely, the thing the brief says users cannot
operate: it presents 28 semantic roles, 292 component slots and a nine-scheme matrix, and it assumes
you know that `text/on-brand` must be derived per fill because white clears 4.5:1 on 3 of 18
scheme/mode brand fills.

### 2.2 The two populations

| | **Operator / brand owner** | **Designer / developer** |
|---|---|---|
| Wants | The product to look right and on-brand | Control over specific decisions |
| Vocabulary | "darker", "calmer", "our blue" | `action/primary/hover`, tier-2, alias |
| Failure mode today | Picks values that break contrast, or does nothing at all | Fine — the current editor serves them |
| What they need | A short list of complete, safe choices | An escape hatch out of that list |

The brief's core insight is right: the current tool optimises entirely for column two, and column one
is where the adoption problem lives. **[V from the brief, High]**

### 2.3 The decision this feature forces

`docs/token-engine-architecture.md` §5.1 leaves open whether this is an internal design-system tool or
a tenant-facing branding surface, and marks it *"Please confirm before M4."* A preset library aimed at
non-experts is unambiguously the second. That changes three things the architecture doc already
anticipated: drafts become per-tenant server state rather than `localStorage`, enforcement becomes
mandatory rather than a preference, and the editable set narrows.

**This feature cannot be scoped without answering §5.1.** It is the first open question in
[§14](#14--user-validation-plan). **[R, High]**

### 2.4 Explicit non-goals

- Supporting every design system. Named as a constraint in the brief; restated here because it is the
  single easiest way to sink this project.
- Two-way sync with Figma. Out of scope per §5.7 and unaffected by this feature.
- Replacing the token editor. Looks sit *above* it; the editor stays exactly as it is.

---

## 3 · Existing landscape

### 3.1 The standard: DTCG 2025.10

**[V, High]** The Design Tokens Community Group published its **first stable version, 2025.10, on 28
October 2025**, comprising three modules — **Format**, **Colour** and **Resolver**.

What the **Format module** normatively gives us:

| Element | Rule |
|---|---|
| Types | 7 primitive (`color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`) + 6 composite (`strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography`). "Every design token _MUST_ use one of these types." |
| Aliases | `{group.token}` curly references, plus RFC 6901 JSON Pointer `$ref` for property-level access. Chained references MUST be followed; circular references MUST NOT exist. |
| Names | MUST NOT contain `{`, `}` or `.`; MUST NOT begin with `$`. |
| Type inheritance | Inherited from the closest parent group with a `$type`; a token with no resolvable type is invalid. |
| `$extensions` | Vendor-keyed, reverse-domain recommended. **"Tools that process design token files _MUST_ preserve any extension data they do not themselves understand."** |
| Files | `.tokens` / `.tokens.json`, MIME `application/design-tokens+json`. |

The **Colour module** makes `colorSpace` and `components` required, supports 14 colour spaces
including `oklch` and `display-p3`, and allows the `none` keyword where `0` would be ambiguous in a
cylindrical space.

The **Resolver module** is the one that matters most to us. It declares `sets`, `modifiers` and
`resolutionOrder`; later entries in `resolutionOrder` win on conflict; **only `resolutionOrder` may
reference a modifier**, and sets and modifiers MUST NOT reference other modifiers. Its own
documentation notes that *N* modifiers with 4, 3 and 2 contexts produce 24 resolutions — the
combinatorial explosion it exists to prevent, and precisely the one Genus has at 9 schemes × 2 modes ×
7 fonts = 126 combinations.

**The critical negative finding [V, High]:** DTCG standardises the *container*, not the *contents*.
There is no normative vocabulary of semantic roles — no `text.primary`, no `surface.raised`. A tool
can validate a foreign token file completely and still have no idea what any of it means. This is a
deliberate scope choice, and it is the reason [F2](#11-six-findings-that-decide-the-shape-of-this-feature)
holds.

Our own document is DTCG-*shaped* but not DTCG-*valid* on three counts already catalogued in
`token-engine-architecture.md` §2.1 (string colours, bespoke `blue.500` aliases, inline modes). One
further gap I did not find noted there: the `DtcgType` union in §2.2 omits **`gradient`**, which is one
of the six composite types in the stable spec. **[V, High]**

### 3.2 Tooling

| Tool | What it does | Relevance |
|---|---|---|
| **Style Dictionary v5** | Reference transformer. **[V]** Default export format is now DTCG JSON; all colour transforms handle both legacy strings and DTCG objects across all 14 colour spaces; DTCG dimension objects supported; preprocessor hooks run before transforms. | The obvious engine if we ever emit to platforms beyond CSS. Not needed for V1 — our resolver already emits what we need. |
| **Tokens Studio** | Figma plugin. **[V]** Multi-dimensional themes as Group > Theme > TokenSet; `permutateThemes` expands `$themes.json` into every combination; sets flagged as "sources" so references resolve on export; `@tokens-studio/sd-transforms` aligns its types to DTCG types. | The closest existing product to what we would build, and evidence that multi-axis theming is a solved authoring pattern. |
| **Figma variables** | **[V]** Modes per collection are plan-gated: Starter has none, Professional up to 10, Organization up to 20, Enterprise "unlimited modes with extended collections". Objects default to "Auto" mode and inherit from their parent; the default mode is the leftmost column. | Directly caps any Figma round-trip. Our 126 combinations do not fit in 10 or 20 modes; they only work expressed as separate collections or via the Resolver model. Reinforces §5.7's decision to stay one-way. |

### 3.3 Colour generation — the state of the art

**[V, High]** Four approaches, all converging on the same principle:

1. **Material HCT / dynamic colour.** A source colour yields four complementary key colours; each
   generates a 13-tone tonal palette (0 = black to 100 = white); tones are assigned to roles
   "paint-by-number". **A tone difference of 40 guarantees ≥ 3.0:1; a difference of 50 guarantees
   ≥ 4.5:1.** Nine scheme variants (Tonal Spot, Neutral, Vibrant, Expressive, Content, Fidelity,
   Monochrome, Rainbow, Fruit Salad) × three contrast levels (standard, medium, high).
2. **USWDS grades.** A 0–100 lightness grade where grade 50 in one family matches grade 50 in another.
   The "magic number": Δ40 ⇒ AA Large, Δ50 ⇒ AA, Δ70 ⇒ AAA; grade-50 colours clear Section 508 AA
   against both pure white and pure black.
3. **Radix Colors.** 12 steps with published semantics per step, and steps 11 and 12 "guaranteed to
   Lc 60 and Lc 90 APCA contrast ratio on top of a step 2 background from the same scale". Matching
   alpha variants per scale. An in-browser custom-palette generator produces an accessibility-checked
   scale from a brand colour.
4. **Adobe Leonardo.** Inverts the problem: specify target contrast ratios, receive colours.
   Defaults to 3:1 and 4.5:1 per WCAG 2.0 AA.

**[R, High]** The lesson for us is not "adopt one of these". It is that the accessibility guarantee
must live in the *lightness curve*, not in a post-hoc audit — and that this only works in a
perceptually uniform space. `generateRamp()` has the right architecture and the wrong colour space.

### 3.4 Product precedents for "pick a look"

**[V, High]** These are the most useful evidence in the whole review, because they show the product
model already works commercially:

| Product | Model | What it proves |
|---|---|---|
| **daisyUI** | 35 built-in named themes; `data-theme="THEME_NAME"` on any element switches everything; nestable with no limit; `--default` and `--prefersdark` flags. | Named, opinionated, whole-package themes as a headline feature. Non-experts pick by name and look, never by token. |
| **shadcn/ui registry** | `registry:theme` items carry `cssVars` for light and dark in OKLCH; `registry:base` distributes a whole design system — components, deps, CSS vars, fonts, config — as one payload; **presets** pack colours, theme, icon library, fonts and radius into a short shareable code. | A preset is a *package with an identity and a version*, not a diff. Directly informs our registry design ([§11.5](#115-preset-registry)). |
| **tweakcn** | Visual no-code theme editor for shadcn: colour pickers, sliders, typography and radius controls, live component preview, curated presets to start from, export to CSS. | Our editor plus a preset gallery is a validated shape. Also: **presets exist to give you a starting point, not a destination** — every one of these tools expects you to tweak afterwards. |
| **Material Theme Builder** | One source colour → a complete scheme at three contrast levels. | The generator-first model. One input a non-expert genuinely has ("our brand blue"). |

**[R, High]** Note what none of them do: none lets you import a *competitor's* design system. They all
ship first-party presets over a first-party generator. That is the market's answer to the question in
the brief, and it matches [F4](#11-six-findings-that-decide-the-shape-of-this-feature) and
[F5](#11-six-findings-that-decide-the-shape-of-this-feature).

---

## 4 · Design-system comparison

Ten systems. Facts are from the sources in [Appendix B](#appendix-b--sources); anything I could not
confirm is marked "not confirmed" rather than guessed.

### 4.1 Architecture and naming

| System | Tiers | Semantic layer style | Naming | Component tier |
|---|---|---|---|---|
| **Material 3** | 3 — reference, system, component **[V]** | Role-named | `md.ref.palette.*`, `md.sys.color.*`, `md.comp.*` **[V]** | Yes, extensive **[V]** |
| **Radix Colors** | 1½ — scales + alpha variants | **Scale-positional with published step semantics** **[V]** | `blue.9`, `slate.11`, `blueA.6` | No |
| **IBM Carbon** | 2–3 — core palette + themed role tokens | Role-named, layered | `$background`, `$layer-01/02/03`, `$text-primary`, `$text-helper`, `$border-subtle`, `$support-*` **[V]** | Partial (component-specific tokens exist) |
| **Atlassian** | 2–3 | Role-named with **emphasis** and **interaction state** modifiers **[V]** | `color.text.accent.blue`, emphasis from "subtlest" to "boldest" **[V]** | Yes |
| **Adobe Spectrum** | 2–3 | Role-named + platform scales | Deprecation-aware; a renamed token stays as an alias to the new name **[V]** | Yes — v12 moved away from enumerating every component-option combination **[V]** |
| **Tailwind v4** | 1–2 | **Namespaced primitives**, semantics optional | `--color-*`, `--spacing-*`, `--radius-*`, `--text-*`, `--shadow-*`, `--ease-*` … **[V]** | No |
| **GitHub Primer** | 2 — base + functional **[V]** | Role-named | `base.*` for size/type/motion; `functional.*` for spacing, breakpoints, themed colour **[V]** | No (functional is the top tier) |
| **USWDS** | 2 — system palette + theme tokens **[V]** | Role-named theme tokens over a positional palette | `red-50`, `blue-warm-60`; theme roles `primary`, `secondary`, `accent`, `base`, `ink` **[V]** | No |
| **Shopify Polaris** | 2 | Role-named | `--p-color-bg`, `--p-color-bg-surface` **[V]** | Partial |
| **Fluent 2** | 2 — global + alias **[V]** | Role-named ("function immediately recognisable") **[V]** | Not confirmed in detail | Yes |
| **Genus (ours)** | **3 — primitive, semantic, component** | Role-named | `blue.500` → `surface/raised` → `button.contained.rest.bg` | **Yes — 292 slots** |

### 4.2 Categories and colour model

| System | Colour model | Type | Spacing | Radius | Elevation |
|---|---|---|---|---|---|
| **Material 3** | HCT; 13 tones per palette **[V]** | Type scale roles | 4dp grid (not confirmed from primary source) | Shape scale | Elevation levels + tonal surfaces |
| **Radix Colors** | sRGB + P3 + alpha variants **[V]** | — | — | — | — |
| **Carbon** | Per-theme role values over a core palette **[V]** | Type sets | Spacing scale | Limited | Layering model rather than shadows **[V, partial]** |
| **Atlassian** | Role + emphasis ladder **[V]** | Yes | Yes | Yes | Yes |
| **Spectrum** | Platform-scaled (desktop/mobile) **[V]** | Yes | Yes | Yes | Yes |
| **Tailwind v4** | **OKLCH default palette** **[V]** | `--text-*`, `--font-weight-*`, `--tracking-*`, `--leading-*` **[V]** | Single `--spacing-*` base **[V]** | `--radius-*` **[V]** | `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*` **[V]** |
| **Primer** | Per-theme colour, alpha transforms on inherited colours **[V]** | base type **[V]** | functional spacing **[V]** | Yes | Yes |
| **USWDS** | Family + **grade 0–100** where grade is cross-family comparable **[V]** | Family + size tokens **[V]** | Unitless units, `1px`/`2px` exceptions **[V]** | Yes | Shadow tokens **[V]** |
| **Polaris** | Role-named colour groups **[V]** | Yes | Yes **[V]** | Yes | Yes |
| **Fluent 2** | Global colour ramps → alias roles **[V]** | Type ramp **[V]** | Yes **[V]** | Corner radius **[V]** | Shadow/elevation **[V]** |
| **Genus** | sRGB hex, HSL-interpolated ramps; `{mix:a,b,pct}` for composited tints | 12 styles: size/weight/lineHeight/tracking | 11 steps, 4px base | **3 only**: control 4, surface 8, pill 999 | **None — no shadow tokens at all** |

> **Finding [V, High].** We have no elevation/shadow tokens and only three radius values. Every
> external system has a richer shape and depth vocabulary than we do. Any preset that carries shadows
> has nowhere to put them — see [§8.5](#85-when-they-have-what-we-do-not-q7) — and any preset whose
> character depends on shadow (most "soft" or "elevated" looks) cannot express itself in our schema.
> **Adding a `shadow` category is a prerequisite for presets being visually distinguishable**, not a
> nice-to-have.

### 4.3 Theming, accessibility, format, licence, and fit

| System | Modes / themes | Accessibility approach | Format | Licence **[V]** | Mapping fit |
|---|---|---|---|---|---|
| **Material 3** | Light/dark × 3 contrast levels × 9 scheme variants **[V]** | **Structural** — Δtone 40 ⇒ 3:1, Δtone 50 ⇒ 4.5:1 **[V]** | JSON / platform libs; `material-color-utilities` | Apache-2.0 (utilities). Trademark **not** granted by Apache-2.0 §6 | **Medium.** Role vocabulary is rich but shaped around containers (`primary-container`) we do not have |
| **Radix Colors** | Light + dark + alpha + P3 per scale **[V]** | **Structural** — steps 11/12 guaranteed APCA Lc 60/Lc 90 on step 2 **[V]** | JS/CSS packages | **MIT** (© WorkOS) **[V]** | **High — the best of the ten.** Step semantics are published, so positional decodes to role |
| **Carbon** | 4 themes: White, Gray 10, Gray 90, Gray 100 **[V]** | Role tokens designed per theme; not a published structural guarantee | Sass + JS, `@carbon/themes` **[V]** | **Apache-2.0** **[V]** | **Low.** `layer-01/02/03` and `$text-helper` have no home in our 28 roles |
| **Atlassian** | Light/dark themes **[V]** | Emphasis ladder = contrast ladder against default surface **[V]** | `@atlaskit/tokens`; ESLint/Stylelint enforcement **[V]** | Not confirmed | **Medium.** Emphasis modifiers are a cleaner ladder than ours; role names differ |
| **Spectrum** | Light/dark/darkest × desktop/mobile **[V, partial]** | Adaptive colour (Leonardo lineage) **[V]** | JSON + schema, Rust validator CLI **[V]** | Not confirmed from primary source | **Medium-low.** Platform scales are an axis we do not have |
| **Tailwind v4** | Via CSS custom properties + variants **[V]** | None built in — palette is OKLCH but unguaranteed | CSS `@theme` **[V]** | MIT (widely known; not re-verified here) | **Low as a system, high as a palette.** No semantic layer to map from |
| **Primer** | **8 themes** — light/dark × dimmed, high contrast, colourblind, tritanopia **[V]** | Themes *are* the accessibility strategy | Style Dictionary → CSS **[V]** | **MIT** **[V]** | **Medium.** Two tiers only; the high-contrast and colourblind themes are genuinely valuable prior art |
| **USWDS** | Theme tokens over system palette **[V]** | **Structural** — the magic number Δ40/50/70 **[V]** | Sass functions/mixins **[V]** | US Government work; public-domain status **not verified in this review** | **High for the method, medium for the tokens** |
| **Polaris** | Colour schemes **[V, undetailed]** | Not confirmed | JS/CSS/JSON **[V]** | **Modified MIT restricting use to apps that integrate or interoperate with Shopify** **[V]** | **Do not ship.** Licence makes it unusable for us |
| **Fluent 2** | Light, dark, **high contrast**, branded **[V]** | "Ensure sufficient colour contrast across the system" **[V]** | Not confirmed | Not confirmed | **Medium.** Global→alias split matches our tier 1→2 cleanly |

### 4.4 The one comparison result that changes the design

**[V→R, High]** Sorting the ten by semantic-layer *style* rather than by vendor produces the finding
that actually matters:

```
SCALE-POSITIONAL                          ROLE-NAMED
Radix (12 steps, documented)              Material 3   (md.sys.color.*)
USWDS (grade 0–100, cross-family)         Carbon       ($layer-01, $text-helper)
Tailwind (50–950, undocumented intent)    Atlassian    (role + emphasis + state)
                                          Spectrum, Fluent, Polaris, Primer
        │                                          │
        ▼                                          ▼
  DECODABLE mapping                        NEGOTIATED mapping
  step → role is a documented function     role → role is a judgement call
  written once, correct for every scale    written per system, argued per token
```

Radix step 3 *is* "component background, normal state" and step 11 *is* "low-contrast text" — the
system tells you. So a Radix adapter is roughly **one function plus a lookup table**, and it works for
every one of their ~30 scales without further work. A Carbon adapter is a hand-negotiated table
where somebody must decide whether `$layer-01` is our `surface/raised` or our `surface/subtle`, and
where `$text-helper` simply has no destination.

**[R, High] This is why V2's first adapter is Radix, and why "add many design systems cheaply" is
partly a false hope: it is cheap for positional systems and expensive for role-named ones, and most
famous design systems are role-named.**

---

## 5 · Token architecture findings

### 5.1 Three tiers is universal; the middle tier is not

**[V, High]** Every mature system separates raw values from contextual roles: Material's
reference/system/component, Fluent's global/alias, Primer's base/functional, our
primitive/semantic/component. Question 5 is settled by consensus.

**[V, High]** But the middle tier's *size and shape* vary by an order of magnitude:

| System | Approximate semantic-colour surface |
|---|---|
| Radix | 12 steps × ~30 scales, positional |
| Genus | **28 roles** |
| Material 3 | ~50 system colour roles |
| Carbon | ~200+ tokens per theme **[V]** |

**[R, High]** Ours is deliberately small, and small is correct for a product design system — but it
means every import is a **lossy projection**, never a translation. That must be stated in the UI, not
buried. A user who picks "Carbon" and gets 28 of its 200 tokens has been misled unless we say so.

### 5.2 The component tier rarely travels

**[V, Medium]** Of the ten, only Material, Spectrum, Atlassian and Fluent publish a substantial
component tier, and those are the four hardest to redistribute. Radix, Tailwind, Primer and USWDS
publish none.

**[R, High]** So a preset will essentially never bring component tokens. Our 292 slots must be
**derivable from tier 2 alone**. They already are — `{sem:…}`, `{space:…}`, `{radius:…}`,
`{type:…}`, `{derive:onBrand}` references mean tier 3 follows tier 2 automatically. **This is the
single most important pre-existing property for this feature, and it is why the tier rule "a
component MUST alias tier 2, never tier 1" (architecture doc §2.2) must be enforced before presets
ship** — any slot that skips the semantic layer will not follow a preset and will look broken.

**[A]** Are there currently any tier-3 slots holding raw values or primitive references? The lint
exists in the spec; I did not verify enforcement. Worth one grep before V1.

### 5.3 Modes are an axis problem, and we have four axes

**[V, High]** Everyone has ≥ 2 modes; Primer has 8; Material has light/dark × 3 contrast levels ×
9 variants. Our axes are mode(2) × scheme(9) × font(7) = 126, and a preset axis multiplies again.

**[R, High]** The DTCG Resolver model is the correct representation and the architecture doc already
proposes it. A preset is a **modifier context**, not a file variant. The constraint that "only
`resolutionOrder` may reference a modifier" is what keeps a preset from reaching sideways into a
scheme, and it makes the scheme rule from [F3](#11-six-findings-that-decide-the-shape-of-this-feature)
mechanically enforceable rather than merely stated.

### 5.4 Derivation is the load-bearing idea

**[V, High]** `token-resolve.js` already derives label colours per fill because a fixed
`text/on-brand` white clears 4.5:1 on only 3 of 18 scheme/mode brand fills. The architecture doc
generalises this to three derivations: `best-contrast`, `mix`, `adjust`.

**[R, High]** For presets, derivation stops being a fix and becomes the *mechanism*. It is how we
answer "the preset didn't give us that token" ([§8.6](#86-when-we-have-what-they-do-not-q8-and-apply-semantics-q13)) and how
we keep arbitrary brand hues safe. **A preset should be allowed to supply as few as 3–5 anchor values
and let derivation produce the rest.** That is also the smallest possible authoring burden, which
matters for user-created presets in V2.

---

## 6 · Recommended product model

### 6.1 The concept: "Looks"

**[R, High confidence on the model, Medium on the exact word]**

Not "design-system presets" — that names the implementation. Not "themes" — that word is already
taken three times over in this codebase (`getTheme()`, MUI's theme object, and the light/dark
`mode`). Not "token packs" — token is the word we are trying to avoid.

**A *Look* is a complete, named, versioned appearance: colour, type, spacing, radius, shape and
depth, in light and dark, guaranteed to pass the contrast gate.**

The three-layer product maps exactly onto the three token tiers and onto the novice→expert gradient:

```
   USER SEES                        SYSTEM DOES                      TIER
┌────────────────────┐
│  Look              │   sets the `look` resolver modifier —       tiers 1+2
│  "Calm" "Field"    │   primitives, semantic roles, type,
│  8 cards, previewed│   scale, shape, depth
└────────────────────┘
┌────────────────────┐
│  Accent colour     │   sets the `scheme` modifier —              tier 1 (brand ramp)
│  9 swatches        │   BRAND HUE ONLY, existing rule intact
└────────────────────┘
┌────────────────────┐
│  Fine-tuning       │   sparse override patch —                   any tier
│  (the editor)      │   the tool that exists today
└────────────────────┘
```

Three properties make this work:

1. **Each layer is independently useful.** A user who only ever touches layer 1 gets a complete,
   coherent, accessible result. This is the answer to question 14.
2. **Layers compose without conflict.** A Look sets the whole board; a scheme changes only the brand
   hue on top of it; overrides sit on top of both. Applying a Look never has to *destroy* anything,
   because a Look is a layer, not a write — see [§8.6](#86-when-we-have-what-they-do-not-q8-and-apply-semantics-q13).
3. **The existing scheme rule survives.** Layer 2 keeps its narrow permission; only layer 1 gets the
   wide one, and layer 1 is the layer we author and gate. **[R, High]**

### 6.2 Why not the alternatives

| Model | Verdict |
|---|---|
| "Design systems" (import Carbon, Material, …) | **Reject for V1.** Licensing ([F4](#11-six-findings-that-decide-the-shape-of-this-feature)), lossy projection ([§5.1](#51-three-tiers-is-universal-the-middle-tier-is-not)), and the target user cannot evaluate the choice. **[R, High]** |
| "Themes" | Reject on the name collision alone. **[R, High]** |
| "Token packs" | Reject — developer framing for a non-developer feature. Keep as the internal file-format name. **[R, Medium]** |
| "Brand kit" | Tempting for the tenant-branding reading of §5.1, and worth testing if that is the direction. Narrower than what we are shipping (a Look includes type and spacing, not just brand). **[A]** |

### 6.3 Terminology map

**[R, High]** Every user-facing string, with the reason:

| Internal | User-facing | Why |
|---|---|---|
| Token | *(never shown at layer 1)* | The word the feature exists to hide |
| Look / preset | **Look** | Short, plain, no collision |
| Semantic role | **What it's used for** | Roles are only shown to designers |
| Primitive | **Colour** | — |
| Scheme | **Accent colour** | Says what it actually does — brand hue only |
| Mode | **Light / Dark** | Universally understood |
| Contrast audit | **Readability check** | "Contrast" is jargon; "readable" is the outcome |
| Contrast failure | **Hard to read** | Names the user's problem, not the metric |
| Override | **Your changes** | — |
| Derived token | **Chosen automatically** | — |

---

## 7 · Canonical token schema

### 7.1 Keep what exists

**[R, High]** The canonical schema is `figma-tokens.json` as resolved by `token-resolve.js`. It should
not be redesigned for this feature. What follows are deltas.

### 7.2 Delta 1 — the `look` modifier axis

The new axis, and the permission table that goes with it. **[R, High]**

| Axis | May write | May not write | Count today |
|---|---|---|---|
| `mode` | Everything semantic | Primitives | 2 |
| `scheme` | Brand ramp only | Neutrals, surfaces, text, borders, status | 9 |
| `font` | `type.fontFamily` | Sizes, weights, everything else | 7 |
| **`look`** ← new | **Primitives, all 28 semantic roles, type styles, spacing, radius, shape, depth** | **Component slots** (they must follow tier 2); `$meta`; contracts | 6–8 in V1 |

`resolutionOrder`: `primitives → semantic → component → look → mode → scheme → font`. A Look is
applied *before* mode and scheme so both still get the last word — which is what preserves the scheme
rule and keeps dark mode from being broken by a light-only Look. **[R, Medium — this ordering needs
one careful test; a Look that wants to change dark-mode surfaces specifically may need to declare
per-mode contexts of its own rather than relying on the mode modifier.]**

### 7.3 Delta 2 — DTCG-valid colour values

Required by §2.1 of the architecture doc anyway; made urgent by this feature, because import and
export are the whole point of a preset format. `"#0467b2"` → `{ colorSpace, components, alpha?, hex? }`.
Add `gradient` to the `DtcgType` union. **[V on the requirement, High]**

### 7.4 Delta 3 — new categories

**[R, High]** From [§4.2](#42-categories-and-colour-model):

| Category | Today | Needed | Why |
|---|---|---|---|
| `shadow` | **Absent** | 4–5 levels, DTCG `shadow` type | Without it, Looks cannot differ in depth — the most legible visual difference after colour |
| `radius` | 3 values | 5–6 | Three values cannot express "soft" vs "sharp", which is the second most legible difference |
| `border.width` | Hard-coded `1` in component slots | A token | Density and weight are part of a Look's character |
| `opacity` | Implicit in `{mix:}` | Optional | Lower priority |

### 7.5 Delta 4 — token metadata (question 18)

**[R, High]** Per token, in `$extensions`, reverse-domain per the spec:

| Field | Type | Purpose |
|---|---|---|
| `com.genus.tier` | `primitive \| semantic \| component` | Exists. Enforces the tier lint |
| `com.genus.provenance` | `{ source, fileKey?, node?, extractedOn? }` | Exists. Extend `source` with `look` and `imported` |
| `com.genus.pairings` | `Pairing[]` | Exists. The accessibility contract |
| `com.genus.locked` | `boolean` | Exists. Whether a Look or a user may write it |
| **`com.genus.look`** | `{ id, version }` | **New.** Which Look supplied this value |
| **`com.genus.confidence`** | `exact \| decoded \| derived \| defaulted` | **New.** How this value was arrived at during import. Drives the UI's "we guessed this" markers |
| **`com.genus.unmapped`** | `Record<string, unknown>` | **New.** Foreign tokens with no destination, preserved per the spec's MUST-preserve rule |
| `$deprecated` | `boolean \| string` | Spec-native. Adopt Atlassian's lifecycle ([§11.7](#117-versioning-provenance-and-licensing)) |

Per *Look* (not per token), a manifest — see [§11.5](#115-preset-registry).

---

## 8 · Mapping strategy

*Applies to V2. Recorded now because the V1 schema must not foreclose it.*

### 8.1 Four mapping classes

**[R, High]** Every foreign token lands in exactly one:

| Class | Definition | Example | UI treatment |
|---|---|---|---|
| **Exact** | Foreign role means the same as ours | Carbon `$text-primary` → `text/primary` | Silent |
| **Decoded** | Positional value whose intent is published | Radix step 11 → `text/secondary` | Silent |
| **Derived** | We compute it from what they gave us | `text/on-brand` from their brand fill via `best-contrast` | Marked "chosen automatically" |
| **Unmappable** | No honest destination either way | Carbon `$layer-03`; our `focus/ring` when they have none | Reported, never silently defaulted |

### 8.2 The adapter contract

**[R, High]** Every adapter is one module with four pure functions and no other privileges:

```js
// src/lib/looks/adapters/<system>.js
export const manifest = { id, label, version, source, licence, attribution };

/** Foreign document → DTCG-valid, our colour space. No semantics yet. */
export function normalize(raw) → { tokens, warnings[] }

/** DTCG document → our 28 roles + type + scale. THIS is where the judgement lives. */
export function map(normalized) → { assignments: Record<Role, {value, class, note}>, unmapped }

/** Fill our gaps from their anchors, via the derivation engine only. */
export function fill(assignments) → { assignments, derived: Role[] }

/** Score the result against contracts.json. Never optional. */
export function audit(assignments) → Report
```

`map()` is the only part that differs meaningfully between systems, and per
[§4.4](#44-the-one-comparison-result-that-changes-the-design) it is a lookup table for positional
systems and a negotiated table for role-named ones.

### 8.3 Concrete example — Radix Colors → Genus canonical

**[V on the Radix step semantics, R on the assignments, High]** Using `slate` as the neutral scale and
`blue` as the brand scale, light mode:

| Radix | Published intent **[V]** | → Genus role | Class | Note |
|---|---|---|---|---|
| `slate.1` | App background | `surface/canvas` | Decoded | |
| `slate.2` | Subtle component background | `surface/subtle` | Decoded | |
| *(white)* | — | `surface/raised` | Derived | Radix recommends white for light-mode raised surfaces; not a scale step |
| `slate.3` | Component bg, normal | `tableRow.rest.bg` (tier 3, follows) | Decoded | |
| `slate.4` | Component bg, **hover** | *(no tier-2 home)* | Unmappable→derived | We express hover at tier 3, they express it at tier 2 |
| `slate.5` | Component bg, **pressed/selected** | *(no tier-2 home)* | Unmappable→derived | Same |
| `slate.6` | Subtle border, non-interactive | `border/subtle` | Decoded | |
| `slate.7` | Border, interactive | `border/default` | Decoded | |
| `slate.8` | Strong border, focus ring | `border/strong` | Decoded | |
| `slate.11` | Low-contrast text | `text/secondary` | Decoded | Guaranteed APCA Lc 60 on step 2 **[V]** |
| `slate.12` | High-contrast text | `text/primary` | Decoded | Guaranteed Lc 90 on step 2 **[V]** |
| `blue.9` | Solid background, highest chroma | `action/primary/rest` | Decoded | |
| `blue.10` | Hover over step 9 | `action/primary/hover` | Decoded | |
| *(none)* | — | `action/primary/pressed` | **Derived** | `adjust` −6% L from `blue.10`, or `blue.11` |
| `blue.8` | Focus ring | `focus/ring` | Decoded | |
| *(none)* | — | `text/on-brand` | **Derived** | `best-contrast` against `blue.9`, min 4.5 |
| *(none)* | — | `text/tertiary`, `text/disabled` | **Derived** | `slate.10` / `slate.9` respectively |
| `green/amber/red/blue` scales | — | `status/*/foreground` ← step 11, `status/*/background` ← step 2 | Decoded | Their own contrast guarantee carries over **[V]** |
| `*A` alpha scales | Alpha variants **[V]** | `{mix:…}` tints | Decoded | Maps onto machinery we already have |
| `*P3` scales | Wide gamut **[V]** | — | **Unmapped** | Preserved in `com.genus.unmapped`; we are sRGB-only |

**Result:** 28 roles, of which ~20 decoded, ~6 derived, 0 orphaned. Nothing dropped except P3.
**This is the best case and it is genuinely good** — which is exactly why Radix is the first adapter.

### 8.4 Concrete counter-example — Carbon → Genus

**[V on Carbon's token names, R on the analysis, Medium]** The same exercise on a role-named system:

| Carbon | → Genus | Problem |
|---|---|---|
| `$background` | `surface/canvas` | Fine |
| `$layer-01` | `surface/raised`? `surface/subtle`? | **Judgement call.** Carbon layers by nesting depth; we layer by elevation intent. Not the same idea |
| `$layer-02`, `$layer-03` | — | **No destination.** We have 5 surfaces, they have a 3-level recursive model plus interaction variants per level |
| `$text-primary`, `$text-secondary` | Same names | Fine — and misleading, because "same name" does not mean "same luminance intent" |
| `$text-helper` | — | **No destination.** Nearest is `text/tertiary`, which is not what helper text means |
| `$text-on-color` | `text/on-brand` | Fine, but ours is *derived* and theirs is *fixed*. Ours must win or we reintroduce the 15-of-18 defect |
| `$support-error/success/warning/info` | `status/*/foreground` | Plausible; needs re-audit against our backgrounds, not theirs |
| `$interactive` | `action/primary/rest`? | **Collides.** Carbon's interactive is an accent, not necessarily a button fill |
| ~200 tokens total **[V]** | 28 roles | **~85% discarded** |

**[R, High] The honest UI for this is not a preset card. It is an import report** — which is why
external systems belong in the designer lane, not the operator lane.

### 8.5 When they have what we do not (Q7)

**[R, High]** Policy, in order:

1. **Preserve, never discard.** Into `$extensions["com.genus.unmapped"]`. The spec *requires* tools to
   preserve unknown extension data; the same courtesy for unknown tokens costs nothing and keeps a
   later round-trip honest.
2. **Count and report.** "142 of 200 tokens have no equivalent here." Non-experts never see this; the
   designer lane leads with it.
3. **Offer promotion for the top offender only.** If a foreign category repeatedly has no home —
   shadows today — that is a signal to extend our schema, not to extend the mapping. Handled by
   [§7.4](#74-delta-3--new-categories), not by the adapter.
4. **Never invent a role to hold it.** A schema that grows one role per import stops being a design
   system.

### 8.6 When we have what they do not (Q8), and apply semantics (Q13)

**[R, High]** Gaps are filled in this order, and the order is the point:

```
1. their explicit value        → class: exact / decoded
2. our derivation engine       → class: derived      (best-contrast | mix | adjust)
3. our current value           → class: defaulted    ← always flagged, never silent
4. hard stop                   → the Look is rejected at author time
```

Step 3 is where a preset quietly becomes a hybrid. It is legitimate — but it must be visible, which
is what `com.genus.confidence` is for. A Look that reaches step 4 does not ship.

**Apply is a layer, not a write. [R, High]** Question 13's three options — overwrite, merge, new theme
— are the wrong frame given our resolver. Applying a Look sets `themeState.look = "calm"`. Nothing is
destroyed. User overrides remain on top and continue to win.

The one real interaction: an override that *shadows* a Look. If the user previously set
`surface/raised` to white and the Look wants `#f8f8f8`, their override wins and the Look looks wrong.
So the apply dialog must say so, precisely and in plain language:

> **3 of your earlier changes will keep overriding this Look.**
> Page background, Card background, Body text colour.
> **[Keep my changes]** · **[Use the Look's]** · **[Show me the difference]**

Never resolve this silently in either direction. **[R, High]**

### 8.7 Conflicts and incomplete mappings (Q9)

| Situation | Handling |
|---|---|
| Two foreign tokens map to one role | Adapter declares precedence explicitly; ambiguity is an adapter bug, not a runtime choice |
| Foreign value fails our contrast contract | **Reject at author time.** A preset never ships defects. At import time (designer lane), offer the nearest passing value from the same scale and mark it `derived` |
| Foreign system has no dark mode | Derive dark by inverting the neutral ramp and re-anchoring the brand steps, then audit. If it fails, the Look is light-only and says so |
| Foreign type scale has no monospace | Fall back to our `data/mono`; flag `defaulted` |
| Circular alias in the foreign document | Reject the document. The spec forbids it; we do not repair other people's cycles |
| Foreign document is not DTCG-valid | `normalize()` fails with a specific line-level reason, never a generic parse error |

---

## 9 · Accessibility strategy

**Treated as a property of the system, per the brief's constraint — not a final gate.**

### 9.1 Move `generateRamp()` to OKLCH first

**[R, Very High confidence — this is the strongest recommendation in the document]**

The evidence from four independent systems ([§3.3](#33-colour-generation--the-state-of-the-art)) says
contrast becomes structural when lightness targets are fixed in a perceptually uniform space. We have
the fixed targets. We have the wrong space. `ramp.js` says so itself:

> *"NOTE: this interpolates in HSL, whose lightness is not perceptually uniform, so equal steps look
> unequal at high chroma."*

Consequences of not doing this first: every Look with a brand hue outside blue/orange inherits the
same class of defect that produces 81 of the current 113, and each one needs its own hand-managed
baseline. Consequences of doing it: step distance becomes a near-guarantee, the way Δtone 40 and
Δgrade 40 are, and new Looks can be admitted at zero defects.

This is a **visible colour change** to the seven generated schemes and needs sign-off — architecture
doc §5.3 already flags it. **This feature is the business case for that sign-off.**

**[A]** Does OKLCH alone get us to a *guarantee*, or only to a strong tendency? Material and USWDS
both publish hard thresholds; whether our specific 7-step curve reproduces them needs measurement, not
argument. Run the existing audit across a spread of hues after the change and record the worst case.

### 9.2 Fix the fill/indicator split before presets, not after

**[V→R, High]** Architecture doc §5.6: `action/primary/rest` serves both a button background (needs
nothing against the surface) and an active-nav indicator (needs 3:1 against the surface). Sunset's
orange fails the second at 2.96:1 on white. That defect is **hue-dependent**, so a library of Looks
with varied hues will hit it repeatedly and unpredictably. Splitting the role is a prerequisite, not a
follow-up.

### 9.3 Contracts extend, they do not fork

**[R, High]** `contracts.json` has 31 rows — 27 scored, 4 exempt — and is scored across 9 schemes × 2
modes. Rules for the preset era:

1. **One contract file, more contexts.** A Look does not get its own contract; it gets scored against
   the same 27 pairs. Anything else lets a Look define away its own failures.
2. **New Looks admit at zero defects.** `EXPECTED_DEFECTS` covers legacy only. A `look` context that
   raises the count fails the build. The ratchet already points both ways — extend it per axis.
3. **A Look may not touch `contracts.json`, exemptions, or status ramps** without an explicit,
   owner-signed decision. Status colour is safety-critical in a utility platform; a Look that restyles
   "warning" is a hazard, not a preference.
4. **Add pairings when a Look adds a surface.** A new surface with no contract row is unscored, and an
   unscored pair is the failure mode `contracts.json` exists to prevent.

### 9.4 Derivation carries the guarantee across hues

**[R, High]** `best-contrast` is what makes an arbitrary brand hue safe: the label is computed against
the fill it actually lands on, per mode, per state. Every Look must express `text/on-brand` and every
`@on.*` role as a derivation, never a constant. A Look that hard-codes white on brand is rejected by
the same rule that produced the current derived-label design.

### 9.5 WCAG 2.2 is the bar; APCA is advisory

**[V, High]** WCAG 3.0 is a Working Draft (most recently March 2026) not expected to reach
Recommendation before ~2028–2029; **APCA remains exploratory and is not part of the normative WCAG 3
draft**, and WCAG 3's contrast algorithm is still undetermined. WCAG 2.2 AA is what we are measured
against.

**[R, High]** Keep the current arrangement exactly: WCAG 2.1/2.2 relative luminance is the gate; APCA
is a second, advisory column. Do not let a Look pass on APCA and fail WCAG. Note the tension worth
recording: Radix's guarantee is stated in APCA (Lc 60/90), so an imported Radix palette carries an
APCA guarantee and must still be scored under WCAG 2.x by us.

### 9.6 Beyond contrast

**[R, Medium]** Primer ships light and dark variants for **dimmed, high contrast, colourblind and
tritanopia** — 8 themes. Fluent ships high contrast. **A "High contrast" Look is the single most
valuable item in the library** for a utility-sector platform with outdoor field use, and it is cheap:
it is a lightness-target change, not new architecture. Put it in V1.

Also carried over unchanged: status colour must never be the only signal (already an app convention),
and translucent tints have no contrast ratio until composited — which `{mix:a,b,pct}` already solves
by naming the backdrop in the token.

---

## 10 · UX proposal

### 10.1 Two lanes, one page

```
/admin/appearance                              /admin/design-tokens
┌────────────────────────────────────┐        ┌──────────────────────────────┐
│  APPEARANCE          (operator)    │        │  DESIGN TOKENS   (designer)  │
│                                    │        │                              │
│  Look        ▸ gallery of 6–8      │        │  Primitives · Semantic ·     │
│  Accent      ▸ 9 swatches          │───────▶│  Components · Type · Scale · │
│  Light/Dark  ▸ toggle              │  "Fine │  Schemes · Audit             │
│                                    │   tune"│  + Look (new tab)            │
│  [ Preview ]  [ Apply ]            │        │  + Import (V2)               │
└────────────────────────────────────┘        └──────────────────────────────┘
```

**[R, High]** A new route rather than an eighth tab. The token editor's information density is the
thing we are protecting non-experts from; putting the gallery inside it defeats the purpose. One
clearly-labelled door between them, one way by default.

### 10.2 Lane A — the non-technical user

**The gallery.** 6–8 cards. Each card shows a **miniature of a real Genus screen** — the Overview
KPI tiles and a slice of the alarms table — rendered in that Look, in the user's current mode. Not
swatch rows. Swatches are a token-literate way to preview and they are exactly what this user cannot
read. **[R, High]**

Each card carries: a name, one plain-language line ("Higher contrast, larger text — built for
outdoors"), and a readability badge.

**Try before apply.** Selecting a card enters preview: the whole app repaints and a persistent bar
appears at the bottom.

> Previewing **Field**. Nothing is saved yet. **[Apply]** **[Back to Standard]**

The user navigates the real app while previewing. **This is nearly free** — the token store already
resolves a sparse override layer live through the same function the build uses, so preview is not a
mock-up, it is the actual result. Question 12 is largely answered by machinery that exists.

**Apply.** Non-destructive; the shadowed-override dialog from
[§8.6](#86-when-we-have-what-they-do-not-q8-and-apply-semantics-q13) if relevant; otherwise a single
confirmation. Undo remains available at every scope, per the existing convention that "every edit is
reversible at the scope the mistake happened at".

**What this lane never shows:** token names, aliases, tiers, contrast ratios, hex values, mode
matrices, or the word "token". **[R, High]**

**What it does show, always:** a readability badge per Look — **"Readable ✓"** — because trust is the
product here, and because if the badge is on every card it disappears into furniture rather than
alarming anyone. If a Look is light-only or has a caveat, the card says so on its face.

### 10.3 Lane B — the designer/developer

A new **Look** tab in the existing editor:

- **What this Look sets** — the 28 roles with their values, source, and `confidence` class; derived
  values shown with their derivation expression, not just the output.
- **Diff against baseline** — reuses "Review changes", which already lists every edit with its
  original value and a way back.
- **Audit for this Look** — the existing Audit tab, filtered to the `look` context. 27 pairs × 2
  modes, with the pass/fail and the exact ratio.
- **Unmapped** (V2) — what an import discarded, with counts.
- **Author a Look** (V1.5) — take the current draft, name it, run the gate, export it.

Advanced users get everything (question 15): every value, every alias, every mode, every derivation,
the mapping table, the unmapped list, the audit, export, and the ability to override any of it.

### 10.4 Warnings and confirmation copy

**[R, Medium — this is exactly the copy to user-test]**

| Situation | Copy |
|---|---|
| Shadowed overrides | "3 of your earlier changes will keep overriding this Look." + the list |
| Look is light-only | "This Look is designed for light mode. In dark mode the app will use Standard." |
| User edit breaks contrast | "This colour is hard to read on the background it's used with. **[Use a readable shade]**" — offer the fix, do not just refuse |
| Import is lossy (V2) | "Carbon defines 200 values. 58 have an equivalent here; the rest don't apply. **[See the details]**" |
| Look version updated | "**Field** has been updated. Your changes are kept. **[See what changed]**" |

The pattern throughout: name the consequence, never the mechanism; always offer the fix alongside the
warning.

---

## 11 · Technical architecture

### 11.1 Where it sits

```
 tokens/looks/*.look.json ──┐
   (registry, versioned,    │
    each gate-passing)      │
                            ▼
 user picks a Look ──▶ ┌──────────────────┐
                       │ look loader      │  validate manifest, licence, schema version
                       └────────┬─────────┘
                                ▼
                       ┌──────────────────┐
 (V2) foreign file ──▶ │ adapter          │  normalize → map → fill      ── V2 ONLY
                       │  (per system)    │  emits confidence per token
                       └────────┬─────────┘
                                ▼
                       ┌──────────────────┐
                       │ resolveTokens()  │  ◀── UNCHANGED. One resolver, now four modifiers
                       │  src/lib/token-  │      look → mode → scheme → font
                       │  resolve.js      │
                       └────────┬─────────┘
                                ├──────────────▶ checkContracts()  ── the SAME gate as CI
                                │                 27 pairs × modes
                                ▼
                       ┌──────────────────┐
                       │ themeBundle()    │──▶ getTheme() ──▶ live preview (0.164 ms)
                       └──────────────────┘
                                │
                       [Apply] ─┴─▶ themeState.look = id   (a layer, never a write)
```

**[R, High] The resolver does not change.** A Look is a modifier context; the existing pure function
resolves it. That is what keeps preview identical to build output, which is the property the whole
engine is built around.

### 11.2 Data flow, stage by stage

| Stage | Input | Output | Can fail with |
|---|---|---|---|
| 1 · Select | Look id | — | — |
| 2 · Load | id | Look document + manifest | Unknown id; schema version too new; licence not accepted |
| 3 · Normalise | Look document | DTCG-valid tokens, our colour space | Invalid colour space; unknown `$type`; cycle |
| 4 · Map (V2 only) | DTCG tokens | 28 roles + confidence per role | Ambiguous mapping; no anchor for a required role |
| 5 · Compatibility | assignments | Missing/extra report | Required role unfillable even by derivation → **hard stop** |
| 6 · Accessibility | resolved bundle × modes | Contract report | Any new defect → reject (author time) / warn (import) |
| 7 · Preview | bundle | Live app + shadow report | — |
| 8 · Confirm | user | Decision on shadowed overrides | — |
| 9 · Apply | id | `themeState.look` set, undo entry pushed | Persistence quota (degrade: session-only, tell the user) |

Stages 3–6 are pure and run in a worker if they get slow. **[R, Medium]** Stage 6 is the one that must
never be skippable — the brief's constraint that accessibility is not a final validation step is
satisfied by it running *before* preview, so the user never sees, and never falls in love with, a
Look that cannot ship.

### 11.3 The Look file format

```jsonc
{
  "$schema": "https://genus.local/schemas/look-1.json",
  "id": "field",
  "version": "1.2.0",
  "label": "Field",
  "blurb": "Higher contrast and larger text — built for outdoor use.",
  "character": { "contrast": "high", "shape": "sharp", "depth": "flat", "density": "relaxed" },
  "provenance": {
    "source": "generated",
    "generator": { "engine": "oklch-ramp", "version": "2.0.0",
                   "inputs": { "brand": "#0467b2", "neutralChroma": 0.004, "contrastTarget": "AAA" } },
    "seededFrom": null,
    "licence": null,
    "attribution": null,
    "authoredOn": "2026-08-24"
  },
  "requires": { "schema": ">=1.0.0 <2.0.0", "categories": ["color", "type", "space", "radius", "shadow"] },
  "audit": { "gate": "wcag-2.2-aa", "scoredPairs": 27, "modes": 2, "defects": 0, "runOn": "2026-08-24" },
  "sets": {
    "primitives": { "neutral": { /* 11 steps */ }, "brand": { /* 7 steps */ } },
    "semantic":   { "surface/canvas": { "light": "{neutral.50}",  "dark": "{neutral.950}" } },
    "type":       { "styles": { "body/m": { "size": 15, "weight": 400, "lineHeight": 22 } } },
    "space":      { "3": 14 },
    "radius":     { "control": 2, "surface": 4 },
    "shadow":     { "raised": [{ "offsetY": 1, "blur": 2, "color": "{neutral.900}", "alpha": 0.08 }] }
  }
}
```

**[R, High]** Three properties worth defending:

- **`audit` is part of the file.** A Look that has not been scored cannot claim it has been. The
  build re-scores anyway; the field is for the UI badge and for review.
- **`provenance.seededFrom` + `licence` + `attribution`** exist so a Look derived from a
  permissively-licensed palette carries its obligations with it, mechanically. If `licence` is
  non-null, the UI shows the attribution. See [§11.7](#117-versioning-provenance-and-licensing).
- **`character`** is machine-readable, so the gallery can sort and filter ("show me high-contrast
  ones") without parsing prose.

### 11.4 Apply, rollback, persistence

**[R, High]** Reuse everything:

- Apply = set one modifier. Rollback = unset it. Both are one reducer action.
- The existing 50-entry undo history covers it; applying a Look pushes one entry, not 28.
- Persistence follows §5.1's answer: `localStorage` if internal, per-tenant server state if
  tenant-facing. **This is the only part of the architecture that §5.1 actually changes.**
- **Escape hatch:** a `?look=none` URL parameter, and Standard always present and never removable. A
  branding feature that can render the platform unusable with no way back is an operational incident
  waiting for a Friday.

### 11.5 Preset registry

**[R, Medium]** V1: a static directory, `src/tokens/looks/*.look.json`, imported at build time and
validated by `npm run tokens` alongside everything else. No server, no remote fetch, no dynamic
loading. The shadcn registry model is the right target *eventually*, but a static array is the correct
V1 and converts to a fetched registry without changing the file format.

V1.5 adds user-authored Looks (the current draft, named and gated). V2 adds import.

### 11.6 Import and export

**[R, High]**
- **Export a Look**: already 90% built — the editor exports a draft; add the manifest wrapper and the
  audit result.
- **Export DTCG**: the standard interchange, unblocked by [§7.3](#73-delta-2--dtcg-valid-colour-values).
  This is what makes us a good citizen and what a designer will actually ask for.
- **Import**: V2 only, designer lane only, always via an adapter, always with a report.

### 11.7 Versioning, provenance and licensing

**[R, High]** Adopt Atlassian's lifecycle wholesale — it is the best-documented in the review:
**deprecate in a minor → soft-delete (functional, raises errors) in the following minor → delete in
the next major**, with lint-level enforcement. Adopt Spectrum's rename rule too: **a renamed token
stays as an alias to its new name**, so nothing breaks at the moment of rename.

For Looks specifically:

| Concern | Rule |
|---|---|
| Look version | Semver. A patch may not change any resolved value; a minor may add categories; a major may change values |
| Updating an applied Look | User overrides survive; changed non-overridden values apply; the user is told what changed |
| Schema compatibility | `requires.schema` is checked at load. A Look from the future is refused with a clear message, never partially applied |
| Provenance | Every token carries `com.genus.look = { id, version }` and a `confidence` class |
| **Licensing** | **A Look whose `provenance.licence` is non-null must display its attribution in the UI.** Machine-enforced, so no one has to remember |
| **Trademarks** | **No Look is named after another company's design system.** Apache-2.0 §6 and its equivalents grant copyright and patent rights, not trademark rights |
| **Excluded outright** | **Shopify Polaris** — its licence restricts use to applications interoperating with Shopify. **Salesforce icons/images** — CC BY-ND, no derivatives |

**[A]** Before any V2 import ships, get a one-page legal read on: (a) seeding a generated palette from
a permissively-licensed one, (b) whether attribution in an admin screen satisfies MIT/Apache notice
requirements, (c) naming a Look after a colour scale (`slate`) versus after a system (`Radix`). I can
identify the questions; I cannot answer them.

### 11.8 Errors and fallbacks

**[R, High]** The house rule from `token-resolve.js` — *"never a throw and never a plausible
substitute"* — extends unchanged: a broken Look renders as Standard plus a named problem, never as a
silent approximation.

| Failure | Behaviour |
|---|---|
| Look file missing/corrupt | Fall back to Standard; banner naming the Look; app fully usable |
| One role unresolvable | That role falls back to Standard; the Look tab shows exactly which and why |
| Look fails audit at runtime | Refuse to apply. This should be impossible — the build gate ran — so it is also a bug report |
| Persistence unavailable | Apply for the session; tell the user it will not survive a reload |
| Look version newer than schema | Refuse, name the version, offer Standard |

---

## 12 · Roadmap

### V1 / MVP — "Looks that we generate"

| | |
|---|---|
| **Features** | OKLCH ramp engine · `look` modifier axis · `shadow` + expanded `radius` categories · 6–8 house Looks incl. **High contrast** · gallery with real-screen previews · live preview + apply/rollback · shadowed-override dialog · per-Look audit in CI at zero defects · Look tab in the editor |
| **Complexity** | **Medium.** The resolver, override layer, live preview, undo, export and contrast gate all exist. The new code is the ramp engine, the modifier axis, two token categories and one page |
| **User value** | **High.** Complete for the primary user. Nothing here is a stepping stone to something else |
| **Dependencies** | §5.1 answered · OKLCH sign-off (§5.3) · fill/indicator split (§5.6) · a colour library (`culori` tree-shakeable, or `@texel/color` if gamut-mapping speed matters) |
| **Risks** | Looks look too similar (mitigate with shape+depth+density, not just colour) · OKLCH shifts existing scheme colours · zero-defect admission proves harder than expected across hues |

### V1.5 — "Looks that users make"

| | |
|---|---|
| **Features** | Save current draft as a Look · brand-colour seeding ("paste your hex, get a full Look") · export/import our own Look files · DTCG-valid export · light-only Look handling |
| **Complexity** | **Low-medium.** Mostly packaging over V1 |
| **User value** | **High for brand owners** — "our blue" is the one input this user reliably has |
| **Dependencies** | V1 · [§7.3](#73-delta-2--dtcg-valid-colour-values) |
| **Risks** | User-made Looks fail the gate → the tool must *fix* rather than *refuse* (offer the nearest passing shade) |

### V2 — "Looks from elsewhere"

| | |
|---|---|
| **Features** | Adapter framework · **Radix adapter first** · import report with the four confidence classes · unmapped preservation · one or two more adapters chosen by demand |
| **Complexity** | **High.** Per-system judgement, no shared leverage ([F2](#11-six-findings-that-decide-the-shape-of-this-feature)) |
| **User value** | **Medium, and concentrated in the designer lane.** Not the population with the problem |
| **Dependencies** | V1.5 · legal read · adapter contract |
| **Risks** | Lossy projection disappoints ("this doesn't look like Carbon") · maintenance drift as upstreams version · scope creep toward "support everything" |

### Future

Per-tenant branding at scale · remote Look registry · image-to-Look (tweakcn does this) · density and
motion axes · Figma round-trip (currently refused by §5.7) · APCA promotion if WCAG 3 stabilises.

### What NOT to build initially

**[R, High]**

1. **Any third-party design-system import.** All the risk, little of the value, and it teaches V1 the
   wrong architecture.
2. **A generic mapping UI** ("drag their token onto ours"). Nobody will use it, and it makes a
   judgement call into a chore.
3. **A remote registry / marketplace.** A static array is indistinguishable to the user at 8 Looks.
4. **More than ~8 Looks.** Choice paralysis, and every Look is a permanent audit obligation across
   modes and schemes.
5. **Per-component preset overrides.** Tier 3 must follow tier 2 or the whole model leaks.
6. **Figma write-back.** Unchanged from §5.7.
7. **APCA as the gate.** Not normative; not the legal bar.

---

## 13 · Risks and edge cases

| # | Risk | Type | Sev | Mitigation |
|---|---|---|---|---|
| R1 | Presets multiply the audit surface; the 113-defect baseline becomes combinatorial | Technical | **High** | Zero-defect admission for new Looks; baseline stays legacy-only; ratchet per axis |
| R2 | HSL ramps mean hue-dependent contrast failures across a varied library | A11y | **High** | OKLCH first ([§9.1](#91-move-generateramp-to-oklch-first)). This is R1's root cause |
| R3 | Trademark/licence exposure from named third-party presets | Legal | **High** | House-authored Looks only; `licence`/`attribution` machine-enforced; Polaris and SLDS assets excluded |
| R4 | Looks are visually too similar; the feature reads as pointless | Product | **Medium** | Vary shape, depth, density and type — not just hue. Requires [§7.4](#74-delta-3--new-categories) |
| R5 | Lossy import disappoints expectations set by a brand name | UX | **Medium** | Never use brand names in the operator lane; lead with the count in the designer lane |
| R6 | Applying a Look silently fights a user's earlier edits | UX | **Medium** | Shadowed-override dialog; never resolve silently |
| R7 | Tier-3 slots that skip tier 2 do not follow a Look and look broken | Technical | **Medium** | Enforce the tier lint before V1; audit all 292 slots once |
| R8 | Status colours restyled by a Look → safety-critical misread | A11y / safety | **High** | Status ramps are outside a Look's permission without signed approval ([§9.3](#93-contracts-extend-they-do-not-fork)) |
| R9 | Look maintenance debt: *N* Looks × 2 modes × 9 schemes forever | Maintenance | **Medium** | Cap at ~8; generate rather than hand-author; CI scores all combinations |
| R10 | §5.1 answered late; persistence and permissions get rebuilt | Process | **Medium** | Answer before any V1 code |
| R11 | A Look renders the platform unusable with no way back | Operational | **Medium** | `?look=none`; Standard permanent; session-scoped preview |
| R12 | Colour library bundle weight | Technical | **Low** | Tree-shakeable `culori`; only the OKLCH path is needed |
| R13 | Font Looks fail on managed desktops without the webfont | Technical | **Low** | Existing font stacks already carry fallbacks |
| R14 | `color-mix()` support on the target desktop matrix | Technical | **Low** | Already tracked as §5.2; channel-token fallback exists |

### Edge cases worth naming explicitly

- **A Look with no dark mode.** Derive, audit, and if it fails, ship it light-only and say so on the
  card.
- **A user override that was correct under the old Look and wrong under the new one.** The shadow
  dialog catches it; the audit catches it if they keep it.
- **Two users, one tenant, different Looks.** Is a Look per-user or per-tenant? **[A — a real product
  question, not a technical one.]**
- **Print and export.** Reports and PDFs may need a fixed Look regardless of the user's choice. **[A]**
- **The high-contrast Look versus OS-level forced colours.** Two mechanisms competing. **[A]**

---

## 14 · User validation plan

### 14.1 The five things to learn

1. Does a non-expert actually pick a Look and stop, or immediately want to tweak? *(Decides whether
   the fine-tuning door is prominent or buried.)*
2. What vocabulary do they use unprompted — "look", "theme", "style", "branding"? *(Decides
   [§6.3](#63-terminology-map).)*
3. Do they trust the readability badge, ignore it, or find it alarming?
4. Is "our brand blue" the input they have, or do they have a full brand guideline? *(Decides whether
   V1.5's seeding is the real V1.)*
5. Would a designer rather import Carbon, or author a Look from our editor? *(Decides whether V2
   exists at all.)*

### 14.2 The experiment — before building anything

**[R, High]** A one-week, no-engine prototype:

- Take the app as it stands. Hand-author **four** Looks as static override JSON — Standard, a
  soft/low-contrast one, a high-contrast/Field one, and one with a clearly different shape and type.
  The editor's export already produces these; no new code is required.
- Wire a hidden `?look=` parameter that loads one. Half a day.
- Put six people in front of it — three operators/brand owners, three designers or developers. Ask
  them to make the app "look right for our team", then to make one specific change ("make the
  headings bigger").
- Measure: which Look they pick and how fast; whether they tweak afterwards; the words they use; and
  whether anyone notices or mentions readability unprompted.

**Kill criterion:** if operators pick a Look in under 30 seconds and never open the editor, V1 as
scoped is right. If they immediately want to change a specific colour, the feature is really
"guided brand setup" and the gallery is the wrong shape — build seeding (V1.5) first instead.

That distinction is worth a week, because it reverses the roadmap.

### 14.3 Open questions to validate

| # | Question | Blocks |
|---|---|---|
| Q1 | **Internal tool or tenant-facing branding (§5.1)?** | Everything — persistence, permissions, editable set |
| Q2 | Per-user or per-tenant Look? | Data model |
| Q3 | Is OKLCH sign-off obtainable (§5.3)? | The entire accessibility guarantee |
| Q4 | How many Looks before choice becomes noise? | Library size |
| Q5 | Do designers want import, or authoring? | Whether V2 is built |
| Q6 | Fixed Look for reports/exports? | Reports module |
| Q7 | Does legal permit seeding from MIT/Apache palettes with attribution? | V2 adapters |

---

## 15 · Final recommendation

### 15.1 Direction

**Build a generator, package it as Looks, and defer import.** **[R, High]**

The problem in the brief is real and the proposed solution is one step past the thing that actually
solves it. Non-experts need *fewer, safer, complete choices* — they do not need other people's design
systems, and cannot evaluate them. Every commercial precedent in
[§3.4](#34-product-precedents-for-pick-a-look) ships first-party presets over a first-party generator.
We already own three of the four pieces: the canonical schema, the shared resolver, and the enforced
contrast gate. The missing piece is a colour engine whose guarantee survives an arbitrary hue.

### 15.2 Recommended first Looks

**[R, Medium — the count is confident, the specific characters need §14's evidence]**

Six at launch. Not one is named after another company's design system.

| Look | Character | Why it earns a slot |
|---|---|---|
| **Standard** | Today's tokens, unchanged | The permanent baseline and the escape hatch |
| **Field** | High contrast, larger type, flat, sharp | Outdoor/glare use in a rooftop-solar programme. The most defensible item in the library **[V-adjacent: Primer and Fluent both ship high-contrast themes]** |
| **Calm** | Low chroma, soft radius, subtle depth, relaxed density | The common "make it less shouty" request |
| **Compact** | Standard colour, condensed rows, tighter spacing, smaller type | Density is a real operator need in table-heavy screens; `rowCondensed: 40` already exists in `layout` |
| **Contrast Dark** | Dark-first, high contrast | Control-room and night use |
| **Slate** | Neutral-forward, near-monochrome, brand only at accents | The most "professional-utility" register; seeded from an MIT-licensed neutral scale with attribution |

**[R]** Two of these — Compact and Contrast Dark — deliberately differ on axes *other than hue*, to
test R4 (Looks reading as too similar) at launch rather than after.

### 15.3 Recommended canonical architecture

Unchanged from what exists, plus four deltas: **the `look` modifier axis; DTCG-valid colour values;
`shadow` + expanded `radius`/`border-width`; and three metadata fields (`look`, `confidence`,
`unmapped`)**. `resolveTokens()` itself does not change. **[R, High]**

### 15.4 Recommended V1 scope

Everything in [§12's V1](#v1--mvp--looks-that-we-generate) and nothing else. Explicitly excluded:
import, adapters, registry, marketplace, per-component overrides, APCA gating.

### 15.5 Key technical decisions

| # | Decision | Confidence |
|---|---|---|
| D1 | **OKLCH before Looks.** The guarantee lives in the lightness curve | **Very High** |
| D2 | **A Look is a resolver modifier, not a write.** Apply is layering; rollback is unsetting | **High** |
| D3 | **One contract file, more contexts. New Looks admit at zero defects** | **High** |
| D4 | **Tier 3 follows tier 2, always.** Presets never carry component tokens | **High** |
| D5 | **House-authored Looks only in V1.** No third-party names, no third-party assets | **High** (product) / **High** (legal exposure), pending the legal read |
| D6 | **Radix is the first adapter, in V2** — the only major system whose semantics decode mechanically | **Medium-High** |
| D7 | **WCAG 2.2 gates; APCA advises** | **High** |
| D8 | **A separate `/admin/appearance` route**, not an eighth editor tab | **Medium-High** |
| D9 | **Static Look directory in V1**, remote registry deferred | **Medium** |
| D10 | **Add `shadow` and expand `radius`** before authoring the library | **High** |

### 15.6 Biggest risks, ranked

1. **R2 → R1.** HSL ramps make contrast hue-dependent; a varied library multiplies a defect list we
   already have. Fix the space first.
2. **R3.** Licensing and trademarks. Cheap to avoid now, expensive to unwind after launch.
3. **R8.** A Look restyling status colour in a utility platform is a safety issue, not a taste issue.
4. **R4.** If the Looks are not visibly different, the feature reads as decoration and dies.
5. **R10.** §5.1 unanswered means persistence and permissions get built twice.

### 15.7 The one-sentence version

> We do not need to import design systems; we need to *be* one — and we are two changes away
> (a perceptually uniform ramp and a preset axis) from being able to hand a non-expert eight complete,
> provably readable appearances and let them pick one.

---

## Appendix A · The twenty questions, answered

**1 · Best product model?** **"Looks"** — named, complete, versioned appearance presets, in a
three-layer product (Look → Accent colour → fine-tuning). Not "themes" (collides with `getTheme()`,
MUI, and light/dark), not "design systems" (unevaluable by the target user, legally awkward), not
"token packs" (developer framing). **[R, High on the model, Medium on the word]**

**2 · Which design systems first?** **None in V1.** In V2: **Radix Colors** first — MIT, positional
semantics that decode mechanically, published contrast guarantees, alpha variants that map onto our
`{mix:}` machinery. Then **USWDS** for its method (grades) more than its tokens, and **Primer** for its
high-contrast and colour-vision themes. **Never Polaris** (licence). **[V on the constraints, R on the
order, High]**

**3 · Typical modern architecture?** Three tiers — primitive → semantic → component — with modes as a
resolver axis, aliases by reference, and DTCG 2025.10 as the interchange format. Universal across all
ten systems reviewed. **[V, High]**

**4 · Categories in V1 vs later?** **V1:** colour (primitives + 28 roles), type, spacing, radius,
**shadow (new)**, border width. **V1.5:** motion, density. **V2:** gradients, per-platform scales.
Shadow is V1 because without it Looks cannot differ in depth. **[R, High]**

**5 · Primitive / semantic / component relationship?** One node shape; the tier is metadata plus an
invariant on `$value` — primitive holds a raw value, semantic holds an alias or a derivation, component
holds an alias to a semantic. Each violation is a distinct lint. Already specified in the architecture
doc §2.2; this feature makes tier-3 enforcement mandatory rather than aspirational. **[V, High]**

**6 · Mapping across naming conventions?** Split systems into **scale-positional** (Radix, USWDS,
Tailwind) and **role-named** (Carbon, Material, Atlassian, Spectrum, Fluent, Polaris, Primer).
Positional systems *decode* — one function plus a documented lookup, correct for every scale.
Role-named systems must be *negotiated* per token, per system. Then classify each token as exact /
decoded / derived / unmappable and surface the class. **[V on the split, R on the method, High]**

**7 · They have tokens we don't?** Preserve into `com.genus.unmapped`, count and report, never
discard, never invent a role to hold it. A repeatedly-orphaned category is a signal to extend our
schema deliberately — as `shadow` is today. **[R, High]**

**8 · We have tokens they don't?** Fill in order: their value → our derivation engine
(`best-contrast` / `mix` / `adjust`) → our current value **flagged as `defaulted`** → reject the Look.
This is why the derivation engine is load-bearing rather than a fix for one bug. **[R, High]**

**9 · Conflicts and incomplete mappings?** Adapter declares precedence explicitly (ambiguity is an
adapter bug). Contrast failures are rejected at author time and repaired-with-flag at import time.
Missing dark mode is derived and re-audited, or the Look ships light-only and says so. Cycles and
invalid documents are refused with line-level reasons, never repaired. Full table in
[§8.7](#87-conflicts-and-incomplete-mappings-q9). **[R, High]**

**10 · Generate colours while preserving contrast?** Fix lightness targets in a perceptually uniform
space so step distance implies contrast — the shared move behind Material's Δtone 40 ⇒ 3:1 / 50 ⇒ 4.5:1,
USWDS's Δgrade 40/50/70, Radix's Lc 60/90, and Leonardo's ratio-first generation. We have the fixed
targets in `RAMP_LIGHTNESS`; we need OKLCH instead of HSL. Then keep `best-contrast` derivation for
every foreground-on-brand role. **[V on the evidence, R on the application, Very High]**

**11 · Light/dark and other modes?** As DTCG Resolver modifiers, not as file variants — the spec's own
rationale is the combinatorial explosion, and we have 126 combinations already. Order:
`look → mode → scheme → font`, so mode and scheme still get the last word. **[V on the mechanism, R on
the order, High]**

**12 · Preview before applying?** Already largely solved: the token store resolves a sparse override
layer through the same function the build uses, so preview *is* the output. Add gallery cards showing
a **real Genus screen** (not swatches), plus a full-app try-mode with a persistent
Apply/Discard bar. **[V on the machinery, R on the UI, High]**

**13 · Overwrite, merge, or new theme?** **None of the three — layer.** Applying sets
`themeState.look`; nothing is destroyed; user overrides stay on top and keep winning. The only real
interaction is *shadowing*, which gets an explicit dialog naming the affected changes in plain
language. **[R, High]**

**14 · Understandable to someone who knows nothing about tokens?** Never show a token at layer 1. Show
6–8 named Looks previewed on real screens, with a plain-language line and a readability badge. Let
them try the whole app before committing. Keep the fine-tuning door clearly labelled and one-way by
default. Full terminology map in [§6.3](#63-terminology-map). **[R, High]**

**15 · What should advanced users customise?** Everything they can today, plus: every value a Look
sets with its `confidence` class, the derivation expressions, the per-Look audit across modes, the
mapping table and unmapped list (V2), authoring and exporting Looks (V1.5), and DTCG export. **[R, High]**

**16 · Architecture for many systems without per-system integration?** Partly achievable, and honesty
matters here: a four-function adapter contract (`normalize` / `map` / `fill` / `audit`) over an
unchanged canonical resolver makes everything *except* `map()` shared. `map()` is genuinely per-system
and cannot be generalised, because DTCG standardises syntax and not semantics
([F2](#11-six-findings-that-decide-the-shape-of-this-feature)). Positional systems keep `map()` to a
lookup table; role-named ones do not. **[R, High]**

**17 · Canonical internal schema?** Yes — and it already exists. `figma-tokens.json` +
`resolveTokens()`, shared by emitter, gate and editor. Four deltas needed
([§15.3](#153-recommended-canonical-architecture)), no redesign. **[V, High]**

**18 · Token metadata?** `tier`, `provenance`, `pairings`, `locked`, `$description`, `$deprecated`
(all present or specified), plus three new: **`look` ({id, version})**, **`confidence`** (exact /
decoded / derived / defaulted), **`unmapped`**. Per-Look: manifest with version, character, provenance,
generator inputs, licence, attribution, `requires`, and the audit result.
[§7.5](#75-delta-4--token-metadata-question-18). **[R, High]**

**19 · Versioning, provenance, licensing, updates?** Semver per Look with value-stability rules by
level. Token lifecycle borrowed from Atlassian (deprecate → soft-delete → delete, lint-enforced) and
Spectrum (renamed tokens remain aliases). Provenance per token. Licence and attribution in the
manifest, **enforced by the UI when non-null**. No Look named after a third-party system —
permissive licences grant copyright and patent rights, not trademark rights. Polaris and Salesforce
image assets excluded outright. **[V on the licences and lifecycles, R on the policy, High]**

**20 · Biggest risks?** Ranked in [§15.6](#156-biggest-risks-ranked): hue-dependent contrast from HSL
ramps multiplying an existing 113-defect baseline; licensing and trademarks; a Look restyling
safety-critical status colour; Looks that are not visibly different enough to justify the feature; and
§5.1 being answered after the architecture is built. **[R, High]**

---

## Appendix B · Sources

**Standards**
- [Design Tokens Technical Reports 2025.10](https://www.designtokens.org/tr/2025.10/) — stable, published 28 October 2025; Format, Colour, Resolver modules
- [Design Tokens Format Module](https://www.designtokens.org/tr/drafts/format/) — types, aliases, `$extensions`, group inheritance, file conventions
- [Design Tokens Color Module](https://www.designtokens.org/tr/drafts/color/) — `colorSpace`/`components` required, 14 spaces, `none` keyword
- [Design Tokens Resolver Module](https://www.designtokens.org/tr/drafts/resolver/) — sets, modifiers, `resolutionOrder`, reference restrictions
- [DTCG: specification reaches first stable version](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [WCAG3 Contrast as of April 2026 — Adrian Roselli](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html) — APCA remains exploratory; WCAG 3 not normative
- [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)

**Design systems**
- [Material Design 3 — Design tokens](https://m3.material.io/foundations/design-tokens/overview) · [material-color-utilities: dynamic colour schemes](https://github.com/material-foundation/material-color-utilities/blob/main/concepts/dynamic_color_scheme.md) — tonal palettes, Δtone contrast guarantees
- [Radix Colors — understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) · [custom palette generator](https://www.radix-ui.com/colors/custom) · [radix-ui/colors (MIT)](https://github.com/radix-ui/colors)
- [Carbon — colour tokens](https://carbondesignsystem.com/elements/color/tokens/) · [Carbon — themes](https://carbondesignsystem.com/elements/themes/overview/) · [@carbon/themes (Apache-2.0)](https://github.com/carbon-design-system/carbon/tree/main/packages/themes)
- [Atlassian — colour foundations](https://atlassian.design/foundations/color) · [@atlaskit/tokens changelog](https://atlaskit.atlassian.com/packages/design-system/tokens/changelog) — deprecation lifecycle
- [Adobe spectrum-design-data](https://github.com/adobe/spectrum-design-data) — schema validation, rename-as-alias policy
- [Tailwind CSS v4 — theme variables](https://tailwindcss.com/docs/theme) — `@theme`, namespaces, OKLCH default palette
- [GitHub primer/primitives (MIT)](https://github.com/primer/primitives) — base/functional tiers, 8 themes, Style Dictionary build
- [USWDS — design tokens](https://designsystem.digital.gov/design-tokens/) · [colour overview](https://designsystem.digital.gov/design-tokens/color/overview/) — grades and the magic number
- [Shopify polaris-tokens](https://github.com/Shopify/polaris/tree/main/polaris-tokens) — **modified MIT restricting use to Shopify-interoperating applications**
- [Fluent 2 — design tokens](https://fluent2.microsoft.design/design-tokens) — global vs alias, light/dark/high-contrast
- [salesforce-ux/design-system](https://github.com/salesforce-ux/design-system) — BSD-3 code, CC BY-ND icons/images · [SLDS styling hooks](https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-custom-properties.html)
- [Open Props (MIT)](https://github.com/argyleink/open-props)

**Tooling and generation**
- [Style Dictionary](https://styledictionary.com/) · [DTCG utilities](https://styledictionary.com/reference/utils/dtcg/) · [v5 migration notes](https://help.zeroheight.com/hc/en-us/articles/48049028236187-Migrating-to-Style-Dictionary-v5-in-tokens-automation)
- [Tokens Studio — themes](https://docs.tokens.studio/manage-themes/themes-overview) · [sd-transforms](https://github.com/tokens-studio/sd-transforms)
- [Figma — modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) · [plans and features](https://help.figma.com/hc/en-us/articles/360040328273-Figma-plans-and-features) — mode limits per plan
- [Adobe Leonardo](https://github.com/adobe/leonardo) — contrast-first colour generation
- [culori](https://culorijs.org/) · [Color.js gamut mapping](https://colorjs.io/docs/gamut-mapping)

**Product precedents**
- [daisyUI themes](https://daisyui.com/docs/themes/) — 35 named themes, `data-theme`
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) · [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json) · [CLI v4 / presets](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- [tweakcn](https://tweakcn.com/) — visual theme editor with presets

**Licensing background**
- [Apache License 2.0 §6 — trademarks](https://www.apache.org/licenses/LICENSE-2.0) · [ASF trademark policy](https://www.apache.org/foundation/marks/)

**This repository**
- [docs/token-engine-architecture.md](token-engine-architecture.md) — §0.5 contrast audit, §2.1 DTCG alignment, §2.2 data models, §2.4 accessibility engine, §5 open decisions
- [AGENTS.md](../AGENTS.md) §1 — tokens are generated, never written
- [src/lib/token-resolve.js](../src/lib/token-resolve.js) · [src/lib/ramp.js](../src/lib/ramp.js) · [src/lib/token-store.jsx](../src/lib/token-store.jsx) · [src/tokens/contracts.json](../src/tokens/contracts.json) · [src/tokens/baseline.js](../src/tokens/baseline.js) · [scripts/figma-tokens.json](../scripts/figma-tokens.json)
