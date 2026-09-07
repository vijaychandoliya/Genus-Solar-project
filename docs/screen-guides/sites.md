---
route: /sites
page: src/pages/sites.jsx
title: Sites
status: reviewed
updated: 2026-08-24
aliases: [site records, surveys, survey records, site list, feasibility, site browser]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js]
relatedScreens: [/overview, /assets/condition, /alarms]
---

# Sites

> The individual survey records behind Overview's counts — roof type, orientation,
> feasibility verdict and **the specific reasons behind it**.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists. [C]**

> *"Where Overview reads as a fleet ('how many, where'), this screen is the drill-down: the
> actual site records behind those counts. Every field comes from the real transcribed rows
> — roof type, orientation, feasibility verdict and the specific reasons behind it, GPS
> accuracy, contractor and employee attribution."*

**Why there is no chart here. [C]**

> *"No aggregate chart here — that duplicates Overview's 'Registered by area' panel for no
> reason. This screen's whole job is the individual record."*

**When you would come here.** Looking up one site. Checking why a survey was marked *Needs
revisit*. Seeing who surveyed a site and how accurate the GPS was.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Service Engineer** | The record for a site they are visiting |
| **Analyst** | Verdicts and their reasons |
| **User (store operator)** | Whether their area's surveys landed |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/sites` **[C]** |
| **Navigation** | Rail → Sites |

## 4. Screen Layout

```
Title              Sites
Context bar        Scope · Level
KPI strip          Sites surveyed · Surveyed · With conditions · Needs revisit
Table              The individual survey records
```

## 5. Component-by-Component Guide

### KPI strip

| | |
|---|---|
| **Tiles** | Sites surveyed · Surveyed · With conditions · Needs revisit **[C]** |
| **Data source** | `programme-data.js` over the 9 transcribed survey rows **[C]** |
| **Relationship** | The same figures Overview shows — the same functions, so they cannot disagree **[C]** |

### Table — Survey records

| | |
|---|---|
| **Purpose** | One row per real survey |
| **Fields** | Roof type, orientation, feasibility verdict **and its reasons**, GPS accuracy, contractor, employee **[C]** |
| **Data source** | `RAW_SURVEYS` — transcribed field for field from `Solar PV Site Survey.csv` **[C]** |
| **Row count** | **9** — that is the whole extract **[C]** |

### Verdict and its reasons

| | |
|---|---|
| **Why the reasons matter** | A verdict alone does not tell an engineer what to fix. The reasons do **[C]** |
| **Values seen** | Includes *Needs revisit* — surveys whose answers contradict each other **[C]** |

## 6. Data Sources and Data Flow

```
Solar PV Site Survey.csv    9 rows · SASARAM circle / Kaimur
  └─> RAW_SURVEYS in src/lib/programme-data.js   transcribed field for field
       └─> scoped by hierarchy
            └─> sites.jsx → KPI strip + records table
```

| Displayed value | Source | Mark |
|---|---|---|
| Every field | the 9 transcribed survey rows | **[C]** |
| KPI figures | the same functions Overview uses | **[C]** |
| Consumer master data | **not used here** | **[C]** |
| API / database | — | **[U]** |

**Update frequency.** Not live; bundled at build time **[C]**.

## 7. Charts, Metrics, and Dashboards

**Deliberately none. [C]** The aggregate view is [Overview](/overview); this screen's job
is the individual record.

## 8. Available Actions

Change scope · sort · filter. **Read-only — no edit, no add, no delete. [C]**

## 9. Use Cases

### "Show me the survey for this site."
Set scope, find the row, read the verdict and its reasons.

### "Why was this marked Needs revisit?"
The reasons column. Typically the survey contradicts itself — *Rooftop Available? = No*
while roof evidence was recorded.

### "Who surveyed this and how good was the GPS?"
Contractor, employee and GPS accuracy are on the row.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Records and KPIs re-scope | Yes **[C]** |
| New survey extract + rebuild | New records | No — needs a build **[C]** |

## 11. Navigation

**Reached from:** rail → Sites; drill-down from [Overview](/overview) **[I]**.
**Leads to:** [Assets](/assets/condition) for the aggregate condition picture;
[Alarms](/alarms) for defects found in these records.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Surveys in scope | Up to 9 records |
| **Empty** | No surveys in scope | Empty state — very common, since only SASARAM has surveys **[C]** |

## 14. Common Questions

**Q. Why are there only 9 sites?**
A. That is how many rows `Solar PV Site Survey.csv` contains, transcribed field for field.
**[C]**

**Q. My area shows no sites at all.**
A. Surveys exist only under SASARAM / Kaimur. The consumer master covers JAMUI, and the two
extracts do not overlap. **[C]**

**Q. What is the difference between Sites and Assets?**
A. Sites is the **record browser** — one row per survey. [Assets](/assets/condition) is the
**aggregate condition picture** built from the same 9 records. **[C]**

**Q. Why is there no chart?**
A. It would duplicate Overview's *Registered by area* for no reason. This screen exists for
the individual record. **[C]**

**Q. Can I edit a survey?**
A. No. Read-only; corrections happen upstream and arrive with the next extract. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| No sites in my area | Surveys only exist under SASARAM | Expected **[C]** |
| Counts differ from Overview | They should not — same functions | Check scope matches; otherwise report it **[C]** |
| A verdict looks wrong | Transcribed as recorded | Correct upstream, re-import **[C]** |

## 16. AI Assistant Questions

- "Why are there only 9 sites?"
- "What is the difference between the Sites and Assets screens?"
- "Why does my area show no sites?"
- "What does Needs revisit mean?"
- "Where does the site survey data come from?"
- "Can I edit a survey record?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Whether more survey extracts are expected | Not recorded | Data-supply agreement |
| API / database | No backend | The API specification |
| Whether surveys will become editable | No write path | Roadmap |
