---
route: /data/history
page: src/pages/data-history.jsx
title: Data — Batch History
status: reviewed
updated: 2026-08-24
aliases: [ingest history, load history, batches, imports, rollback, what was loaded]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js, src/lib/device-data.js, src/lib/device-samples.js]
relatedScreens: [/data/import, /data/health]
---

# Data — Batch History

> The record you check when a number looks wrong: **what was loaded, and when**.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **Rollback is not available, and the reason is interesting.** See §1 and §14.

---

## 1. Overview

**Why this screen exists. [C]**

> *"Three ingests have actually happened and this screen lists those three. It does not
> simulate a longer history: a batch list padded to look busy is the one thing this screen
> must never do, because its whole purpose is to be the record you check when a number
> looks wrong."*

### Rollback is the honest gap **[C]**

> *"`dashboard-ia.md` §5.7 specifies 'batch history with rollback by `import_batch_id`'. No
> source row carries a batch id — the consumer master's only provenance is a `Created On`
> stamp, and the surveys carry a submission time per row and nothing tying them into a
> load. So rollback has no key to operate on, and the column states that rather than
> offering a disabled button that implies the feature exists and is merely switched off."*

### The consumer master is one row made of eight loads **[C]**

> *"Its own `Created On` values say it arrived in EIGHT batches on one day, of which we hold
> the last stamp. So the row is one logical extract made of eight physical loads we cannot
> separate — shown as such, not silently flattened to one."*

That is the clearest example on the platform of the product **showing the limit of its own
knowledge** rather than presenting a tidy fiction.

**When you would come here.** A figure looks wrong and you want to know which load produced
it. Confirming an extract arrived. Understanding why rollback is unavailable.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Admin / Super Admin** | What has been loaded |
| **Analyst** | Provenance for a figure they are about to quote |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/data/history` **[C]** |
| **Navigation** | Rail → Data → History |

## 4. Screen Layout

```
Title              Batch history
Notice             Alert about rollback
KPI strip          Ingests on record · Rows across all
Table              Ingests — including the rollback column that states why it cannot
```

## 5. Component-by-Component Guide

### KPI — Ingests on record

**Three. [C]** Real ingests, not a simulated history.

### KPI — Rows across all

Total rows across the three ingests **[C]**.

### Table — Ingests

| | |
|---|---|
| **Rows** | Three, one per real ingest **[C]** |
| **The consumer master row** | One logical extract made of **eight physical loads**, shown as such because they cannot be separated **[C]** |
| **Rollback column** | **States why rollback is impossible** — no source row carries a batch id **[C]** |
| **Why not a disabled button** | A disabled button implies the feature exists and is switched off. It does not exist, because there is no key to operate on **[C]** |

## 6. Data Sources and Data Flow

```
Solar PV Consumer Master.csv   `Created On` stamps → 8 loads, last stamp held
Solar PV Site Survey.csv       per-row submission times, no load key
gateway payloads               via device-samples.js
      └─> data-history.jsx → three ingest rows

(no import_batch_id anywhere)  → rollback has no key
```

| Displayed value | Source | Mark |
|---|---|---|
| Three ingests | the real loads | **[C]** |
| Consumer master = 8 physical loads | its own `Created On` values | **[C]** |
| Row counts | the extracts | **[C]** |
| `import_batch_id` | **does not exist in any source** | **[C]** |
| API / database | — | **[U]** |

## 7. Charts, Metrics, and Dashboards

No charts. The KPI strip is in §5.

## 8. Available Actions

Read the history. **Rollback is unavailable — no key exists. [C]** No other write actions.

## 9. Use Cases

### "This number looks wrong — which load produced it?"
Find the ingest here, then check [Ingestion health](/data/health).

### "Can we undo the last import?"
No. §14.

### "Did the survey extract actually arrive?"
It is one of the three rows.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Row counts may re-scope **[I]** | Yes |
| A new ingest + rebuild | A fourth row | No — needs a build **[C]** |

## 11. Navigation

**Reached from:** rail → Data → History.
**Leads to:** [Import](/data/import); [Ingestion health](/data/health).

## 12. Roles and Permissions

Not permission-gated **[C]**.

**[I]** Rollback, if it ever exists, would be the clearest admin-only action on the
platform.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Always | Three ingests **[C]** |
| **Rollback unavailable** | Always | The column states why **[C]** |

## 14. Common Questions

**Q. Why can't I roll back an import?**
A. Rollback needs a key to operate on, and **no source row carries a batch id**. The
consumer master's only provenance is a `Created On` stamp; the surveys carry a per-row
submission time and nothing tying them into a load. The column states that rather than
offering a disabled button that would imply the feature exists and is switched off. **[C]**

**Q. Why does the consumer master row mention eight loads?**
A. Its own `Created On` values say it arrived in eight batches on one day, and we hold only
the last stamp. It is one logical extract made of eight physical loads we cannot separate,
so it is shown that way rather than flattened to one. **[C]**

**Q. Only three ingests — is the history truncated?**
A. No. Three have happened. A list padded to look busy would defeat the screen's purpose.
**[C]**

**Q. How do I get rollback?**
A. The source data must carry an `import_batch_id`. Until then there is nothing to roll
back by. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| No rollback button | No batch id exists | Expected **[C]** |
| Only three rows | Three ingests | Expected **[C]** |
| Cannot trace a figure to one load | Consumer master is 8 loads under one row | Known limit **[C]** |

## 16. AI Assistant Questions

- "Why can't I roll back an import?"
- "What is an import batch id and why doesn't it exist here?"
- "Why does the consumer master show eight loads?"
- "How many ingests have happened?"
- "How do I find which load produced a wrong number?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Whether sources will ever carry a batch id | Not agreed | Data-supply agreement |
| Whether rollback will be built | Blocked on the above | Roadmap |
| API / database | No backend | The API specification |
