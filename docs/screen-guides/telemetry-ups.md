---
route: /telemetry/ups
page: src/pages/telemetry-ups.jsx
title: UPS Telemetry
status: reviewed
updated: 2026-08-24
aliases: [UPS readings, uninterruptible supply, backup power, inverter mode, bypass]
dataModules: [src/lib/hierarchy.jsx, src/lib/device-data.js, src/lib/bands.js]
relatedScreens: [/assets, /telemetry/bms, /data/health, /alarms]
---

# UPS Telemetry

> Uninterruptible supplies across the fleet. **Mode leads**, because bypass removes
> protection entirely while reporting no fault at all.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **This table is empty today, and that is deliberate.** See §13 and §14.

---

## 1. Overview

**Why this screen exists.** To show whether each UPS is actually protecting its load.

**The source DMS shows Device No., Date Time, Voltage and Load. Two things are added here
and one is corrected. [C]**

### Added — MODE, and it leads

> *"UPS mode = Bypass is the highest-severity state in the fleet and is a band, not a
> status string — bypass removes protection entirely while reporting no fault at all.
> The source screen omits mode entirely, which means the single most dangerous state a UPS
> can be in is invisible in the product that monitors it."* **[C]**

If the extract turns out not to carry the field, **the column says so rather than
disappearing** — an absent field and a healthy field must not look alike **[C]**.

### Added — LOAD as a percentage of rated VA

Shown as reported **and** as a percentage of rated VA, which is the form that answers *"is
this unit about to trip"*. The percentage is **uncomputable until the registry carries
`rated_va`**, so it renders `unknown` with that reason attached rather than as a bare
number that looks like a percentage but is not one **[C]**.

### Corrected — VOLTAGE of 0.00 is silence, not a measurement

41 of the source's 42 rows carry `0.00`. The `grid_voltage` plausibility floor resolves it
to `unknown`, **so the fleet reads as un-reporting rather than as a fleet-wide brownout**
**[C]**. This is the clearest example in the product of a correction that changes a
conclusion: the source data implies a mass outage; the truth is missing data.

**When you would come here.** Checking whether any UPS is on bypass. Investigating a power
alarm. Checking load headroom before adding equipment.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Service Engineer** | Is anything on bypass, and is any unit near its limit |
| **Analyst** | Load trends across the fleet |
| **Admin / Super Admin** | Whether UPS data is arriving |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/telemetry/ups` **[C]** |
| **Navigation** | Rail → Telemetry → UPS |

## 4. Screen Layout

```
Title / subtitle   UPS — "Uninterruptible supplies across the fleet. Mode leads,
                   because bypass removes protection entirely while reporting no
                   fault at all."
Context bar        Scope · Level · Readings
Filter bar
Table              UPS readings — Mode first
Empty state        "Readings not yet ingested"
```

## 5. Component-by-Component Guide

### Column — Mode (leads)

| | |
|---|---|
| **Purpose** | The single most dangerous state a UPS can be in |
| **What it represents** | Operating mode; **Bypass** means the load is unprotected |
| **Treatment** | A **band**, not a status string — bypass is highest-severity **[C]** |
| **If the field is absent** | The column **says so**; it does not disappear. An absent field and a healthy field must not look alike **[C]** |

### Column — Load

| | |
|---|---|
| **What the user sees** | Load as reported, **and** as a percentage of rated VA |
| **Calculation** | load ÷ `rated_va` from the device registry **[C]** |
| **When unknown** | The registry has no `rated_va`. Renders `unknown` **with that reason**, never a bare number that looks like a percentage **[C]** |
| **Fix** | Complete the device's nameplate — visible on [Devices](/assets) **[C]** |

### Column — Voltage

| | |
|---|---|
| **Correction applied** | `0.00` is treated as **silence, not a measurement** **[C]** |
| **Why** | 41 of the source's 42 rows carry `0.00`. Taking them literally would show a fleet-wide brownout that is not happening **[C]** |
| **Result** | Resolves to `unknown` — the fleet reads as un-reporting, which is the truth |

## 6. Data Sources and Data Flow

```
(no source yet)
  └─> src/lib/device-data.js     UPS row array EMPTY ON PURPOSE
       └─> telemetry-ups.jsx → UPS readings → empty state

device nameplate (rated_va)
  └─> required for Load % — absent today, so Load % is `unknown`
```

| Displayed value | Source | Mark |
|---|---|---|
| Every reading | none yet — the DMS holds **42 UPS readings** | **[C]** |
| Load % | needs `rated_va` from the registry | **[C]** |
| API / database | — | **[U]** |

**Update frequency.** Not live; bundled at build time **[C]**.

## 7. Charts, Metrics, and Dashboards

No charts. Metrics are table columns — see §5.

## 8. Available Actions

Change scope · filter · sort. **No write actions. [C]**

## 9. Use Cases

### "Is anything on bypass right now?"
Sort or filter by **Mode**. Bypass is the highest-severity state and is banded as such.

### "Is this UPS near its limit?"
Read **Load %**. If it is `unknown`, the registry is missing `rated_va` — fix it on
[Devices](/assets).

### "The whole fleet shows zero volts — is there an outage?"
Almost certainly not. `0.00` is treated as missing, not measured. See §14.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Rows re-scope | Yes **[C]** |
| Nameplate gains `rated_va` | Load % becomes computable | After the next extract + build **[C]** |
| Reading goes stale | Band withdrawn | On re-render **[C]** |

## 11. Navigation

**Reached from:** rail → Telemetry → UPS.
**Leads to:** [Devices](/assets) to fix a nameplate; [Alarms](/alarms).

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

## 13. Screen States

| State | When | What the user sees | What to do |
|---|---|---|---|
| **Empty** | **Today, always** | *Readings not yet ingested* | Expected — §14 **[C]** |
| **Mode column present but empty** | Extract lacks the field | The column states the field is absent | Expected — deliberate **[C]** |
| **Load % unknown** | No `rated_va` | Grey, with the reason | Complete the nameplate **[C]** |
| **Voltage unknown** | Reported `0.00` | Grey | Correct — §14 **[C]** |

## 14. Common Questions

**Q. Why is this screen empty?**
A. The UPS row array in `device-data.js` is empty on purpose. The DMS holds 42 UPS
readings; no extract has been received. **[C]**

**Q. Why does Load % say unknown when Load has a number?**
A. The percentage needs `rated_va` from the device registry, and it is missing. A bare
number that looks like a percentage but is not one would be worse than saying so. **[C]**

**Q. The whole fleet shows 0 V — is there an outage?**
A. No. 41 of the source's 42 rows carry `0.00`, and the plausibility floor treats that as
**missing**, not measured. The fleet is un-reporting, not browned-out. **[C]**

**Q. Why does Mode lead the table?**
A. Bypass removes protection entirely while reporting no fault. The source DMS omits mode
altogether, which makes the most dangerous state invisible. **[C]**

**Q. The Mode column is there but says the field is absent — is it broken?**
A. No — deliberate. If the extract does not carry mode, the column says so rather than
disappearing, because an absent field and a healthy field must not look alike. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Empty table | No UPS extract | Expected **[C]** |
| Load % unknown | Registry missing `rated_va` | Complete the nameplate on [Devices](/assets) **[C]** |
| Voltage unknown everywhere | Source reports `0.00` | Expected correction **[C]** |
| Mode blank | Extract lacks the field | Expected; the column says so **[C]** |

## 16. AI Assistant Questions

- "Why is the UPS telemetry screen empty?"
- "What does bypass mean and why does Mode lead the table?"
- "Why is UPS Load % unknown?"
- "Why does every UPS show 0 volts?"
- "How do I make Load % work?"
- "How many UPS readings does the DMS hold?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Every reading value | No extract received | The DMS extract |
| Whether the extract carries `mode` | Not yet seen | The extract |
| Whether the registry will carry `rated_va` | Not in any observed payload | Nameplate source decision |
| API / database / fields | No backend | The API specification |
