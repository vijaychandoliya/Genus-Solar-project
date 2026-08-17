# Genus Solar — Dashboard IA

**The dashboard information architecture, derived from the actual data.** Every measure below names
the column it is computed from; every claim about the data was read out of the two CSVs, not
assumed. Where the files disagree with each other or with the specs, it says so.

| | |
|---|---|
| Data read | `Solar PV Consumer Master.csv` — 9,673 rows × 56 cols · `Solar PV Site Survey.csv` — 9 rows × 96 cols |
| Read on | 17 August 2026 |
| Discom | SBPDCL (South Bihar Power Distribution Company Ltd) |
| Companion | [ia-and-screen-plan.md](ia-and-screen-plan.md) — the telemetry-side plan, now amended by §9 |
| Conventions | [admin-layout-guide.md](admin-layout-guide.md) · [table-system.md](table-system.md) |
| Status | Plan. Device telemetry schema still outstanding. |

---

## §0 · What the data says the product actually is

The four source specs describe a device monitoring platform for retail stores. **The data describes
something else, and something larger.**

This is a **discom rooftop-solar rollout programme**: a BPL-tariff (`Tariff Category = KJ` — Kutir
Jyoti) 1 kW rooftop solar deployment across SBPDCL's distribution hierarchy in Bihar. Consumers are
loaded in bulk from the discom's billing system, field surveyors from a contractor visit each
address, capture a feasibility survey with ten photographs on a phone, and the record then moves
through meter change, MDM, billing and acknowledgement before anything generates a single kWh.

Device telemetry is the *last* stage of that pipeline, not the product.

| The specs assumed | The data shows |
|---|---|
| Retail store sites with existing battery/inverter assets | Domestic BPL consumers awaiting a 1 kW rooftop install |
| Site is the organising object | **Consumer** is the organising object, inside a 6-level discom hierarchy |
| Monitoring is the job | **Moving a consumer through 9 stage gates** is the job; monitoring is stage 9 |
| Data arrives by MQTT and CSV import | Consumers arrive by bulk upload; surveys arrive from a mobile app |
| `Device` = an IoT asset | `Device ID` in the survey file is **the surveyor's phone** (`…_motorola_moto g45 5G`) |

> **The one rule for this dashboard set.** Every dashboard answers a question about *movement
> through the pipeline* — how many, how fast, where stuck, whose fault. A dashboard that only counts
> what exists is a dashboard nobody opens twice.

---

## §1 · Domain model, as read from the data

```
Discom                    SBPDCL                              [both files]
└── Circle                JAMUI · SASARAM                     [both files]
    └── District          JAMUI · Kaimur                      [both files]
        └── Sub-Division  GIDDHAUR·JHAJHA·JAMUI·SIKANDRA      [master: 4]
            └── Section   SONO·JAMUI(R)·LAXMIPUR·…            [master: 13]
                └── Panchayat  ABGILLA CHAURASA·ANANTPUR·…    [master: 21]
                    └── Consumer                              [master: 9,673]
                        └── SurveyResponse (0..n)             [survey: 9]
                            └── Installation → Meter → MDM → Billing → Commissioned
                                └── Telemetry  ← schema outstanding
```

### 1.1 Consumer — the organising object

| Field | Source column | Notes |
|---|---|---|
| `consumer_number` | `Consumer Numer` *(sic — typo in the master header)* / `Consumer Number` | **Not a fixed-width key.** 6,329 are 11 digits, 3,344 are 12. Any join must be length-tolerant. |
| `name` | `Consumer Name` | 7,806 distinct over 9,673 rows. 867 names repeat; `SUNITA DEVI` appears 20×. Name is not an identifier. |
| `address` | `Consumer Address` | 760 distinct strings over 9,673 consumers — **12.7 consumers share an address string on average**. Village-level, not premises-level. |
| `mobile` | `Mobile Number` / `Consumer Mobile Number` | Master stores bare 10-digit; survey stores `+91`-prefixed. One master value (`5272967319`) is not a valid Indian mobile. |
| `tariff` | `Tariff Category` | `KJ` for all 9,673. |
| `sanctioned_load` | `Sanctioned Load` | **Empty in all 9,673 master rows**; `1` (kW) in all survey rows. |

### 1.2 SurveyResponse

Grouped as the mobile form presents it. Six columns in the export are **form section headers, not
data** — `Hierarchy Details`, `Consumer Details`, `Roof Top Details`, `Ground Mounting Details`,
`Measurement / Location`, `Photograph` — all empty in every row. Drop them at ingest.

| Group | Columns | Use |
|---|---|---|
| Capture | `Survey Type` · `Survey Date` · `Geo Location` · `Signal Strength` · `Source` · `Submission Mode` | Provenance and capture quality |
| Roof | `Rooftop Available?` · `Roof Top Status` · `Thickness (MM)` · `Construct in (Year)` · `Roof Free From Shadow` · `Early Morning (East) or Late Evening (West) Shadow` · `Access to the Roof` · `Any Obstacles` · `Orientation of the Roof` · `Number of Floor` | Feasibility verdict |
| Ground | `Shadow Free Ground Area` · `Safety Remarks` | Fallback when no roof |
| Measurement | `Location of Structure Identified` · `Location of Earthing Pits` · `Distance of Structure` · `Distance of Earthing` | BOM — cable and earthing runs |
| Evidence | 10 photo columns — roof/ground, parapets, earthing, compass, ladder, bill, S/E/W/other-shading | Completeness and AI validation |
| Attribution | `Contractor Name` · `Employee ID` · `Created By` · `Assign To` · `Device ID` | Performance and accountability |

**Packed fields that must be parsed at ingest, not at render:**

| Column | Format | Extract |
|---|---|---|
| `Geo Location` | `25.0906107,83.7253975,3.04` | `lat`, `lng`, `accuracy_m` |
| `Signal Strength` | `SIM1: RSRP:-87dBm,RSRQ:-13db,SINR:null,ASU:53asu,airtel,4G; SIM2: …` | per-SIM `rsrp`, `rsrq`, `sinr`, `asu`, `carrier`, `tech` |
| `Survey Date` | `07-08-2026, 16:18` | dd-mm-yyyy — **not** ISO, and not the same format as `Created On` |
| photo columns | `{"/fc-uploads/…/roof_ground_img_….jpeg"}` | Postgres array literal → `string[]` |

### 1.3 The stage-gate columns

Twenty-one columns in both files carry a downstream integration state. **Every one of them is empty
in every row of both files.** They are not noise — they are the pipeline, unstarted.

| Stage | Columns | Meaning |
|---|---|---|
| MCO | `MCO Payload Status` · `Message` · `Timestamp` · `Transaction ID` | Meter Change Order raised to the discom |
| MDM | `MDM Payload Status` · `Title` · `Timestamp` · `Message` | Meter Data Management registration |
| Billing | `Bill Notification Status` · `Title` · `Timestamp` · `Message` | Net-metering billing linkage |
| Ack | `Acknowledgement Status` · `Message` · `TimeStamp` | Discom acceptance |
| Comms | `Communication Received Date` · `Meter Communication Status` | Meter started reporting |
| Exception | `Ticket Number` | Something failed and was raised |
| AI | `AI Validation Request Status` · `Title` · `Timestamp` · `Response Status` · `Message` | Automated photo/field validation |

Each is a `status + timestamp + message` triple. That shape is the whole design: **every stage can
fail, and every failure carries a message a human must read.** That is the exceptions queue in §5.6,
and it exists in the schema before it exists in any UI.

---

## §2 · The pipeline — the spine of every dashboard

Nine gates. A consumer's position in this sequence is the single most important derived field in the
product, and it does not exist in either file — it must be computed.

| # | Stage | Evidenced by | Currently populated |
|---|---|---|---|
| 1 | **Registered** | Master row exists | 9,673 |
| 2 | **Assigned** | `Assign To` | 0 — empty in both files |
| 3 | **Surveyed** | Survey `Response ID` + `Submitted On` | 9 |
| 4 | **Validated** | `AI Validation Response Status` | 0 |
| 5 | **Feasibility decided** | derived — §3.2 | computed |
| 6 | **MCO raised** | `MCO Payload Status` | 0 |
| 7 | **Meter / MDM** | `MDM Payload Status`, `Meter Communication Status` | 0 |
| 8 | **Billing linked** | `Bill Notification Status` | 0 |
| 9 | **Commissioned → Generating** | telemetry | schema outstanding |

`stage` is a computed enum on Consumer, plus `stage_entered_at` and `days_in_stage`. Everything
downstream — funnel, ageing, throughput, contractor cycle time, the exceptions queue — is a
projection of those three fields. Compute once, in the data layer.

> **The join is the single most important thing to fix.** The two files **do not join**. The master
> is 9,673 consumers in **JAMUI** circle; the surveys are 9 responses in **SASARAM** circle, Kaimur
> district. Consumer-number overlap is **zero**. Until survey rows resolve to master rows, the
> funnel has a numerator and a denominator from different populations and **every coverage
> percentage in this document is uncomputable**. See Q1.

---

## §3 · Measure dictionary

Every measure a dashboard may show. Each names its source, so a figure and the criteria it was
measured under stay the same sentence. `HTB` = higher is better, `LTB` = lower is better.

### 3.1 Coverage and throughput

| Measure | Formula | Source | Pol. |
|---|---|---|---|
| Registered consumers | count | master rows | — |
| Surveys submitted | count | survey `Response ID` | HTB |
| **Coverage %** | surveyed ÷ registered, per hierarchy node | join on `consumer_number` | HTB |
| Surveys per day | count by `Survey Date` | survey | HTB |
| Run rate (7-day mean) | rolling mean of daily | survey | HTB |
| Days to complete | registered-remaining ÷ run rate | derived | LTB |
| Resurvey rate | consumers with >1 response ÷ surveyed | survey | LTB |
| Unmatched surveys | surveys whose consumer is absent from master | join | LTB |

### 3.2 Feasibility

A verdict per survey, derived — the survey records observations, never a conclusion.

| Verdict | Rule |
|---|---|
| **Feasible** | `Rooftop Available? = Yes` ∧ `Roof Free From Shadow = Yes` ∧ `Any Obstacles = No` ∧ structure and earthing located |
| **Feasible with conditions** | Rooftop available, but shadowed, obstructed, or access is `Manual Arrangement` |
| **Ground-mount candidate** | `Rooftop Available? = No` ∧ `Shadow Free Ground Area = Yes` |
| **Not feasible** | No roof ∧ no ground area |
| **Needs revisit** | Contradictory or incomplete — see §7 |

| Measure | Source |
|---|---|
| Feasibility mix | derived verdict |
| Roof type mix | `Roof Top Status` — `RCC Roof` in 8 of 8 populated rows |
| Orientation mix | `Orientation of the Roof` — `East-West` \| `North-South`. **Yield-relevant**: neither is south-facing optimum |
| Shadow-affected % | `Roof Free From Shadow = No` ∨ east/west shadow `= Yes` |
| Access difficulty % | `Access to the Roof = Manual Arrangement` |
| Mean roof age | now − `Construct in (Year)` |
| Multi-storey % | `Number of Floor > 1` |
| **Mean cable run** | `Distance of Structure` (m) — drives BOM |
| **Mean earthing run** | `Distance of Earthing` (m) — drives BOM |

### 3.3 Quality

| Measure | Source | Pol. |
|---|---|---|
| Photo completeness | non-empty ÷ 10 photo columns | HTB |
| AI validation pass rate | `AI Validation Response Status` | HTB |
| Contradiction rate | §7 rules | LTB |
| Geo accuracy | 3rd element of `Geo Location`, metres | LTB |
| Geo-outside-panchayat % | point vs expected area | LTB |
| Capture signal quality | parsed `RSRP` — < −110 dBm is weak | HTB |
| Submission lag | `Submitted On` − `Survey Date` | LTB |

### 3.4 Contractor and surveyor

| Measure | Source |
|---|---|
| Surveys by contractor | `Contractor Name` — `MERAQUI VENTURES PVT LTD` is the only value present |
| Surveys by surveyor | `Created By` — 2 present: `Deepak Kumar - 11126`, `Aditya Raj Tiwari - 11125` |
| Surveys per surveyor-day | derived |
| Rejection rate | AI-failed + revisit ÷ submitted |
| Quality score | composite of photo completeness, contradiction rate, geo accuracy |
| Capture device mix | `Device ID` — **the phone**, not an asset |

### 3.5 Pipeline health

| Measure | Source |
|---|---|
| Records per stage | computed `stage` |
| Stage conversion % | stage n+1 ÷ stage n |
| Ageing in stage | `days_in_stage`, bucketed 0–3 / 4–7 / 8–14 / 15+ |
| Stuck records | `days_in_stage` beyond a per-stage threshold |
| Payload failure rate | `MCO` / `MDM` / `Bill` / `Ack` status ≠ success |
| Open tickets | `Ticket Number` present, unresolved |

---

## §4 · Context and filters

**The hierarchy is picked once, in the sidebar, and every dashboard inherits it.** Not a per-page
picker — the WFM rule, and it matters more here because the hierarchy is six levels deep.

```
Discom ▸ Circle ▸ District ▸ Sub-Division ▸ Section ▸ Panchayat
```

Selecting a node scopes every measure on every dashboard and appears in `WsContext` on each page.
Working memory is 4–7 chunks fading in 20–30 seconds; a six-level path re-selected per page is a
guaranteed loss. Carry the state instead of asking for it again.

Secondary filters, per dashboard, in a `FilterBar`: date range (`WsDateRange`, shared presets),
contractor, surveyor, feasibility verdict, stage, exception type.

> **Codes are not codes.** `Circle Code` = `Circle Name` = `JAMUI`. `District Code` = `District
> Name`. `Section Code` = `Section Name`. `Panchayat Code` is the name with spaces stripped
> (`ABGILLA CHAURASA` → `ABGILLACHAURASA`). Only `Sub-Division Code` is a real code, and only in the
> survey file (`2251`, `2253`). Build the hierarchy on a **generated internal id**, keep the
> discom's strings as display labels, and do not use any `* Code` column as a key.

---

## §5 · The dashboard set

Six surfaces plus one reserved. Each states the decision it supports; if it cannot, it does not
ship.

| # | Surface | Reader | Decides |
|---|---|---|---|
| 1 | Programme Overview | Programme head | Are we on track, and where is the biggest gap? |
| 2 | Area Progress | Circle / division manager | Which areas do I push this week? |
| 3 | Survey Operations | Field supervisor | Who works where tomorrow? |
| 4 | Feasibility & Design | Design / engineering | What are we about to build, and what does it cost? |
| 5 | Contractor Performance | Commercial | Who gets paid, who gets a warning? |
| 6 | Exceptions | Back office | What is stuck, and who unsticks it? |
| — | Generation | Operations | *Reserved for device telemetry — §5.7* |

### 5.1 Programme Overview

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + `WsContext` | Hierarchy path, data freshness, last master upload date |
| 2 | `KpiStrip` | Registered · Surveyed · **Coverage %** · Feasible % · Commissioned · Days to complete at run rate |
| 3 | **Pipeline funnel**, full width | Nine stages, counts and conversion %, ageing colour on each bar |
| 4 | Two-up | District choropleth by coverage % · Run-rate trend with target line |
| 5 | `WsTable`, full width | Worst-performing nodes — coverage %, surveyed, remaining, run rate, projected completion |

Band 3 is the load-bearing panel. Band 2 is a `KpiStrip` — one reading of programme condition, read
as a set, not a menu.

**Band 5 ranks the worst, not the best.** A leaderboard of top performers is a decoration; the
decision this page supports is *where do I intervene*.

### 5.2 Area Progress

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + `WsContext` | Current node, breadcrumb up the hierarchy |
| 2 | `KpiStrip` | Node totals — registered, surveyed, coverage %, feasible %, open exceptions |
| 3 | Two-up | Choropleth (district level only — §6) · Ranked bar of child nodes by coverage % |
| 4 | `WsTable`, full width | Child nodes: name, registered, surveyed, coverage %, feasible %, run rate, exceptions. **Row click drills one level down.** |

Row-click drill is the primary gesture, exactly as in WFM. Drilling to Panchayat swaps band 4 for
the consumer list.

### 5.3 Survey Operations

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + `WsContext` | Today's date, active surveyor count |
| 2 | `KpiStrip` | Submitted today · 7-day run rate · Assigned not started · Mean submission lag · Photo completeness · Resurvey rate |
| 3 | Two-up | Daily submissions, 30 days · Submissions by hour of day |
| 4 | `WsTable`, full width | Surveyor: name, contractor, assigned, submitted today, 7-day total, quality score, last submission |
| 5 | `WsTable`, full width | Recent submissions: consumer, panchayat, verdict, photos, geo accuracy, lag, flags |

`Assign To` is empty in every row today, so band 2's *Assigned not started* renders **Not
configured** — never `0`. A configuration gap is not a measurement.

### 5.4 Feasibility & Design

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + `WsContext` | — |
| 2 | `KpiStrip` | Feasible % · With conditions % · Ground-mount % · Not feasible % · Mean cable run · Mean earthing run |
| 3 | Two-up | Feasibility mix, stacked by area · Reasons-for-rejection ranked bar |
| 4 | Two-up | Orientation mix · Roof age distribution |
| 5 | `WsTable`, full width | Site-condition detail per surveyed consumer, with the ten photos openable in a lightbox |

**Bands 2 and 4 are where this product earns money.** Mean cable and earthing runs across a
panchayat are a materials estimate; orientation mix is a generation forecast. Both are one
aggregation away and neither exists anywhere today.

### 5.5 Contractor Performance

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + `WsContext` | — |
| 2 | `KpiStrip` | Contractors active · Surveys this period · Mean quality score · Rejection rate · Mean cycle time |
| 3 | Two-up | Volume by contractor over time · Quality vs volume scatter |
| 4 | `WsTable`, full width | Contractor: surveys, surveyors, coverage contribution, quality score, rejection %, exceptions, cycle time. `lockFirstColumn` |
| 5 | `WsTable`, full width | Surveyor detail for the selected contractor |

Only one contractor value exists in the sample. Design for n; do not special-case one.

### 5.6 Exceptions — a workspace, not a dashboard

Per [admin-layout-guide.md](admin-layout-guide.md) §0, an operational queue you work down is a
full-width table with a filter bar — not tiles in a grid.

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + counts by severity | `aria-live` on change |
| 2 | `FilterBar` | Type · severity · stage · area · contractor · age |
| 3 | `WsTable`, full width | Consumer · type · stage · detail · age · assignee · state. Bulk assign / resolve |

Exception types, all derivable today: payload failure (MCO/MDM/Bill/Ack), AI validation failure,
contradictory survey, missing photos, geo outside area, duplicate survey, **unmatched consumer**,
stuck in stage, open ticket.

Behave like an inbox — unread/read, select-many, act-on-selection, assign, resolve. Users arrive
with that model from email and ticketing tools and every deviation costs relearning.

### 5.7 Generation — reserved

The telemetry dashboards from [ia-and-screen-plan.md](ia-and-screen-plan.md) §7 attach here, at
stage 9. Their design holds — semantic bands, freshness classification, shared timeline — but the
object they hang from is **Consumer**, not the retail Site that plan assumed. Blocked on the device
schema.

---

## §6 · Geography — what we can and cannot draw

| Level | Boundary data | Render |
|---|---|---|
| State → District | Available — the WFM 760-district GeoJSON covers Bihar | **Choropleth**, drill state → district |
| Sub-Division · Section · Panchayat | **Not available.** No public boundary set at these levels | **Ranked bars + tables**, never a fake map |
| Individual survey | Available — `Geo Location`, ~3 m accuracy | **Point map** with feasibility-coloured pins |

> **Do not draw a boundary that does not exist.** An invented panchayat polygon is a confident lie
> at exactly the level where field decisions are made. Ranked bars are honest and, for *which of my
> 21 panchayats is behind*, strictly more readable than a choropleth.

The point map earns its place at panchayat level and below, where surveys cluster tightly — 25.0886
to 25.0906 across six of the sampled rows, roughly 220 m apart. It is also the fastest way to see a
geo-accuracy problem: a pin in the wrong village is visible instantly and invisible in a table.

---

## §7 · Data quality rules

Derived from defects present in these two files. Each becomes an exception type in §5.6.

| # | Rule | Evidence in the sample | Action |
|---|---|---|---|
| DQ-1 | Survey consumer must exist in master | **9 of 9 fail** — zero overlap | Exception: unmatched consumer |
| DQ-2 | `Rooftop Available? = No` ⇒ no roof photos, no roof attributes | 1 of 9 fails — roof photos, ladder `Yes`, structure located `Yes` | Flag contradiction, needs revisit |
| DQ-3 | `Distance of Earthing` within plausible range | `109` against a median of `10` | Flag outlier — near-certain typo for `10` |
| DQ-4 | All 10 photo slots populated | 9 of 9 pass | Flag incomplete |
| DQ-5 | Mobile matches `[6-9]\d{9}` | 1 of 9,673 master rows fails (`5272967319`) | Flag; blocks SMS notification |
| DQ-6 | Geo accuracy ≤ 10 m | 9 of 9 pass (3.0–3.16 m) | Flag low-accuracy capture |
| DQ-7 | Geo point inside expected panchayat | not checkable without boundaries | Flag by distance from panchayat centroid |
| DQ-8 | One active survey per consumer | 9 of 9 pass | Flag duplicate |
| DQ-9 | `Sanctioned Load` present | **0 of 9,673 master rows populated** | Renders `Not configured` |
| DQ-10 | Submission lag within a working day | 7–22 min observed | Flag long lag — offline capture |

**Address is not a premises identifier.** 12.7 consumers share an address string on average, and 867
consumer names repeat. Never key, dedupe or geocode on either. `consumer_number` is the only
identifier, and it is length-inconsistent.

---

## §8 · Naming collisions to fix at ingest

| Source | Rename to | Why |
|---|---|---|
| `Device ID` (survey) | `capture_device` | It is the surveyor's phone. `device` must mean the IoT asset when telemetry arrives, or every query is ambiguous |
| `Consumer Numer` (master) | `consumer_number` | Typo in the source header |
| `Source` | `capture_source` | Collides with telemetry provenance `source` (`mqtt`/`file_import`) in the other plan |
| `Counter`, `Is Active`, `Is Inserted` | drop | Constant `1` in every row of both files; carry no information |
| `Hierarchy Details`, `Consumer Details`, `Roof Top Details`, `Ground Mounting Details`, `Measurement / Location`, `Photograph` | drop | Form section headers, empty in every row |

---

## §9 · What this changes in the previous plan

[ia-and-screen-plan.md](ia-and-screen-plan.md) stands on the telemetry side and is amended on the
programme side.

| Holds | Changes |
|---|---|
| Semantic band system (§5) — applies to feasibility verdicts and stage ageing as readily as to cell voltage | **Site is not the top object — Consumer is.** The discom hierarchy replaces the flat site list |
| Freshness and empty-state taxonomy (§6) | Primary nav gains **Programme**, **Surveys**, **Consumers**; **Telemetry** demotes to one node |
| Alarm/exception lifecycle (§7.3) | The exception queue is programme-wide, not telemetry-only |
| Table rules, tokens, phases (§9–§12) | Phase order changes — the rollout dashboards precede the telemetry ones, because there is data for them today |
| The nameplate → bands → alerting dependency | Nameplate now arrives partly from **survey** data (kWp, orientation, roof type), not only from device registration |

**A scale finding that changes an engineering decision.** 9,673 consumers is *one circle*. SBPDCL
operates many. The consumer list will be tens of thousands of rows per circle, which breaches the
"largest real dataset is a few thousand rows" assumption behind `DataTable`'s no-virtualization
design ([table-system.md](table-system.md) J9). The consumer register needs
`@tanstack/react-virtual`, or server-side pagination, before it meets real data — not a raised page
size.

---

## §10 · Open questions

| # | Question | Blocks |
|---|---|---|
| Q1 | **Why do the master and survey files not overlap?** Different circles, or is the master a partial extract? Until this resolves, no coverage % is computable. | Every funnel measure |
| Q2 | Is `Consumer Number` 11 or 12 digits? Both are present. Is there a check digit or a prefix rule? | The join, the register, dedupe |
| Q3 | Where does the survey target come from — a per-panchayat quota, a date, or the full master? | Run rate, projected completion |
| Q4 | What are the AI validation checks, and what does a failure mean operationally? All 5 columns are empty. | §5.6, DQ rules |
| Q5 | Is `Assign To` intended to be populated? Field assignment is a whole surface if so, and dead weight if not. | §5.3 |
| Q6 | What are the per-stage SLA thresholds that make a record "stuck"? | Ageing bands, exceptions |
| Q7 | Device telemetry schema — which of BMS / GTI / Solar / Meter actually deploys on a 1 kW KJ rooftop? | §5.7 |
| Q8 | `Sanctioned Load` is empty across the master but `1` in every survey. Is 1 kW a programme constant or a per-consumer value? | Feasibility, generation forecast |

---

Written 17 August 2026 from `Solar PV Consumer Master.csv` (9,673 × 56) and `Solar PV Site
Survey.csv` (9 × 96). Row counts, fill rates, distinct-value counts and every defect in §7 were
computed from the files, not estimated. Device telemetry is out of scope until the schema arrives.
