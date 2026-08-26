---
route: /overview
page: src/pages/overview.jsx
title: Programme Overview
status: reviewed
updated: 2026-08-24
aliases: [dashboard, home, landing page, programme dashboard, main screen]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js, src/lib/device-data.js, src/lib/bands.js]
relatedScreens: [/sites, /assets, /alarms, /reports]
---

# Programme Overview

> Where the rooftop-solar rollout stands **for the area you have selected** — how many
> consumers are registered, how many have been surveyed, and what is blocking the rest.

**Evidence marks:** **[C]** confirmed from code or source data · **[I]** inferred, evidence
named · **[U]** unknown — never guessed.

---

## 1. Overview

**Why this screen exists.** It is the landing screen and the answer to *"how is the
programme going in my area?"* — the one question every other screen is a detail of.

**What business problem it solves.** The SBPDCL rooftop-solar rollout runs across a
hierarchy of circles, districts, subdivisions, sections and panchayats. Progress is only
meaningful **within a scope**, and this screen recomputes every figure for whichever
scope you have selected.

**The screen's own stated principle. [C]** From the first comment in
[`src/pages/overview.jsx`](../../src/pages/overview.jsx):

> *"Every figure on it is computed from the two source extracts via
> `src/lib/programme-data.js` — nothing here is a placeholder number. Where a figure
> genuinely cannot be computed (coverage %, when the registered count for a node is
> zero), it renders as `unknown`, not a guess."*

That is the single most useful thing to know about this screen: **`unknown` is a real
value here, and it never means zero.**

**When you would come here.** Starting your day. Reporting progress upward. Checking
whether a specific area has been surveyed. Finding out how many exceptions are open
before opening [Alarms](/alarms).

## 2. Who Uses This Screen

| Role | Why they come here |
|---|---|
| **Admin / Super Admin** | Programme-wide progress and where it is stalled |
| **Analyst** | The figures that feed reporting |
| **Service Engineer** | Which areas have open exceptions |
| **User (store operator)** | Whether their area's surveys have landed |

> **Roles are designed, not enforced. [C]** `src/lib/rbac.js` defines these five roles
> and a permission matrix, and it is imported only by `/admin/roles` and `/admin/users`,
> which display and edit it. There are no route guards anywhere in the application.
> Anyone who can open the app can open this screen. Treat this table as *intended*
> audience, never as access control.

## 3. How to Access It

| | |
|---|---|
| **Route** | `/overview` **[C]** |
| **Navigation** | First item in the left rail |
| **Deep link** | `/overview` — the scope is **not** in the URL, so a link opens with the recipient's own scope, not yours **[C]** |
| **Landing screen?** | Yes. Any unknown route redirects here **[C]** — `<Route path="*" element={<Navigate to="/overview" replace />} />` |

## 4. Screen Layout

```
Breadcrumbs      Genus Solar › Overview
Page title       Overview
Context bar      Scope · Level · Registered · Surveyed
─────────────────────────────────────────────────────────
Programme        6 KPI tiles
Users & devices  KPI tiles — users, then one per device class
Pipeline         9 stage gates
─────────────────────────────────────────────────────────
Split            "Registered by area"  |  "Survey submissions by day"
Table            Areas in scope
```

## 5. Component-by-Component Guide

### Context bar

| | |
|---|---|
| **Location** | Directly under the page title |
| **Purpose** | States what "in scope" currently means, so no figure below is ambiguous |
| **What the user sees** | `Scope`, `Level`, `Registered … consumers`, `Surveyed … in scope` |
| **Data source** | `useHierarchy()` from [`src/lib/hierarchy.jsx`](../../src/lib/hierarchy.jsx) **[C]** |
| **User interaction** | Read-only here. Scope is changed in the rail's area selector **[C]** |
| **Notes** | Every number on the screen is recomputed when this changes |

### KPI tile — Registered

| | |
|---|---|
| **Purpose** | How many consumers exist in the selected area |
| **What the data represents** | Rows in the consumer master extract under the selected node |
| **Data source** | `Solar PV Consumer Master.csv` → `src/lib/hierarchy-data.js` → `rollupRegistered()` **[C]** |
| **Calculation** | Sums `registered`, which sits **only on panchayat leaves**. Putting a count on an interior node too would double-count on roll-up — a bug that once rendered 19,346 consumers against a file holding 9,673 **[C]** |
| **Freshness label** | `Snapshot · master uploaded <date>` — this is an uploaded extract, **not** live **[C]** |
| **Possible states** | A count, or `0` for the SASARAM branch — see §14 |

### KPI tile — Coverage

| | |
|---|---|
| **Purpose** | What proportion of registered consumers have been surveyed |
| **Calculation** | Surveyed ÷ registered, within scope **[C]** |
| **Critical behaviour** | When registered is `0`, coverage renders **`unknown`**, not `0%`. Dividing by zero has no honest answer, and `0%` would read as "nobody has been surveyed" when the truth is "we cannot tell" **[C]** |
| **Band** | Colour comes from `bandFor("coverage_pct", …)` in [`src/lib/bands.js`](../../src/lib/bands.js) **[C]** |
| **Notes** | The most misread tile on the screen. See §14 |

### KPI tile — Surveyed / With conditions / Needs revisit

| | |
|---|---|
| **Data source** | `Solar PV Site Survey.csv` — **9 rows** — transcribed into `RAW_SURVEYS` in [`src/lib/programme-data.js`](../../src/lib/programme-data.js) **[C]** |
| **Calculation** | `Surveyed` is the `surveyed` pipeline stage. `Needs revisit` counts exceptions of type *Contradictory survey*. `With conditions` = surveyed − needs-revisit **[C]** |
| **Freshness label** | `Latest submission <age>`, or `No surveys in scope` **[C]** |

### KPI tiles — Users & devices

| | |
|---|---|
| **Purpose** | Fleet size per device class |
| **Data source** | `fleetCounts()` from [`src/lib/device-data.js`](../../src/lib/device-data.js) **[C]** |
| **Expected value today** | **Zero or empty.** The device arrays are empty on purpose — see §13 and §14 **[C]** |
| **Notes** | The section note in the code states the rule: *"a count with no stated population is how a dashboard ends up disagreeing with its own table"* **[C]** |

### Table — Areas in scope

| | |
|---|---|
| **Purpose** | Break the current scope into its children so you can see which area is behind |
| **Data source** | `childRollups(node)` **[C]** |
| **Calculation** | Sorted by `registered`, descending **[C]** |
| **User interaction** | Selecting a row changes scope **[I]** — the page imports `select` from `useHierarchy()`; behaviour not read line-by-line |

## 6. Data Sources and Data Flow

**Two source files, and they do not overlap. [C]** This one fact explains most of the
surprising numbers on this screen.

```
Solar PV Consumer Master.csv   9,673 rows · JAMUI circle
      └─> src/lib/hierarchy-data.js   [GENERATED — DO NOT HAND-EDIT]
              └─> rollupRegistered()  sums `registered` on panchayat leaves only
                      └─> Registered tile · Registered-by-area chart · Areas table

Solar PV Site Survey.csv       9 rows · SASARAM circle / Kaimur
      └─> RAW_SURVEYS in src/lib/programme-data.js   transcribed field for field
              └─> pipelineStages() · exceptionsFor() · submissionsByDay()
                      └─> Surveyed · Needs revisit · Open exceptions · daily chart

(no source yet)
      └─> src/lib/device-data.js   row arrays EMPTY ON PURPOSE
              └─> fleetCounts() → device tiles → 0 / empty state
```

| Displayed value | Source | Derivation | Mark |
|---|---|---|---|
| Registered | Consumer master | `rollupRegistered()` | **[C]** |
| Surveyed | Site survey | `pipelineStages()` | **[C]** |
| Coverage | both | surveyed ÷ registered, `unknown` when registered is 0 | **[C]** |
| Needs revisit | Site survey | exceptions of type *Contradictory survey* | **[C]** |
| Open exceptions | both | `exceptionsFor(node)` | **[C]** |
| Device counts | none yet | `fleetCounts()` over empty arrays | **[C]** |
| Source system | — | | **[U]** |
| API / service | — | No backend exists. `src/services/http/` is built but nothing answers it | **[U]** |
| Database / entity | — | | **[U]** |

**Update frequency.** Everything is computed in the browser from files bundled at build
time. **Nothing on this screen is live. [C]** It changes when a new extract is imported
and the app is rebuilt — not on a timer, not on a websocket.

**What this data is NOT.** Not live telemetry. Not a database query. Not the DMS. The
DMS holds the device data; this product has not received an extract of it yet.

## 7. Charts, Metrics, and Dashboards

### Registered by area

| | |
|---|---|
| **Represents** | Registered consumers per child area of the current scope |
| **Axes** | Category = child area; value = registered count **[C]** |
| **Period** | None — a snapshot of the master extract, not a time series **[C]** |
| **Filters** | Scope only |
| **What you can conclude** | Which areas carry the most consumers, so effort can be prioritised |
| **What you cannot** | Anything about progress — this chart has no surveyed figure in it |

### Survey submissions by day

| | |
|---|---|
| **Represents** | Count of survey submissions per day, in scope |
| **Axes** | X = submission date; Y = count **[C]** |
| **Data** | `submissionsByDay(node)` over the 9 transcribed survey rows **[C]** |
| **Period** | Whatever dates the 9 rows carry **[C]** |
| **Honest caveat** | Nine rows across a handful of days is not a trend. Do not read a run-rate from it **[I]** |

## 8. Available Actions

### Change scope

| | |
|---|---|
| **Location** | Area selector in the left rail (not on this screen) |
| **Preconditions** | None |
| **Steps** | Pick an area → every figure, chart and table row recomputes |
| **Data affected** | None. Read-only — this is a filter, not an edit **[C]** |
| **Next state** | Same screen, different numbers |
| **Edge case** | Selecting a SASARAM-branch node gives registered `0` and coverage `unknown` — correct, not broken **[C]** |

### Open a child area from the table

| | |
|---|---|
| **Location** | *Areas in scope* table |
| **Steps** | Select a row |
| **Expected result** | Scope narrows to that area **[I]** |

> **There are no write actions on this screen. [C]** Nothing here creates, edits or
> deletes anything.

## 9. Use Cases

### "How far along is my circle?"
Set scope to the circle → read **Coverage**. `unknown` means the registered count is
zero for that branch, not that nothing has been done.

### "Which area should we send surveyors to next?"
*Registered by area* → the tallest bars with the fewest submissions.

### "How many problems are open?"
**Open exceptions** tile, then [Alarms](/alarms) for the detail.

### "Why does my area show 0 registered?"
See §14 — almost certainly the JAMUI/SASARAM non-overlap.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Every figure, both charts, the table | Yes — recomputed in the browser **[C]** |
| Select a table row | Scope narrows | Yes **[I]** |
| New extract imported + rebuild | Underlying numbers | No — requires a build **[C]** |
| Time passing | Only the *age* in freshness labels | Yes, on re-render **[C]** |
| Backend event / scheduled job | Nothing — none exist | **[U]** |

## 11. Navigation

**Reached from:** rail *Overview*; any unknown route; the app's default.
**Leads to:** [Sites](/sites), [Devices](/assets), [Alarms](/alarms), [Reports](/reports).
**Breadcrumbs:** `Genus Solar › Overview` **[C]**.
**Back:** standard browser back. Scope is **not** in the URL, so back does not restore a
previous scope **[C]**.

## 12. Roles and Permissions

**Nothing on this screen is permission-gated today. [C]** No route guard, no conditional
rendering by role. See §2.

**[I]** Were enforcement added, this is a natural read-only screen for every role — it
has no write actions to restrict.

## 13. Screen States

| State | When | What the user sees | What to do |
|---|---|---|---|
| **Populated** | Scope has consumers and surveys | Figures throughout | — |
| **Zero registered** | Scope is in the SASARAM branch | `0` registered, `unknown` coverage | Expected. §14 |
| **No surveys in scope** | No survey rows under the node | `No surveys in scope` freshness | Expected |
| **Device tiles empty** | Always, today | Zero / empty | **Expected by design. §14** |
| **Loading** | Not applicable | Data is bundled, not fetched **[C]** | — |
| **Error** | Not applicable | No request can fail **[C]** | — |

## 14. Common Questions

**Q. Why does Coverage say `unknown` instead of a percentage?**
A. The registered count for your scope is zero, so surveyed ÷ registered has no answer.
The screen refuses to print `0%`, because that would read as "nobody has been surveyed"
when the truth is "we cannot tell". **[C]**

**Q. Why is Registered zero for my area?**
A. The two source extracts do not overlap. The consumer master covers **JAMUI**; the site
survey covers **SASARAM / Kaimur**. Every SASARAM leaf carries `registered: 0` because
those consumers are not in the master file. This is a property of the source data, not a
defect, and it is deliberately surfaced rather than hidden. **[C]**

**Q. Why are all the device tiles zero?**
A. The device arrays in `src/lib/device-data.js` are **empty on purpose**. The source DMS
holds this data — 151 devices, 44 BMS readings, 42 UPS readings, one GTI device across
four message streams — and a real extract is what fills them. Until it arrives, every
screen built on that module renders its honest empty state rather than
plausible-looking invented numbers. **[C]**

**Q. Is this real-time?**
A. No. Every figure is computed in the browser from files bundled at build time. **[C]**

**Q. Why only 9 surveys?**
A. That is how many rows `Solar PV Site Survey.csv` contains. They are transcribed field
for field. **[C]**

**Q. Where does "Needs revisit" come from?**
A. Surveys whose answers contradict each other — recorded as *Rooftop Available? = No*
while roof structure and ladder access were also recorded. **[C]**

**Q. Can I change anything here?**
A. No. Read-only. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Coverage shows `unknown` | Registered is 0 for this scope | Expected. Select a JAMUI-branch area **[C]** |
| All device figures are 0 | DMS extract not yet received | Expected. Nothing to fix **[C]** |
| Numbers differ from the DMS | Different sources; this uses the two CSV extracts | Compare against the extracts, not the DMS **[C]** |
| A figure never updates | Data is bundled at build time | A new extract needs an import and a rebuild **[C]** |
| Shared link shows different numbers | Scope is not in the URL | Tell the recipient which area to select **[C]** |
| "Only 9 surveys?" | That is the whole extract | Expected **[C]** |

## 16. AI Assistant Questions

- "What does the Coverage tile mean, and why is it unknown?"
- "Where does the Registered number come from?"
- "Why are the device counts zero on the Overview screen?"
- "Is the Overview screen real-time?"
- "What is the difference between *With conditions* and *Needs revisit*?"
- "Why does my area show 0 registered consumers?"
- "Which chart tells me where to send surveyors next?"
- "Can I edit anything on the Overview screen?"
- "How do I change the area the Overview screen is showing?"
- "What is the difference between 0 and unknown on this screen?"

## 17. Known Unknowns / Information Not Available

| Unknown | Why | What would resolve it |
|---|---|---|
| Source system behind the CSV extracts | Not stated in the repo | Ask the data owner |
| API / service | No backend exists; `src/services/http/` is built but unanswered | The API specification |
| Database / entity / field names | No database in this product | Backend schema docs |
| Update cadence of the extracts | Not recorded | The data-supply agreement |
| Exact click behaviour of an *Areas in scope* row | Inferred from the imported `select`, not read line-by-line | Read `overview.jsx` or click it |
| Whether device counts will be live or extract-based | Not decided in the repo | The DMS integration decision |
