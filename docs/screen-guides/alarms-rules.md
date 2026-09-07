---
route: /alarms/rules
page: src/pages/alarms-rules.jsx
title: Alarms — Rules
status: reviewed
updated: 2026-08-24
aliases: [thresholds, bands, alarm rules, limits, band registry, metric thresholds]
dataModules: [src/lib/bands.js]
relatedScreens: [/alarms, /telemetry/bms, /telemetry/ups, /telemetry/meter]
---

# Alarms — Rules

> The thresholds that decide what counts as good, bad or unjudgeable.
> **Editing here changes the product immediately.**

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **This is the one admin screen whose edits are load-bearing today.** Contrast with
> [Roles](admin-roles.md), which governs nothing.

---

## 1. Overview

**No fixtures — this is the live registry. [C]**

> *"This screen has no fixtures. It is a view of `src/lib/bands.js`, which is the live
> registry every `<BandedValue>` in the product already resolves through — so what is shown
> here IS what the platform enforces, and the two cannot drift."*

### Editing here changes the product, immediately **[C]**

> *"Unlike the roles matrix, which governs nothing until an auth layer exists, these
> thresholds are load-bearing today. Every `bandFor` call reads the registry at call time,
> so moving a bound repaints Alarms, Overview and every telemetry grid on the next render.
> That is the reason to make it editable — it is the only way to see what a threshold change
> actually costs before committing to it — and it is why the banner says so rather than
> letting someone discover it."*

**When you would come here.** Understanding why a value is banded the way it is. Testing
what a threshold change would do. Auditing which thresholds are still assumptions.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Analyst** | Why a value bands the way it does |
| **Admin / Super Admin** | Tune thresholds and see the cost |
| **Service Engineer** | What limit triggered an alarm |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).
> **On this screen that gap matters more than anywhere else** — the edits are real.

## 3. How to Access It

| | |
|---|---|
| **Route** | `/alarms/rules` **[C]** |
| **Navigation** | Rail → Alarms → Rules |

## 4. Screen Layout

```
Title              Rules
Banner             warns that edits take effect immediately
KPI strip          All metrics · Changed from shipped · On seed thresholds ·
                   Gated on nameplate
Table              Metrics and their bounds — editable
```

## 5. Component-by-Component Guide

### KPI — All metrics

Every metric in the band registry **[C]**.

### KPI — Changed from shipped

| | |
|---|---|
| **Purpose** | How far the current thresholds have drifted from what shipped |
| **Use** | The artefact worth keeping after a tuning session **[I]** |

### KPI — On seed thresholds

| | |
|---|---|
| **Purpose** | How many thresholds are still **assumptions** rather than measured values |
| **Why it matters** | A `[seed]` threshold banding real telemetry is a guess with a colour on it. This tile counts them **[C]** |

### KPI — Gated on nameplate

| | |
|---|---|
| **Purpose** | Metrics that cannot band until the device registry carries the required nameplate field |
| **Example** | UPS load % needs `rated_va` — see [UPS](telemetry-ups.md) **[C]** |

### Table — Metrics

| | |
|---|---|
| **Data source** | `src/lib/bands.js` — the **live** registry **[C]** |
| **Editing** | Changes take effect **on the next render**, product-wide **[C]** |
| **Persistence** | **[U]** — whether an edit survives a reload is not verified for this guide |

## 6. Data Sources and Data Flow

```
src/lib/bands.js          the live band registry
  ├─> alarms-rules.jsx    this screen — a VIEW, not a copy
  └─> every <BandedValue> in the product
        └─> bandFor() reads the registry AT CALL TIME
             └─> moving a bound repaints Alarms, Overview and every telemetry grid
```

| Displayed value | Source | Mark |
|---|---|---|
| Every threshold | `bands.js`, live | **[C]** |
| Seed count | thresholds marked `[seed]` | **[C]** |
| API / database | — | **[U]** |

## 7. Charts, Metrics, and Dashboards

The KPI strip is in §5. No charts.

## 8. Available Actions

### Edit a threshold

| | |
|---|---|
| **Preconditions** | None — **and that is worth noting** |
| **Expected result** | Every affected value in the product rebands on the next render **[C]** |
| **Data affected** | Presentation and alarm banding — **not** the underlying measurements **[C]** |
| **Reversibility** | *Changed from shipped* shows the drift **[C]**; per-edit undo is **[U]** |
| **Caution** | This screen has real consequences and no permission check **[C]** |

## 9. Use Cases

### "Why is this reading amber?"
Find the metric, read its bounds.

### "What would happen if we loosened this limit?"
Change it and look at [Alarms](/alarms) and the telemetry screens — which is precisely why
it is editable.

### "Which thresholds are still guesses?"
**On seed thresholds**.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Edit a bound | Every affected banded value | **Yes — next render, product-wide** **[C]** |
| A metric gains its nameplate | It stops being gated | Next extract **[C]** |

## 11. Navigation

**Reached from:** rail → Alarms → Rules.
**Leads to:** [Alarms](/alarms) and the telemetry screens to see the effect.

## 12. Roles and Permissions

**Not permission-gated. [C]** Anyone who can open the app can change thresholds that
repaint the whole product.

**[I]** This is the **strongest candidate on the platform** for the first real permission
check — it is the only unrestricted screen whose edits change what everyone else sees.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Always | The registry **[C]** |
| **Changed** | After an edit | *Changed from shipped* rises **[C]** |
| **Gated** | Metric needs a nameplate | Marked as such **[C]** |

## 14. Common Questions

**Q. Does editing here actually change anything?**
A. Yes — immediately, product-wide. Every `bandFor` call reads the registry at call time,
so moving a bound repaints Alarms, Overview and every telemetry grid on the next render.
**[C]**

**Q. How is this different from the Roles screen?**
A. Roles governs nothing until an auth layer exists. **These thresholds are load-bearing
today.** **[C]**

**Q. What does "on seed thresholds" mean?**
A. Thresholds that are still assumptions rather than measured values. A seed threshold
banding real telemetry is a guess with a colour on it. **[C]**

**Q. What does "gated on nameplate" mean?**
A. The metric cannot band until the device registry carries a required field — UPS load %
needs `rated_va`. **[C]**

**Q. Do my changes persist?**
A. **[U]** — not verified for this guide.

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Values rebanded unexpectedly | Someone edited a threshold | Check *Changed from shipped* **[C]** |
| A metric never bands | Gated on a missing nameplate | Complete it on [Devices](/assets) **[C]** |
| Thresholds look arbitrary | Some are seeds | Check the seed count **[C]** |

## 16. AI Assistant Questions

- "Does editing an alarm rule change the product immediately?"
- "What is a seed threshold?"
- "What does gated on nameplate mean?"
- "Why is this reading amber instead of green?"
- "How is the Rules screen different from the Roles screen?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Whether threshold edits persist | Not verified | Read `alarms-rules.jsx` / `bands.js` |
| Whether per-edit undo exists | Not verified | Same |
| Which thresholds are seeds vs measured | Counted, not enumerated here | Read `bands.js` |
| Whether this will be permission-gated | No enforcement exists | The RBAC decision |
