---
route: /telemetry/bms
page: src/pages/telemetry-bms.jsx
title: BMS Telemetry
status: reviewed
updated: 2026-08-24
aliases: [battery telemetry, battery packs, BMS readings, battery monitoring, packs]
dataModules: [src/lib/hierarchy.jsx, src/lib/device-data.js, src/lib/bands.js]
relatedScreens: [/assets, /telemetry/ups, /telemetry/meter, /data/health, /alarms]
---

# BMS Telemetry

> Battery pack readings across the fleet — state of charge, voltage, current and
> **temperature spread**, with each value banded only when it is fresh enough to judge.

**Evidence marks:** **[C]** confirmed · **[I]** inferred, evidence named · **[U]** unknown.

> ⚠️ **This table is empty today, and that is deliberate.** See §13 and §14.

---

## 1. Overview

**Why this screen exists.** To let an analyst compare battery packs across the fleet and
spot the ones in trouble before they fail.

**Wide on purpose. [C]** From the page source: *"the BMS grid carries ~20 columns and that
is legitimate for an analyst comparing across the fleet. Ship a default visible set of 8,
with the rest available through the Columns menu."* That is chunking, not capping — hiding
columns an analyst needs would be simplification into uselessness.

**Three columns exist here that the source DMS does not have, and they are the point of
rebuilding it. [C]**

| Column | Why it was added |
|---|---|
| **Temp spread** | Spread matters as much as the maximum. It points at uneven cooling, a hot cell or a bad connection — **none of which show up in a max-temperature column** |
| **Faulty probes** | How many of the four thermistors returned a sentinel value. The source table prints `-58.0` as if it were a temperature, and three of its rows carry one. Naming the fault is the difference between dispatching an engineer to a **broken sensor** and dispatching one to a **thermal runaway** |
| **Reporting** | Freshness. A pack at 0 % SOC with 0 cycles has almost certainly never reported, and painting that critical-red is a lie about the present |

**When you would come here.** Investigating a battery alarm. Checking pack health before a
site visit. Comparing packs across a circle.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Service Engineer** | Which pack is failing, and whether the reading can be trusted |
| **Analyst** | Fleet-wide comparison across many columns |
| **Admin / Super Admin** | Whether battery data is arriving at all |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/telemetry/bms` **[C]** |
| **Navigation** | Rail → Telemetry → BMS |
| **Deep link** | `/telemetry/bms`. Scope and column visibility are **not** in the URL **[C]** |

## 4. Screen Layout

```
Title / subtitle   BMS — "Battery packs across the fleet. Pack temperature and spread
                   are derived from the four thermistors, counting only the ones
                   returning a plausible value."
Context bar        Scope · Level · Readings
Filter bar
Table              Pack readings — 8 columns visible, ~20 available via Columns
Empty state        "Readings not yet ingested"
```

## 5. Component-by-Component Guide

### Table — Pack readings

| | |
|---|---|
| **Purpose** | One row per pack reading in scope |
| **Data source** | `src/lib/device-data.js` **[C]** — currently empty, see §6 |
| **Default columns** | 8 of ~20. The rest are available through the **Columns** menu **[C]** |
| **States** | Empty (today) · populated · no-results |

### Cell — Temp spread

| | |
|---|---|
| **What it represents** | The difference between the hottest and coolest thermistor on a pack |
| **Calculation** | Derived from the four thermistors, **counting only the ones returning a plausible value** **[C]** |
| **Why it matters** | Uneven cooling, a hot cell or a bad connection show up here and nowhere else |

### Cell — Faulty probes

| | |
|---|---|
| **What it represents** | How many of the four thermistors returned a sentinel instead of a temperature |
| **Why it matters** | The source DMS prints `-58.0` as a temperature. This column names it as a sensor fault instead **[C]** |

### Banded cell (every telemetry value)

| | |
|---|---|
| **Behaviour** | Uses `bandWithFreshness`, **never** `bandFor` — **a stale reading gets no band at all** **[C]** (AGENTS.md §2) |
| **When unknown** | The **reason** is attached, so the reader learns whether the value is missing, implausible, or unjudgeable without a nameplate **[C]** |
| **Why** | A green band on a reading from three weeks ago is a claim about the present that the data cannot support |

## 6. Data Sources and Data Flow

```
(no source yet)
  └─> src/lib/device-data.js     BMS row array EMPTY ON PURPOSE
       └─> scoped by hierarchy
            └─> telemetry-bms.jsx → Pack readings table → empty state
```

| Displayed value | Source | Mark |
|---|---|---|
| Every reading | none yet — the DMS holds **44 BMS readings** | **[C]** |
| Band colours | `src/lib/bands.js` + freshness | **[C]** |
| API / database | — | **[U]** |

**Update frequency.** Not live. Bundled at build time **[C]**.

## 7. Charts, Metrics, and Dashboards

No charts. The metrics live in table columns — see §5.

## 8. Available Actions

### Change scope · Filter · Show/hide columns

| | |
|---|---|
| **Data affected** | None. **This screen is entirely read-only** **[C]** |
| **Columns menu** | Reveals the ~12 columns hidden by default **[C]** |

## 9. Use Cases

### "Which pack is overheating?"
Sort by **Temp spread** descending. A high spread with low **Faulty probes** is a real
thermal problem; a high spread with faulty probes may be a sensor.

### "Is this pack actually broken, or just not reporting?"
Check **Reporting**. A pack at 0 % SOC with 0 cycles that has never reported is not a
failing battery.

### "Why is this value grey / unknown?"
Hover the reason. It says whether the value is missing, implausible, or needs a nameplate.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Rows re-scope | Yes **[C]** |
| Show/hide a column | Table layout | Yes **[C]** |
| Reading goes stale | Its band is withdrawn | On re-render **[C]** |
| Extract arrives + rebuild | Rows appear | No — needs a build **[C]** |

## 11. Navigation

**Reached from:** rail → Telemetry → BMS.
**Leads to:** [Devices](/assets) for the pack's registry record; [Alarms](/alarms).
**Back:** browser back; scope is not in the URL **[C]**.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only for everyone.

## 13. Screen States

| State | When | What the user sees | What to do |
|---|---|---|---|
| **Empty** | **Today, always** | *Readings not yet ingested* + the reason | Expected — §14 **[C]** |
| **Populated** | Once an extract lands | The table | — |
| **No results** | Filter matches nothing | Empty overlay | Clear the filter |
| **Unknown values** | Missing / implausible / no nameplate | Grey with a reason | Read the reason **[C]** |
| **Unbanded** | Reading is stale | No colour | Correct — §5 **[C]** |

## 14. Common Questions

**Q. Why is this screen empty?**
A. The BMS row array in `src/lib/device-data.js` is **empty on purpose**. The source DMS
holds 44 BMS readings and an extract has not been received. Rather than fill the screen
with plausible-looking numbers, it renders its honest empty state. **[C]**

**Q. Why does a value have no colour?**
A. The reading is too stale to judge. A band on a stale reading would be a claim about the
present the data cannot support. **[C]**

**Q. What is temperature spread and why does it matter more than the maximum?**
A. The gap between the hottest and coolest thermistor. Uneven cooling, a hot cell or a bad
connection show up as spread and not as a high maximum. **[C]**

**Q. What does "faulty probes" mean?**
A. Thermistors returning a sentinel instead of a temperature. The source DMS prints those
as real values — `-58.0` — which is how a broken sensor gets mistaken for a thermal
event. **[C]**

**Q. Where are the other columns?**
A. The **Columns** menu. Eight of about twenty are visible by default. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Empty table | No BMS extract yet | Expected **[C]** |
| Values grey | Missing, implausible, or nameplate-dependent | Read the attached reason **[C]** |
| No band colours | Readings stale | Check **Reporting** **[C]** |
| A column is missing | Hidden by default | Columns menu **[C]** |
| `-58.0`-looking values | Should not appear here | Report it — this screen exists to prevent that **[C]** |

## 16. AI Assistant Questions

- "Why is the BMS telemetry screen empty?"
- "What is temperature spread on the BMS screen?"
- "What does faulty probes mean?"
- "Why does a BMS reading have no colour?"
- "How do I see more BMS columns?"
- "How many BMS readings does the source DMS hold?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Every reading value | No extract received | The DMS extract |
| API / database / fields | No backend | The API specification |
| Exact band thresholds per metric | In `bands.js`; not read line-by-line for this guide | Read `src/lib/bands.js` |
| When the BMS extract arrives | Not recorded | Data-supply agreement |
