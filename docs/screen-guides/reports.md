---
route: /reports
page: src/pages/reports.jsx
title: Reports
status: reviewed
updated: 2026-08-24
aliases: [export, extracts, download, reporting, data export, csv export]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js, src/lib/device-data.js]
relatedScreens: [/overview, /sites, /assets/condition, /alarms]
---

# Reports

> A picker over the **same computed views the dashboards use**, with export.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**What this is, honestly. [C]** From the page source:

> *"The report module produces data extracts, not reports… a report answers a question; an
> extract requires the reader to do the work. This is honestly still closer to the extract
> end: it is a picker over real, already-computed views with export, not period-over-period
> comparison — **there is exactly one snapshot of this data, so a trend line would have to
> be invented. No comparison is offered rather than a fabricated one.**"*

**Why the numbers can never disagree with the dashboards. [C]**

> *"Every dataset here reuses the same functions the live dashboards call — Reports and the
> dashboards can never quietly disagree with each other, because they are the same
> computation."*

That is a real guarantee, not a hope: there is one implementation, not two.

**When you would come here.** Exporting a dataset. Getting figures out for a meeting.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Analyst** | Export for further work |
| **Admin / Super Admin** | Figures for reporting upward |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/reports` **[C]** |
| **Navigation** | Rail → Reports |

## 4. Screen Layout

```
Title              Reports
Context bar        Scope · Level
Filter bar         dataset picker
Table              the selected dataset, with export
```

## 5. Component-by-Component Guide

### Dataset picker

| | |
|---|---|
| **Options** | Programme summary · Asset condition · Exceptions · Device report **[C]** |
| **Purpose** | Choose which computed view to see and export |
| **Notes** | Each maps to the same function a dashboard screen uses **[C]** |

### The datasets

| Dataset | Same data as | Expected today |
|---|---|---|
| **Programme summary** | [Overview](/overview) | Real figures **[C]** |
| **Asset condition** | [Assets](/assets/condition) | Real, over 9 records **[C]** |
| **Exceptions** | [Alarms](/alarms) | Real **[C]** |
| **Device report** | [Devices](/assets) | Sparse — device data is largely empty **[C]** |

### Export

| | |
|---|---|
| **Purpose** | Get the selected dataset out of the browser |
| **Scope** | The current scope applies **[I]** |
| **Format** | **[U]** — not verified for this guide |

## 6. Data Sources and Data Flow

```
the SAME functions the dashboards call
  ├─ programme-data.js   summary · exceptions · asset condition
  └─ device-data.js      device report   (largely empty)
        └─> reports.jsx → table → export
```

| Displayed value | Source | Mark |
|---|---|---|
| Every dataset | the dashboards' own functions | **[C]** |
| Period-over-period comparison | **not offered** — one snapshot only | **[C]** |
| API / database | — | **[U]** |

## 7. Charts, Metrics, and Dashboards

**No charts, and no trend lines — deliberately. [C]** There is one snapshot of this data,
so a trend would have to be invented.

## 8. Available Actions

### Choose a dataset · Export

| | |
|---|---|
| **Data affected** | None — read and export only **[C]** |
| **Scope** | Applies to the export **[I]** |

## 9. Use Cases

### "I need the exceptions list in a spreadsheet."
Pick *Exceptions* → export.

### "Show me month-on-month progress."
**Not available.** One snapshot exists; a comparison would be fabricated. §14.

### "Do these numbers match the dashboard?"
Yes, by construction — same functions.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change dataset | The table | Yes **[C]** |
| Change scope | Rows re-scope | Yes **[C]** |
| Export | A file is produced | Yes **[I]** |

## 11. Navigation

**Reached from:** rail → Reports.
**Leads to:** the dashboard screen behind each dataset.

## 12. Roles and Permissions

Not permission-gated **[C]**.

**[I]** Export is a natural candidate for restriction, particularly if any dataset ever
carries consumer names — see the open question on [Alarms](alarms.md#17-known-unknowns).

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Dataset has rows in scope | The table |
| **Empty** | No rows in scope | Empty state |
| **Device report sparse** | Always, today | Little or nothing **[C]** |

## 14. Common Questions

**Q. Can I compare this month with last month?**
A. No. There is exactly one snapshot of this data, so a comparison would have to be
invented. None is offered rather than a fabricated one. **[C]**

**Q. Will these numbers match the dashboards?**
A. Yes — they are the same computation, not a second implementation. **[C]**

**Q. Why is the device report empty?**
A. Device data is empty on purpose pending the DMS extract. **[C]**

**Q. Is this a report or an extract?**
A. Honestly an extract — a picker over computed views with export. A report would answer a
question; an extract asks you to do the work. **[C]**

**Q. What format does export produce?**
A. **[U]** — not verified for this guide.

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Empty dataset | No rows in scope, or device data empty | Widen scope **[C]** |
| No trend option | Deliberately absent | Expected **[C]** |
| Export disagrees with a dashboard | Should be impossible | Check scope; otherwise report it **[C]** |

## 16. AI Assistant Questions

- "Can I compare periods in Reports?"
- "Do the Reports numbers match the dashboards?"
- "Why is the device report empty?"
- "Is this a report or an extract?"
- "Which datasets can I export?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Export file format | Not verified | Read `reports.jsx` |
| Whether trends will ever be offered | Needs more than one snapshot | Data-supply cadence |
| API / database | No backend | The API specification |
