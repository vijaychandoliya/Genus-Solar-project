# Screen Guides — the product knowledge base

One guide per screen, in a fixed structure, written so that **a new user needs no expert
beside them** and **an AI assistant can answer questions from it directly**.

---

## The one rule

> **Never invent a data source, an API, a table, a field, a calculation, or a permission.**
>
> If it is not in the code, the source data, or a `docs/` decision, write
> `Not identified from the available information.` and put it in §17.

A guide that confidently states a wrong data source is worse than no guide, because a
reader has no way to tell the two apart — and an AI trained on it will repeat the
invention with the same confidence. Every claim in a guide carries one of three marks:

| Mark | Means | You may write it when |
|---|---|---|
| **[C] Confirmed** | Traceable to code, source data, or a `docs/` decision | You can name the file |
| **[I] Inferred** | A reasonable reading of the evidence, not stated anywhere | You say what the evidence was |
| **[U] Unknown** | Genuinely not determinable | Always preferable to a guess |

---

## How the set is kept true

Screen docs rot faster than any other kind, because they describe the part of a system
that changes every sprint. Three defences, in order of strength:

**1 · The inventory is generated, not maintained.**

```bash
node scripts/screen-inventory.mjs
```

reads `src/App.jsx` and the page sources and reports every route, the page behind it,
how many lines it is, whether it has a guide, and **which data modules it imports**.
That last column is the honest, machine-checkable answer to *"where does this screen's
data come from"* — and it is the fact readers most often get wrong.

The script deliberately reports **nothing** about business meaning, endpoints, databases
or permissions. Those cannot be derived from imports, and a generator that guessed at
them would produce exactly the fabrication the rule above forbids.

**2 · A gate, not a good intention.**

```bash
npm run docs:screens        # the inventory report
npm run docs:check          # exits 1 if a route has no guide, or a guide has no route
```

A new route without a guide fails the check. A guide whose `route:` no longer exists is
reported as orphaned, so deleting a screen surfaces its stale documentation instead of
leaving it to mislead someone.

**3 · The guide lives beside a route, not beside a sprint.**

The frontmatter `route:` is the join key. It accepts a list, because two routes can
genuinely be one screen.

---

## Adding a guide

1. `node scripts/screen-inventory.mjs` — find the row for your route. The **data
   modules** column is your starting evidence.
2. `cp docs/screen-guides/_template.md docs/screen-guides/<name>.md`
3. Fill the frontmatter. `route:` must match the router exactly.
4. Open the page source. Its **first block comment** is this repo's convention for
   recording what the screen is for and why it differs from the design it came from —
   that is §1 and §11 written for you, by the person who built it.
5. Trace each data module to its origin. Every module in `src/lib/*-data.js` opens with
   a provenance note saying where its numbers come from. Quote it; do not paraphrase it
   into something vaguer.
6. Run `npm run docs:check`.

### Writing §6, the part that matters most

Trace the chain and name every hop you can:

```
source file → data module → derivation → page → component → displayed value
```

Worked example, entirely confirmable:

```
Solar PV Consumer Master.csv  (9,673 rows, JAMUI circle)
  → src/lib/hierarchy-data.js  [GENERATED — DO NOT HAND-EDIT]
  → rollupRegistered()         sums `registered`, which sits ONLY on panchayat leaves
  → src/pages/overview.jsx     `registered`
  → KpiTile "Registered"       "9,673"
```

Stop where the evidence stops. There is **no backend, no API and no database** in this
product today — the API layer exists (`src/services/http/`) but no server answers it.
So "Source system", "API/service" and "Database/entity" are `[U] Unknown` on nearly
every screen, and saying so is correct rather than lazy.

---

## Three facts every guide must get right

These come up on most screens, and getting them wrong is how a knowledge base becomes
actively harmful.

### 1 · Most telemetry tables are empty **by design**

`src/lib/device-data.js` opens with:

> *"THE ROW ARRAYS ARE EMPTY ON PURPOSE. They are not stubs to fill with
> plausible-looking numbers. The source DMS holds this data — 151 devices, 44 BMS
> readings, 42 UPS readings, one GTI device across four message streams — and a real
> extract of it is what fills these arrays. Until it arrives, every screen built on this
> module renders its honest empty state."*

So *"why is this screen empty?"* has a real answer, and it is **not** "something is
broken". Every guide for a screen importing `device-data.js` must say this in §13 and
§15. See AGENTS.md §3c for why: an earlier draft hand-typed 9 survey verdicts and got 5
of them wrong, and fabricated telemetry would be worse because nobody can eyeball a
wrong voltage the way they can spot a wrong verdict.

### 2 · The two source extracts do not overlap

`Solar PV Consumer Master.csv` covers **JAMUI**; `Solar PV Site Survey.csv` covers
**SASARAM / Kaimur**. The SASARAM branch therefore carries `registered: 0` at every
leaf, and coverage % is `unknown` there rather than `0%` or a guess. That is a property
of the source data, not a defect, and it is the origin of most *"why is this number
zero / blank / unknown?"* questions.

### 3 · Roles are designed but **not enforced**

`src/lib/rbac.js` defines five roles — Super Admin, Admin, Service Engineer, User (store
operator), Analyst — and a permission matrix. It is imported by exactly two screens:
`/admin/roles` and `/admin/users`, which **display and edit** it.

**There are no route guards and no permission checks anywhere in the application.**
Every route is reachable by anyone who can open the app.

So §12 of every guide says so plainly. Writing *"Only Admins can see this screen"* would
be a fabrication, and a dangerous one — someone could rely on it for access control.
The matrix is a design artefact describing intended behaviour, not a control that runs.

---

## Terminology — use these exact words

Consistency is what makes the set searchable, and what lets an assistant recognise that
two questions are about the same thing.

| Canonical term | Also called by users | Never write |
|---|---|---|
| **Scope** | area, node, selection, hierarchy filter | "the filter" (ambiguous) |
| **KPI tile** | card, stat, metric, box | "widget" |
| **Freshness** | age, last seen, staleness | "status" |
| **Band** | colour, RAG, severity | "the colour coding" |
| **Exception** | alarm, alert, defect, issue | "error" |
| **Nameplate** | spec, rating, device details | "metadata" |
| **Look** | theme, skin, appearance preset | "style" |
| **Scheme** | accent colour, brand colour | "theme" |
| **Unknown** | n/a, blank, missing | "zero", "none" |

**`unknown` is not `0`.** The product distinguishes them everywhere, and so must every
guide: `0` means *we counted and there were none*; `unknown` means *we cannot honestly
compute this*. Conflating them is the single most likely documentation error here.

---

## The section structure

Every guide has all 17 sections, in this order, even when a section is one line. A
missing section reads as an oversight; `Not applicable — this screen has no charts.`
reads as a decision.

| § | Section | Notes |
|---|---|---|
| 1 | Overview | Why it exists, what problem it solves |
| 2 | Who Uses This Screen | Intended roles — mark that they are unenforced |
| 3 | How to Access It | Route, nav path, deep links |
| 4 | Screen Layout | Top-to-bottom structure |
| 5 | Component-by-Component Guide | The component block, per element |
| 6 | Data Sources and Data Flow | **The most important section** |
| 7 | Charts, Metrics, and Dashboards | Per metric: meaning, calculation, period |
| 8 | Available Actions | Per action: location, preconditions, result |
| 9 | Use Cases | Task-shaped, in the user's words |
| 10 | Triggers and System Behavior | What causes a change |
| 11 | Navigation | In, out, breadcrumbs, back |
| 12 | Roles and Permissions | Say plainly that RBAC is unenforced |
| 13 | Screen States | Loading, empty, no-results, error, partial |
| 14 | Common Questions | Real questions, direct answers |
| 15 | Troubleshooting | Symptom → cause → what to do |
| 16 | AI Assistant Questions | Questions this guide can answer |
| 17 | Known Unknowns | Everything marked [U], collected |

§17 exists so unknowns are **findable**. When the DMS extract lands or the API ships,
that section is the work list.

---

## Reference guides

Three complete guides, written from evidence. Copy their depth and their marking, not
just their headings.

| Guide | Why it is a good model |
|---|---|
| [overview.md](overview.md) | Metric-heavy. Shows how to document a calculation and an honest `unknown` |
| [devices.md](devices.md) | The only screen on the new data stack. Shows a full source→UI trace |
| [appearance.md](appearance.md) | Action-heavy, no external data. Shows how to document consequences |
