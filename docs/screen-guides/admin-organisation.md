---
route: /admin/organisation
page: src/pages/admin-organisation.jsx
title: Administration — Organisation
status: reviewed
updated: 2026-08-24
aliases: [hierarchy, org structure, circles districts panchayats, discom structure, areas]
dataModules: [src/lib/hierarchy.jsx]
relatedScreens: [/overview, /sites]
---

# Administration — Organisation

> The **whole** discom hierarchy, flattened — every node from every level, browsable and
> exportable in one place.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists. [C]**

> *"The full discom hierarchy, flattened — every node from every level, not just the current
> scope's children the way Overview's table shows. This is the admin reference view: browse
> or export the whole structure at once. Every row is real, generated from the two source
> CSVs at build time."*

**When you would come here.** Finding a node's full path. Exporting the structure. Checking
whether an area exists in the data at all.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Admin / Super Admin** | Reference and export the structure |
| **Analyst** | Confirm a node's place in the hierarchy |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/admin/organisation` **[C]** |
| **Navigation** | Rail → Administration → Organisation |

## 4. Screen Layout

```
Title              Organisation
KPI strip          Circles · Districts · … · Panchayats
Table              Every node, flattened depth-first, each row carrying its
                   parent path and its own rollup
```

## 5. Component-by-Component Guide

### KPI strip

Counts per level — Circles, Districts, … Panchayats **[C]**.

### Table — All nodes

| | |
|---|---|
| **Rows** | Every node from every level, depth-first **[C]** |
| **Per row** | id, name, level, **parent path**, and its own rollup **[C]** |
| **Contrast with Overview** | Overview's table shows only the current scope's **children**; this shows **everything** **[C]** |
| **Registered rollup** | Sums `registered`, which sits **only on panchayat leaves** — putting a count on an interior node too would double-count **[C]** |

## 6. Data Sources and Data Flow

```
Solar PV Consumer Master.csv   9,673 rows · JAMUI
Solar PV Site Survey.csv       9 rows · SASARAM / Kaimur
  └─> src/lib/hierarchy-data.js    [GENERATED — DO NOT HAND-EDIT]
       └─> src/lib/hierarchy.jsx
            └─> admin-organisation.jsx → flattened table
```

| Displayed value | Source | Mark |
|---|---|---|
| Every node | generated from the two CSVs at build time | **[C]** |
| Registered rollup | `registered` on panchayat leaves | **[C]** |
| Node ids | **generated slugs** — the source `* Code` columns are not usable as ids **[C]** |
| API / database | — | **[U]** |

**Why some branches show zero. [C]** The SASARAM branch carries `registered: 0` at every
leaf because those consumers are not in the master extract — the two files do not overlap.

## 7. Charts, Metrics, and Dashboards

The KPI strip is in §5. No charts.

## 8. Available Actions

Browse · export **[I]**. **Read-only — the hierarchy is generated, not editable. [C]**

## 9. Use Cases

### "What is this panchayat's full path?"
Find the row; the parent path is on it.

### "Export the whole structure."
Use the table's export.

### "Does this area exist in our data?"
If it is not here, it is not in either extract.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| New extract + rebuild | The hierarchy | No — generated at build time **[C]** |
| Anything in the UI | Nothing — read-only | **[C]** |

## 11. Navigation

**Reached from:** rail → Administration → Organisation.
**Leads to:** [Overview](/overview) scoped to an area **[I]**.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Always | The full hierarchy **[C]** |
| **Zero-registered branches** | SASARAM | `0` at every leaf — expected **[C]** |

## 14. Common Questions

**Q. Why do some areas show 0 registered?**
A. The SASARAM branch carries zero at every leaf because those consumers are not in the
consumer master. The two extracts cover different circles and do not overlap. **[C]**

**Q. Can I add or rename an area?**
A. No. The hierarchy is **generated from the source CSVs at build time** and the generated
file carries a DO-NOT-HAND-EDIT banner. Changes happen in the source data. **[C]**

**Q. Why do node ids look like slugs?**
A. They are generated. The source `* Code` columns are not usable as ids. **[C]**

**Q. How is this different from Overview's table?**
A. Overview shows the current scope's **children**. This shows **every node at every
level**. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| An area is missing | Not in either extract | Check the source data **[C]** |
| Zero registered | SASARAM branch | Expected **[C]** |
| Cannot edit | Generated | Change the source and re-import **[C]** |

## 16. AI Assistant Questions

- "How do I find an area's full path?"
- "Why do some areas show 0 registered consumers?"
- "Can I add a new area?"
- "How is Organisation different from Overview's table?"
- "Where does the hierarchy come from?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Export format | Not verified | Read the page |
| Whether the hierarchy will become editable | Generated by design | Product decision |
| API / database | No backend | The API specification |
