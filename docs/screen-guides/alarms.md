---
route: /alarms
page: src/pages/alarms.jsx
title: Alarms
status: reviewed
updated: 2026-08-24
aliases: [exceptions, alerts, issues, defects, problems, exceptions inbox, alarm list]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js, src/lib/device-data.js]
relatedScreens: [/alarms/rules, /sites, /assets, /overview]
---

# Alarms

> The **exceptions inbox** — every real defect found in the source data, in one list.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists.** To collect, in one place, everything wrong with the data that a
human should look at.

**Nothing here is synthetic. [C]** From the page source:

> *"Every row is a real defect found in the source extracts: a survey whose consumer has no
> match in the registered master, a survey that contradicts itself (no rooftop, yet roof
> evidence was captured), or a measurement recorded far outside the fleet's normal range.
> Nothing here is synthetic — this is what `exceptionsFor()` actually finds when it walks
> the 9 real survey rows against the rules."*

**Why there is no filter bar. [C]** Per AGENTS.md §3, page-level table controls are a rule
violation once the table has its own per-column funnels. Severity and type both facet
natively, because neither has more than a handful of distinct values. **The filters are in
the column headers.**

**When you would come here.** Working through open problems. Checking whether a survey is
trustworthy. Finding out why a consumer has no match.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Service Engineer** | The work list |
| **Analyst** | Whether the data can be trusted before quoting it |
| **Admin / Super Admin** | Volume and severity of defects |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/alarms` **[C]** |
| **Navigation** | Rail → Alarms |
| **Also from** | [Overview](/overview) → *Open exceptions* tile **[I]** |

## 4. Screen Layout

```
Title / subtitle   Alarms
Context bar        Scope · Level
KPI strip          Open · Critical · From devices · Open exceptions
Table              Exceptions — per-column filters, no page filter bar
Empty state
```

## 5. Component-by-Component Guide

### KPI strip

| | |
|---|---|
| **Tiles** | Open · Critical · From devices · Open exceptions **[C]** |
| **Data source** | `exceptionsFor(node)` from `programme-data.js` plus `deviceExceptionsFor()` from `device-data.js` **[C]** |
| **Why "From devices" is separate** | Device exceptions come from a different source than survey exceptions, and today that source is empty **[C]** |

### Table — Exceptions

| | |
|---|---|
| **Purpose** | One row per detected defect |
| **Columns** | Type · Severity · the affected record · detail · age **[C]** |
| **Filtering** | **Per-column funnels**, not a page filter bar **[C]** |
| **Severity values** | `warning` and `critical` **[C]** |

### Exception types found today

| Type | What it means | Severity |
|---|---|---|
| **Unmatched consumer** | The survey's consumer number has no row in the registered master. The two extracts do not overlap — see §14 | warning **[C]** |
| **Contradictory survey** | *Rooftop Available? = No*, yet roof structure and ladder access were recorded | critical **[C]** |
| Device exceptions | Measurements far outside the fleet's normal range | **[C]** — none today, the device data is empty |

## 6. Data Sources and Data Flow

```
Solar PV Site Survey.csv   9 rows
  └─> RAW_SURVEYS in src/lib/programme-data.js
       └─> exceptionsFor(node)   walks the rows against the rules
            └─> alarms.jsx → KPI strip + Exceptions table

src/lib/device-data.js   EMPTY ON PURPOSE
  └─> deviceExceptionsFor()  → "From devices" = 0
```

| Displayed value | Source | Mark |
|---|---|---|
| Survey exceptions | the 9 transcribed survey rows | **[C]** |
| Device exceptions | none — the arrays are empty | **[C]** |
| API / database | — | **[U]** |

**Update frequency.** Computed in the browser at render. Not live **[C]**.

> ⚠️ **PII note. [C]** `exceptionsFor()` puts `consumerName` on each exception, and this
> screen renders it. That sits uneasily beside [Devices](/assets), which explicitly
> refuses to show consumer names for exactly this reason. **The two screens make opposite
> decisions about the same class of data, and somebody should decide which is right.** See
> §17.

## 7. Charts, Metrics, and Dashboards

No charts. The KPI strip is documented in §5.

## 8. Available Actions

### Filter by severity or type

| | |
|---|---|
| **Location** | The **column headers**, not a filter bar **[C]** |
| **Data affected** | None — read-only |

> **No acknowledge, assign, resolve or close. [C]** This is an inbox you read, not one you
> work. There is no write path in the application.

## 9. Use Cases

### "What needs attention in my area?"
Set scope → read the table. Sort by severity.

### "Why does this consumer have no match?"
*Unmatched consumer* — the survey and master extracts cover different circles. §14.

### "Which surveys can't be trusted?"
Filter type = *Contradictory survey*. Those need a revisit.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Exceptions recomputed | Yes **[C]** |
| Column filter | Rows filter | Yes **[C]** |
| New extract + rebuild | Different exceptions | No — needs a build **[C]** |
| Someone fixing the underlying data | Nothing until re-import | **[C]** |

## 11. Navigation

**Reached from:** rail → Alarms; Overview's *Open exceptions* tile **[I]**.
**Leads to:** [Alarm rules](/alarms/rules); [Sites](/sites) for the record behind a row.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

**[I]** If consumer names remain on this screen, it is the strongest candidate on the
platform for restriction.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Exceptions in scope | The list |
| **Empty** | None in scope | Empty state |
| **From devices = 0** | Always, today | Zero — expected **[C]** |

## 14. Common Questions

**Q. What is an "Unmatched consumer"?**
A. The survey's consumer number has no row in the registered master. It happens because
the two source extracts cover different areas — the master covers JAMUI, the survey covers
SASARAM/Kaimur, and they do not overlap. **[C]**

**Q. What is a "Contradictory survey"?**
A. The survey says *Rooftop Available? = No* while also recording roof structure and ladder
access. Both cannot be true. **[C]**

**Q. Why is "From devices" always zero?**
A. The device arrays in `device-data.js` are empty on purpose — no DMS extract has been
received. **[C]**

**Q. Can I acknowledge or close an alarm?**
A. No. This is a read-only inbox; there is no write path in the application. **[C]**

**Q. Where are the filters?**
A. In the column headers. A page-level filter bar would duplicate them. **[C]**

**Q. Are these real problems or demo data?**
A. Real. Every row is what the rules actually find in the 9 transcribed survey rows. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| No alarms | None in scope | Widen scope **[C]** |
| Same alarm repeatedly | One per affected record | Expected **[C]** |
| Can't close an alarm | No write path exists | Fix the source data and re-import **[C]** |
| "From devices" zero | No device extract | Expected **[C]** |

## 16. AI Assistant Questions

- "What does Unmatched consumer mean?"
- "What is a contradictory survey?"
- "Why is From devices always zero on the Alarms screen?"
- "Can I close or acknowledge an alarm?"
- "Where are the filters on the Alarms screen?"
- "Are the alarms real or demo data?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| **Whether consumer names should appear here** | This screen shows them; Devices explicitly refuses to. The two decisions contradict | A product/privacy decision |
| Whether alarms will become actionable | No write path | Roadmap |
| Device exception rules | Arrays empty; rules unexercised | The DMS extract |
| API / database | No backend | The API specification |
