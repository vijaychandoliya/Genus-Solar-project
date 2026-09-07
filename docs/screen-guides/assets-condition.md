---
route: /assets/condition
page: src/pages/assets.jsx
title: Assets — Rooftop Condition
status: reviewed
updated: 2026-08-24
aliases: [asset condition, roof condition, feasibility, design inputs, structure runs, earthing]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js]
relatedScreens: [/sites, /overview, /reports]
---

# Assets — Rooftop Condition

> The **aggregate** physical condition picture a design and procurement team needs — roof
> age, orientation, structure and earthing runs.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **Not to be confused with `/assets`, which is the Devices screen. [C]** This is
> `/assets/condition`.

---

## 1. Overview

**Why this screen exists.** Design and procurement need to know what they are building
onto — how old the roofs are, which way they face, how much structure and earthing cable
the job needs.

**A deliberate privacy decision. [C]** From the page source:

> *"Deliberately built from the same 9 real survey records as Sites, but never from the
> consumer master's 9,673 individual rows. That master carries real names and phone
> numbers; a browsable per-consumer registry would mean bundling that PII into a public
> client build for a demo table, which is not a trade worth making."*

**Sites vs Assets. [C]** *"Sites is the record browser, Assets is the aggregate condition
picture that a design/procurement team actually needs."*

**When you would come here.** Estimating materials. Understanding roof conditions before
designing. Reporting on fleet condition.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Analyst** | Aggregate condition for planning |
| **Admin / Super Admin** | Procurement and design inputs |
| **Service Engineer** | What to expect on site |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/assets/condition` **[C]** |
| **Navigation** | Rail → Assets → Condition |
| **Not** | `/assets` — that is the **Devices** screen **[C]** |

## 4. Screen Layout

```
Title              Assets
Context bar        Scope · Level
KPI strip          Assessed · Mean roof age · Mean structure run · Mean earthing run
Chart              Condition distribution
Table              Per-site condition
```

## 5. Component-by-Component Guide

### KPI — Assessed

Count of survey records contributing to the aggregates **[C]**. With only 9 records
available, treat every mean as indicative rather than statistical **[I]**.

### KPI — Mean roof age

| | |
|---|---|
| **Calculation** | Mean over assessed records **[C]** |
| **Use** | Older roofs may need structural work before mounting **[I]** |

### KPI — Mean structure run / Mean earthing run

| | |
|---|---|
| **What they represent** | Average cable and structure length per site |
| **Use** | Direct procurement input — quantity per site × number of sites **[I]** |

### Chart — Condition distribution

| | |
|---|---|
| **Represents** | How the assessed sites distribute across a condition dimension **[C]** — the exact dimension is **[U]**, not read line-by-line |
| **Caveat** | Nine records. A distribution over nine points is a shape, not a statistic **[I]** |

## 6. Data Sources and Data Flow

```
Solar PV Site Survey.csv   9 rows
  └─> RAW_SURVEYS in src/lib/programme-data.js
       └─> aggregated
            └─> assets.jsx → KPI strip + chart + table

Solar PV Consumer Master.csv   DELIBERATELY NOT USED — carries names and phone numbers
```

| Displayed value | Source | Mark |
|---|---|---|
| All aggregates | the 9 transcribed survey rows | **[C]** |
| Consumer identity | **deliberately absent** | **[C]** |
| API / database | — | **[U]** |

**Update frequency.** Not live; bundled at build time **[C]**.

## 7. Charts, Metrics, and Dashboards

See §5. **The honest caveat for every metric on this screen: nine records.** Means and
distributions over nine points are directional, not statistical **[I]**.

## 8. Available Actions

Change scope · read the chart · read the table. **Read-only. [C]**

## 9. Use Cases

### "How much structure and earthing cable will this rollout need?"
Mean structure run × sites, mean earthing run × sites. Then apply your own contingency —
the means come from nine records.

### "Are these roofs old enough to need remedial work?"
**Mean roof age**, then [Sites](/sites) for the individual records.

### "Why can't I see per-consumer detail?"
Deliberate. §14.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Aggregates recompute | Yes **[C]** |
| New survey extract + rebuild | New aggregates | No — needs a build **[C]** |

## 11. Navigation

**Reached from:** rail → Assets → Condition.
**Leads to:** [Sites](/sites) for the underlying records; [Reports](/reports) to export.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Surveys in scope | Aggregates |
| **Empty** | No surveys in scope | Empty state — common outside SASARAM **[C]** |
| **Small-sample** | Always, today | Real figures over 9 records **[C]** |

## 14. Common Questions

**Q. Why is there no per-consumer list here?**
A. Deliberate. The consumer master carries real names and phone numbers, and bundling that
PII into a public client build for a demo table was judged not worth it. This screen uses
the site-level survey data instead. **[C]**

**Q. What is the difference between this and Sites?**
A. Sites is the record browser — one row per survey. This is the aggregate condition
picture. Same 9 records underneath. **[C]**

**Q. Can I trust the means?**
A. They are computed correctly from real records — but there are only nine. Treat them as
directional. **[I]**

**Q. Why does `/assets` show a different screen?**
A. `/assets` is **Devices**; this is `/assets/condition`. A known naming trap. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Empty | No surveys in scope | Expected outside SASARAM **[C]** |
| Means look implausible | Nine records | Check [Sites](/sites) for the individual values **[C]** |
| Wrong screen | `/assets` vs `/assets/condition` | Use the full path **[C]** |

## 16. AI Assistant Questions

- "What is the difference between Assets condition and Sites?"
- "Why is there no consumer list on the Assets screen?"
- "How do I estimate earthing cable for the rollout?"
- "How many records do the Assets figures come from?"
- "Why does /assets show Devices instead?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| The exact dimension of the condition chart | Not read line-by-line for this guide | Read `src/pages/assets.jsx` |
| Whether nine records will grow | Not recorded | Data-supply agreement |
| API / database | No backend | The API specification |
