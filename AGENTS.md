# Genus Solar — conventions

**Read this before changing anything.** The rules below are the ones that have already been
paid for — each exists because something broke, or because two ways of doing a thing would make
the app look machine-assembled.

| | |
|---|---|
| Stack | React 19 · MUI v9 · TanStack Table v8 · ECharts 6 · Vite 8 |
| Product | SBPDCL rooftop-solar rollout programme — see [docs/dashboard-ia.md](docs/dashboard-ia.md) |
| Run | `npm run dev` (port 5173) · `npm run build` · `npm run tokens` |
| Gallery | `/gallery` — every component in every state. There is no test suite; this is the substitute. |

---

## 1 · Tokens are generated, never written

```
Figma  ──►  scripts/figma-tokens.json  ──►  npm run tokens  ──►  src/tokens.css
                                                             └►  src/lib/tokens.js
```

`src/tokens.css` and `src/lib/tokens.js` carry a DO-NOT-EDIT banner and mean it. A wrong value is
wrong in Figma or in the extraction — fix it there and regenerate.

The generator fails loudly rather than emitting something plausible. It asserts 28 semantic tokens,
valid hex on every one, and that **every semantic token differs between light and dark** — a token
that resolves identically in both modes is not semantic and is almost always a bad extraction.
`text/on-brand` is the single allowed exception.

**Never hard-code a colour, size, radius or duration.** Use `theme.palette.*` in an `sx` callback,
`alpha(t.palette.X, n)` for tints, and `font["title/m"]` from tokens for type. If you need a value
that is not in the theme, the answer is a token, not a hex.

### The type ramp

Inter, **10/12/14/16/18/20/28/32/56** at weights **400/500/600/700**. That is the Figma ramp and it
is the authority here.

> Sizes **24 and 40 do not exist in this system.** They exist in the older Genus WFM ramp, and
> mixing the two is the single most common source of "this looks AI-designed". A heading that wants
> 24 uses 20 or 28.

### Colour notes

- Brand primary `blue-500 #0467b2`, accent `orange-500 #ee7304`.
- **The blue ramp is not monotonic.** `blue-600 #2a7fc1` is *lighter* than `blue-500 #0467b2`,
  because 500 is the brand colour dropped into an otherwise-interpolated ramp. Consequently
  `action/primary/hover` is lighter than rest while `pressed` is darker. That is what Figma
  specifies; it is reproduced faithfully rather than silently corrected.
- **`info` is never used for status.** Fluent's info blue `#0078d4` sits a few degrees from the
  brand primary, so a blue chip in this product reads as *link*, not *state*. Info is for advisory
  banners only.

---

## 2 · The band system

`src/lib/bands.js` is a registry, not a set of conditionals. Add a metric by adding an entry.

Five states, **four of them rendered**:

| Band | Rendering |
|---|---|
| `normal` | **No colour.** Plain text, tabular numerals |
| `watch` | Dot + word, no fill |
| `warning` | Filled chip, `status-warning-*` |
| `critical` | Filled chip, `status-danger-*` |
| `unknown` | De-emphasised to `text/tertiary`, plus the reason |

> **Why `normal` gets no colour.** Emphasis is zero-sum. A 20-column grid where every cell is
> tinted is uniformly loud, and the one cell that matters disappears. Colouring only the exceptions
> is what lets an engineer's eye land on the problem without reading a number. Green is reserved
> for a question the reader actually asked — an explicit *Healthy* chip at object level — never for
> an in-range measurement.

Two hard rules:

- **A metric whose `requires` are unmet returns `unknown`, never `normal`.** A pack voltage cannot
  be judged before chemistry and series count are known, and a confident-looking green on an
  unjudgeable value is worse than an honest dash.
- **Stale and offline readings get no band.** A four-hour-old value painted green is a lie about
  the present. Use `bandWithFreshness()`, not `bandFor()`, wherever a timestamp exists.

Colour is never the only signal — every band carries a word or an icon.

---

## 3 · Layout

| The screen is… | Use |
|---|---|
| A dashboard read for a judgement | `TileDeck` + one category pane |
| A page with a title and context | `WsPage` + `WsContext` |
| A queue you work down | `WsTable` full width + `FilterBar` |
| Records you browse then edit one of | `WsTable` + `FormDialog` |
| A long configuration surface | `SettingSection` |

> **The one rule above all others.** Tables get the full content width. A table never sits beside a
> chart — a 40-character consumer name has nowhere to go in half a page. Charts may go two-up
> (`WsSplit`); tables never do.

- **`minWidth: 0` / `minHeight: 0` on flex and grid children.** Without it the child keeps its
  automatic content minimum and the *container* grows instead of the child shrinking. This is the
  most common layout bug in this family of apps.
- **The page scrolls.** Nested scroll containers need a reason — a rail's own list, a table's
  viewport, the full-screen overlay.
- **One `<h1>` per page**, owned by `WsPage`. Panel titles are `<h2>` inside `PanelHeader`.
- **No page-level table controls.** Density, export and column visibility live in the table's own
  toolbar. The page header is title and context only.
- **Context is picked once**, in the sidebar hierarchy picker, and inherited via `useHierarchy()`.
  Never a per-page picker.

> **The rail's width reservation must key off the same query as `permanent`.** `WsShell` uses
> `useMediaQuery("(min-width: 1180px)")` to decide permanent-vs-temporary. Reserving the space with
> MUI's `lg` breakpoint instead (1200) leaves a 20px band where the drawer is permanent but nothing
> holds room for it, and it sits on top of the content. Verify the shell at **1190px**, not just at
> 1280 and 1024.

---

## 3a · The spacing scale — read this before writing any `sx`

`theme.spacing` maps `n → n * 8px`, matching MUI's own convention. Every `p`, `gap`, `px`, `mt` in
this codebase is written expecting that: `p: 2` means 16px.

> **This was wrong for a while and it is why the whole app felt airless.** The theme originally
> based `spacing` on the token grid's 4px step (`spacing[1]`), which silently **halved every
> padding and gap in the product** — `p: 3` rendered 12px, not 24. It was found by measuring the
> theme customizer against eight shipped appearance panels on Mobbin and getting a body inset of
> 12px against their 24–32px. Fixed to `spacing[2]`. The 4px grid is still reachable through
> half-steps (`p: 0.5` = 4px) for the rare case that needs it.
>
> **When density looks wrong, measure before adjusting individual `sx` values.** A `getBoundingClientRect()`
> check of the actual padding would have caught this in one call; several components were
> individually re-tuned first.

## 3a·2 Shell settings & the theme customizer

`ThemeCustomizer` (`components/organisms/theme-customizer.jsx`) is the preferences drawer:
layout, direction, mode, colour scheme, typography, content width. State lives in `localStorage`
under `genus-settings`, merged over `DEFAULTS`, so an unknown key can never break boot.

- Each group is a real **`radiogroup`** of **`role="radio"`** cards, and the whole card is the
  target — not just the label. Each card carries a schematic **preview** drawn from tokens, so the
  user is not asked to translate "Mini Drawer" into a mental picture before choosing.
- **A colour scheme changes the brand hue and nothing else.** Neutrals, surfaces, text, borders and
  the status ramps are identical in every scheme, so no preset can break contrast or restyle a
  warning. `getTheme` enforces this by overriding only `action/primary/*` and `focus/ring`.
- Two of the nine schemes (`default`, `sunset`) are real Figma ramps; the other seven are generated
  in `build-tokens.mjs` from a base hue. `schemes[id].fromFigma` says which. **Step 500 is the given
  base verbatim** — a chosen colour is never "corrected" toward a vivid mid-tone.
- Selected cards use a 2px border and compensate with a 1px margin, so selection does not nudge
  neighbouring cards.

> **Horizontal is a separate nav component**, not the rail rendered sideways — a collapsible
> sub-list has no horizontal equivalent, so children become a dropdown. Anything added to `NAV`
> must be checked in both. It also has **no rail to host the hierarchy picker**, so in that layout
> the top-bar path becomes a button opening the picker in a popover. Removing that silently
> removes the only way to change what every screen is scoped to.

**The customizer's density and structure were checked against eight shipped panels** (Wrike,
Todoist, X, Revolut Business, Perplexity, Twenty, Deel, Fabric — via Mobbin), not designed from
scratch. None of the eight put an icon tile beside a section title or collapsed their sections —
the first version did both, and that plus the spacing bug above is where all the negative space
went. What survived the comparison:

- **Quiet section labels**, no icon, no chevron, sections always open. Six chevrons is a control
  per section in a panel that scrolls anyway.
- **Preview cards only where a preview earns its place** — Layout, Mode, Direction, Content
  width, where the choice changes the shell's shape. Colour and Typography do not get cards.
- **Colour as a row of circular swatches** (the pattern in X's Appearance screen), not nine repeats
  of the same layout diagram with only a rail tint changed. Saved roughly 200px of column height.
- **Every card grid is three tracks**, even for a two-option group. A two-track grid made those
  cards visibly larger than the three-option groups' — same kind of control, different size, a
  Law of Similarity break. Two options now fill two of three slots and the gap reads as
  deliberate, not broken.
- **Selection is a ring plus a check**, never a ring alone — a check survives greyscale and colour
  deficiency in a way a border colour does not.

---

## 3b · Brand marks

`components/brand.jsx` — `GenusMark`, `GenusWordmark`, `GenusLockup`. Static copies live in
`public/` for anything outside React (og:image, email, external docs) and carry the same
`prefers-color-scheme` block.

> **The marks read from the blue and orange PRIMITIVES, never from `action/primary`.** A colour
> scheme changes the *product's* brand hue; it must not repaint the *company's* logo. Verified:
> with Forest selected the active nav item is `#3f8f4f` while the mark stays `#0467b2` / `#ee7304`.

**Dark mode steps both colours up exactly one stop** — blue-400 `#5598d0`, orange-400 `#f28e36`.
Measured against `surface/raised` `#333333`, the lightest and therefore hardest dark surface:

| | on `surface/raised` |
|---|---|
| blue-500 `#0467b2` | **2.16:1** — fails the 3:1 non-text floor |
| blue-400 `#5598d0` | 4.08:1 — passes, still recognisably Genus blue |
| blue-300 `#80b2df` | 5.63:1 — passes, but reads pastel |

Orange-500 already passes at 4.27:1 and did not strictly need the lift. It gets it anyway: the two
colours are one lockup, and moving only the blue changes their relationship to each other.

Light mode uses the brand values verbatim. Logotypes are exempt from WCAG 1.4.11 — which matters,
because orange-500 on `surface/subtle` is **2.60:1**. Fine for a logo; never reuse that pairing for
anything that has to be read as information.

**One mark at a time.** `GenusLockup` renders the *wordmark* when expanded and the *mark* when
compact — never both. The mark is a monogram of the same "e + sun" motif the wordmark already
contains, so side by side they state the brand twice and read as clutter, not emphasis. The mark
exists for the places the wordmark will not fit: the 76px mini rail, the favicon, an app icon.

**The wordmark viewBox is tightened to the artwork.** The source file declares 164×60 but `getBBox`
reports the content as 163.11 × 39.98 — a third of the source box is empty space below the glyph.
Rendering the source box meant `height={20}` produced a ~13px glyph sitting on 7px of nothing, which
is why it looked undersized and mis-baselined beside text. With `viewBox="0 -0.02 163.11 39.98"`,
`height` *is* the glyph height. `public/genus-logo-wordmark.svg` carries the same crop.

The wordmark artwork has no right side bearing, so the gap to the product name is 10px. At 6px
"GenusSolar" reads as a single word.

`GenusMark` defaults to **no plate**. The source SVG ships a white one, and a white tile in a dark
sidebar is a bright blob that spends the emphasis budget the navigation needs. Pass `plate` for a
contained lockup on an unknown background.

**The favicon cannot read the app's theme** — it is fetched before any JS runs and never re-fetched
when the toggle flips. It follows the OS scheme through a `<style>` block inside the SVG instead,
which is what the browser chrome around it does too. `index.html` pairs it with per-scheme
`theme-color` meta tags.

---

## 3c · Programme data — the first real screen

`src/lib/programme-data.js` is the canonical derivation of every number the Overview screen shows.
`RAW_SURVEYS` transcribes the 9 rows of the site-survey extract field for field; everything else —
verdicts, pipeline counts, exceptions, the run-rate trend — is a pure computation over that
transcription against the rules in `docs/dashboard-ia.md` §3.2 and §7.

**Recompute verdicts from the rules — never hand-type one.** An earlier draft of the gallery
hand-typed 9 verdicts and got 5 wrong (marked "Feasible" for rows that fail the shadow-free test).
The gallery now imports `SURVEY_ROWS` from this module so the two can never drift apart.

**A ratio needs both sides from the same population — `coverageInfo(node)` enforces it.** Coverage
returns `{ pct: null, reason }` rather than a number whenever:
- `registered === 0` for the scope (division by zero), or
- the scope spans more than one circle (`node.level === "discom"` in this 2-circle dataset) — Jamui
  has 0 surveys and Sasaram has 0 registered consumers, so dividing one circle's surveys by the
  other's registrations would print a confident, meaningless 0.09% instead of an honest dash.

**The discom root needs an explicit path check.** `rowIsUnder(row, nodeId)` tests whether `nodeId`
appears in a survey row's `[circle, district, subdivision, section, panchayat]` chain — but the
discom root sits *above* that chain, never *in* it. Without `nodeId === HIERARCHY.id` as a special
case, every scope-aware figure read 0 at the top of the tree, which is where the app opens by
default. Caught by checking the KPI strip against the known real total (9), not by inspection.

---

## 3d0 · `panelBorder(t)` — the dark-mode border/fill collision

**`border/subtle`, `surface/subtle` and `surface/raised` are the SAME hex in dark mode** —
`#333333`, Neutral-800, in Figma's own alias table. Any box that fills with `surface.subtle` or
`surface.raised` and borders with `t.palette.border.subtle` directly gets a **1.00:1 contrast
ratio** — not just low, literally invisible, because the border is drawn in the exact colour of its
own fill. This is why six KPI tiles read as one merged block in dark mode, and it was silently
affecting every outlined panel, tag and tile in the app, not only the one someone happened to
notice first.

**Fix once, at `src/lib/theme.js`: `panelBorder(t)`.** Returns `border.default` in dark mode (a
full ramp step lighter — `#474747`, giving a real 1.36:1 edge) and `border.subtle` unchanged in
light mode, where the pairing was never a problem. `MuiPaper`'s own `outlined` styleOverride uses
it, which covers every `Panel`/`WsSection`/`WsTable`/`EChartCard`/`KpiTile` for free — but `sx`
wins over a component's styleOverrides in MUI's cascade, so **anywhere a `Box` hand-rolls a border
around a `surface.subtle`/`surface.raised` fill via `sx`, it must call `panelBorder(t)` directly**,
not `t.palette.border.subtle`. Fixed at every such site found by search: `WsContext`, `WsTag`, the
sidebar's hierarchy-picker box, `TileDeck`'s unselected tab card, and two spots in the gallery.

> **Verified, not eyeballed.** Measured via `getComputedStyle` before and after: dark mode was
> `bg #333333 / border #333333` → ratio **1.00:1**. After the fix: `bg #333333 / border #474747` →
> ratio **1.36:1**. Light mode measured unchanged (`#ffffff` / `#e0e0e0`).
>
> **When adding a new tinted box:** if its background is `surface.subtle` or `surface.raised`,
> its border is `panelBorder(t)`, never `t.palette.border.subtle` directly — grep for
> `t.palette.border.subtle` near a `surface.subtle`/`surface.raised` background before shipping.

---

## 3d · The KPI scorecard — from Figma, not invented

Figma Genus Design System, node `246:11` / `254:53` ("09 Dashboard and KPI composition"). Two
distinct patterns exist there and both are implemented — do not merge them:

| Pattern | Component | Figma node | Use when |
|---|---|---|---|
| Passive strip, one shared surface | `KpiStrip` | `235:6` | Figures are one reading of a related system — not individually cardable |
| Individually carded scorecard | `KpiTile` + `KpiDeck` | `246:11` / `254:53` | Each figure earns its own tone, delta and freshness |

`KpiTile` reproduces the tile exactly: label + tone-tinted 28px icon plate in the header row, the
value in `Heading/2` (32/600, −0.4 tracking — already the theme's `h4` variant), an optional
tone-coloured delta with an arrow *and* a meaning phrase, and a freshness caption.

**Freshness is not optional — it is the component's own stated rule:** *"Metric value stays
primary; delta includes direction and meaning; freshness is always visible."* A `KpiTile` with no
`freshness` prop is not this component. Every dashboard number needs a stated age or provenance.

**`tone` reuses existing status tokens** — Figma's Neutral/Positive/Attention map onto
`info`/`good`/`warning`, so no new tokens were added. A fourth tone, `neutral`, was added *outside*
the Figma spec for a metric this dataset genuinely cannot compute — flat, no tint, so it reads as
absent rather than as a fourth real status alongside the other three.

**`delta` is optional, deliberately.** Figma's reference always shows one, but fabricating a
period-over-period change with no historical comparison to draw it from would be worse than simply
omitting the line the spec shows. None of this app's KPI tiles show a delta today, because the
dataset is a single snapshot with no prior period to compare against — that is an honest gap, not a
bug to paper over with an invented number.

**The deck grid is 2-up even on the smallest breakpoint Figma tested** (`260:323`, mobile, 171px
cards, 16px gap) — not the page-level "collapse to one column at xs" rule. That is a deliberate,
documented exception in the same source design system for this specific component, not an
oversight to "fix" back to one column.

**A KPI tile is not a dense grid cell — colour there is not zero-sum the way it is in a table.**
`bandFor()`'s `normal → no colour` rule (§2) is for high-density grids where every cell competes for
the same attention budget. A handful of hero KPI cards already each command a card boundary's worth
of attention, so `BAND_TO_TONE` in `overview.jsx` maps `normal → good` (a real green), not to none.

**"Not configured" is a tile state, not a zero.** `src/lib/programme-data.js`'s `DEVICE_FLEET`
records that no device, GTI, BMS or UPS record exists in either source extract — this dataset is a
rooftop-solar rollout programme, not yet a device fleet. `KpiTile`'s `notConfigured` prop renders an
em dash in italic `text.tertiary` with a neutral icon plate and states the reason in the freshness
slot, rather than printing `0` for a schema gap or inventing a plausible-looking count.

---

## 4 · MUI v9

The `*Props` escape hatches are gone; they are named slots now. Passing the old ones leaks unknown
attributes onto DOM nodes and React warns for each.

| v5 | v9 |
|---|---|
| `inputProps` | `slotProps={{ htmlInput: … }}` |
| `InputProps` | `slotProps={{ input: … }}` |
| `primaryTypographyProps` | `slotProps={{ primary: … }}` |
| `secondaryTypographyProps` | `slotProps={{ secondary: … }}` |
| `PaperProps` | `slotProps={{ paper: … }}` |

`cssVariables` is deliberately **off** in `getTheme`. It rewrites every palette reference into
`var()` indirection, which breaks `alpha()` inside `sx` callbacks across the app.

`MuiPaper` sets `backgroundImage: none`. MUI paints an alpha-white overlay on dark elevated paper,
which fights the token system and stops pinned table cells being opaque.

---

## 5 · Tables

Everything goes through `DataTable` (`src/components/data-table.jsx`) — TanStack v8 painted with
MUI primitives, keeping a DataGrid-shaped column API on purpose. **MUI X is not a dependency and
must not be reintroduced.**

Build tables with `wsCols([...])` + `WsTable`. Notes that catch people out:

- `onRowClick` receives **`{ row, id }`**, not the row. Destructure it.
- `renderCell` is display only. Sorting, filtering, search, faceting and CSV all read the raw or
  `valueGetter` value.
- `exportName` is **also the preferences key**. Two tables sharing a title share their saved
  density, pinning, visibility and widths. A table with no title gets no persistence at all.
- `chip` in `wsCols` takes a **tone**, not `true`. Inferring a status palette from cell text is how
  the WFM version ended up painting "Active" amber where active is good.
- Frozen cells must stay fully opaque or scrolling columns bleed through. Verify pinning in **both**
  themes after any height or overflow change.
- Full screen is `createPortal`-ed to `document.body`. Removing that reintroduces the bug where the
  overlay is sized against a transformed ancestor panel and clipped by its `overflow: hidden`.
- **Never declare a component inside a render body.** It is a new component type every render, so
  React remounts it — which steals focus from the search field on every keystroke. Render helpers
  are called as functions (`renderToolbar()`), not as `<Toolbar />`.

> **Known limit.** There is no virtualisation. The consumer register will be tens of thousands of
> rows per circle, which breaches that assumption — it needs `@tanstack/react-virtual` or
> server-side pagination before it meets real data. Do not "fix" it by raising the page size.

---

## 6 · Charts

`EChart` in `src/components/charts.jsx`. Every guard is load-bearing:

- Init is **deferred until the container reports real dimensions**. A chart initialised at 0×0
  throws and unmounts the tree, because geo layouts divide by width.
- The `ResizeObserver` is **persistent, not one-shot** — a grid going from two columns to one
  resizes the container without resizing the window.
- ECharts fixes its theme at `init`, so **mode is a dependency of the init effect** and the
  instance is rebuilt rather than updated. Without this, charts keep the previous theme after a
  dark-mode switch.
- `setOption` is wrapped. A malformed frame is skipped, never allowed to blank the panel.

`CATEGORICAL` **must stay ten entries** — `hashColor()` indexes it modulo its length, which is what
keeps one contractor the same colour on every screen.

---

## 7 · Accessibility

- Focus is 2px solid at offset 2, from `focus/ring`. Use the `focusRing(t)` helper on custom controls.
- `TARGET_MIN = 24` (WCAG 2.5.8). Field/mobile surfaces need 44.
- An information affordance must work on hover, on focus **and** on click. `MetricInfo` does all
  three — hover-only fails WCAG 1.4.13 and locks out touch entirely.
- A control nested inside a clickable surface calls `stopPropagation`. Reading a definition must
  not also navigate.
- `TileDeck` is a real `tablist`: one tab stop, arrows to move, Home/End to jump, pane
  `aria-labelledby` its tile. **Under RTL, ArrowLeft moves forward** — arrows follow reading order,
  not screen geometry.
- The shell owns one polite live region. Post to it with `announce("…")` from
  `components/organisms/shell.jsx` whenever an async change lands.

---

## 8 · Numbers, dates, RTL

- `en-IN` grouping (`3,14,897`), lakh and crore (`3.17L`, `1.24Cr`) — never K and M.
- Dates are `dd-mm-yyyy`. The source CSVs use **two different formats in the same row**
  (`07-08-2026, 16:18` and `07-08-2026 16:27:34`); `parseIndianDate` handles both.
- **A formatted numeral contains no spaces; prose does.** That test is how components decide what
  may shrink — numerals never, prose always.
- Numerals, hexes and identifiers carry `dir="ltr"` + `unicodeBidi: "isolate"`. Without it `#aacbed`
  renders as `aacbed#` in an RTL paragraph.
- Test both directions for any layout change. Chart internals stay LTR — ECharts draws its own axis
  labels — and that is accepted.

> **Gap.** There is no i18n layer. Every user-facing string is a literal in JSX and the locale
> helpers are hard-coded to `en-IN`. RTL is fully wired at the layout level, so the mechanical half
> is done and the content half has not started.

---

## 9 · Verifying

There is no test suite. `/gallery` is the substitute and is expected to stay current — a new
component that is not in it is a component nobody will check again.

Before calling anything done: **light and dark**, **LTR and RTL**, and a frozen column if the table
is wide.

> **Browser-pane quirk, not a bug.** Screenshots come back blank once the page is scrolled, and
> `useMediaQuery` does not re-evaluate under an emulated viewport resize. Reload at the target size,
> and verify below-the-fold content by measuring in `javascript_tool` rather than by scrolling.

---

## 10 · Data reality

Two things worth knowing before you trust a number on screen:

1. **The consumer master and the survey extract do not join.** The master is 9,673 consumers in
   JAMUI circle; the surveys are 9 responses in SASARAM / Kaimur. Overlap is zero. Every coverage
   percentage is uncomputable until that resolves — see `docs/dashboard-ia.md` Q1. The generated
   hierarchy carries `registered: 0` on the SASARAM branch rather than hiding it.
2. **The `* Code` columns are not codes.** Circle Code equals Circle Name; Panchayat Code is the
   name with spaces stripped. Node ids in `hierarchy-data.js` are generated slugs, and
   `sourceCode` is kept for reference only. Never key on a source Code column.

`registered` counts sit **only on panchayat leaves**. Putting a count on an interior node as well
double-counts on roll-up — that bug rendered 19,346 consumers against a file holding 9,673.
