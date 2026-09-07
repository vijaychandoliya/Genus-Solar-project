---
route: /telemetry/meter
page: src/pages/telemetry-meter.jsx
title: Meter Telemetry
status: reviewed
updated: 2026-08-24
aliases: [net metering, revenue meter, import export, billing registers, meter readings, MS fields]
dataModules: [src/lib/hierarchy.jsx, src/lib/device-data.js, src/lib/bands.js]
relatedScreens: [/telemetry/gti/data, /assets, /data/health, /reports]
---

# Meter Telemetry

> Net metering from the rooftop **revenue meter** — import and export registers on a
> single-phase C3 meter. **This is what the consumer is paid on.**

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists.** Because of what the payloads turned out to contain. **[C]**

The source DMS labels this stream *"GTI Data"* and shows five envelope columns — Msg ID,
Max Index, Index, Load, Timestamp — **then discards the sixty-odd meter fields underneath**:
voltage, frequency, power factor, import and export energy, max demand, billing registers,
tamper status, and the meter's own nameplate.

> *"Import AND export registers on a Genus single-phase C3 meter is net metering. That is
> the rooftop's revenue meter, and it is the most consequential data in the whole payload —
> it is what the consumer is paid on."* **[C]**

**Three columns here have no equivalent anywhere in the source system. [C]**

| Column | What it catches |
|---|---|
| **Meter clock skew** | The meter's own RTC against the message that carried it. One sample gateway is **25 days behind**, the other **72 days ahead**, and each one's billing stamps agree with its own wrong clock. **Nothing else on the row looks wrong** — which is exactly why this needs a column |
| **Ingestion lag** | Filename UTC minus payload IST. 4–5 s in the sample |
| **Power factor (withheld)** | At zero current, PF is a **register default, not a measurement**, so it resolves `unknown` rather than to a false green |

**When you would come here.** Checking what a rooftop exported. Investigating a billing
dispute. Verifying a meter's clock before trusting its timestamps.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Analyst** | Import/export and billing registers |
| **Service Engineer** | Clock skew, tamper status, meter health |
| **Admin / Super Admin** | Whether revenue data is arriving intact |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/telemetry/meter` **[C]** |
| **Navigation** | Rail → Telemetry → Meter |
| **Related** | [`/telemetry/gti/data`](/telemetry/gti/data) shows the same messages' **envelope**; this screen shows the meter **body** **[C]** |

## 4. Screen Layout

```
Title / subtitle   Meter — "Net metering from the rooftop revenue meter, carried in
                   the gateway's Data messages…"
Context bar        Scope · Level · Readings
Filter bar
Table              Meter readings
Dialog             Meter payload — the raw MS-* body
Empty state        "No meter readings in scope"
```

## 5. Component-by-Component Guide

### Table — Meter readings

| | |
|---|---|
| **Purpose** | One row per meter reading carried in a gateway Data message |
| **Data source** | The `MS-*` body of every gateway **Data** message, via `device-data.js` **[C]** |
| **Notes** | The source DMS shows only the envelope and discards this body **[C]** |

### Column — Meter clock skew

| | |
|---|---|
| **What it represents** | The meter's own real-time clock against the message that carried the reading |
| **Why it matters** | A gateway 25 days behind and another 72 days ahead **both look normal on every other column**, and each one's billing stamps agree with its own wrong clock **[C]** |
| **What to do** | Treat that meter's timestamps — and anything derived from them — as suspect until the clock is corrected **[I]** |

### Column — Ingestion lag

| | |
|---|---|
| **Calculation** | Filename UTC minus payload IST **[C]** |
| **Observed** | 4–5 seconds in the sample **[C]** |

### Column — Power factor

| | |
|---|---|
| **Behaviour** | **Withheld** at zero current — resolves `unknown`, not a value **[C]** |
| **Why** | At zero current PF is a register default, not a measurement. Showing it would produce a false green **[C]** |

### Dialog — Meter payload

| | |
|---|---|
| **Trigger** | Opening a row's payload **[C]** |
| **Shows** | The raw `MS-*` body, so a disputed figure can be traced to the field it came from |

## 6. Data Sources and Data Flow

```
Gateway "Data" messages   →   MS-* body (sixty-odd meter fields)
   └─> src/lib/gti-parse.js
        └─> src/lib/device-data.js
             └─> telemetry-meter.jsx → Meter readings table
                  └─> clock skew, ingestion lag computed per row
```

| Displayed value | Source | Derivation | Mark |
|---|---|---|---|
| Import / export energy, max demand, billing registers, tamper | `MS-*` payload body | as sent | **[C]** |
| Meter clock skew | payload RTC vs message time | difference | **[C]** |
| Ingestion lag | filename UTC vs payload IST | difference | **[C]** |
| Power factor | payload | **withheld at zero current** | **[C]** |
| API / database | — | | **[U]** |

**Update frequency.** Not live; bundled at build time **[C]**.

## 7. Charts, Metrics, and Dashboards

No charts. Metrics are columns — see §5.

## 8. Available Actions

Change scope · filter · open the payload dialog. **No write actions. [C]**

## 9. Use Cases

### "What did this rooftop export last period?"
Read the export register. Check **Meter clock skew** first — if the clock is wrong, the
period boundaries are wrong too.

### "A consumer disputes their bill."
Open the payload dialog and trace the disputed figure to the field it came from.

### "Why is power factor blank?"
Zero current. PF there is a register default, not a measurement.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Rows re-scope | Yes **[C]** |
| Open payload | Dialog with the raw body | Yes **[C]** |
| Meter clock drifts | Skew column grows | Next reading **[C]** |

## 11. Navigation

**Reached from:** rail → Telemetry → Meter.
**Leads to:** [GTI Data](/telemetry/gti/data) for the envelope; [Devices](/assets);
[Data health](/data/health).

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

**[I]** Billing-relevant data is a natural candidate for restriction if enforcement is
added.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Empty** | No meter readings in scope | *No meter readings in scope* **[C]** |
| **Populated** | Data messages present | The table |
| **PF unknown** | Zero current | Grey with the reason **[C]** |
| **Large clock skew** | Meter RTC wrong | A skew value — everything else looks normal **[C]** |

## 14. Common Questions

**Q. Why does this screen exist when the DMS already has "GTI Data"?**
A. The DMS shows five envelope columns and discards the sixty-odd meter fields underneath —
including import, export, max demand and billing registers. Those are what the consumer is
paid on. **[C]**

**Q. What is meter clock skew and should I worry?**
A. The meter's own clock against the message that carried the reading. One sample gateway
is 25 days behind and another 72 days ahead. It matters because every other column looks
normal, and the meter's billing stamps agree with its own wrong clock. **[C]**

**Q. Why is power factor blank?**
A. Withheld at zero current, where PF is a register default rather than a measurement.
Showing it would produce a false green. **[C]**

**Q. What is ingestion lag?**
A. Filename UTC minus payload IST — 4–5 seconds in the sample. **[C]**

**Q. Is this the same as the GTI Data screen?**
A. Same messages, different half. GTI Data shows the envelope; this shows the meter body.
**[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| No meter readings | No Data messages in scope | Widen scope **[C]** |
| Power factor blank | Zero current | Expected **[C]** |
| Timestamps look wrong | Meter clock skew | Check the skew column **[C]** |
| Figures disagree with a bill | Clock skew, or a different period | Check skew, then the payload dialog **[C]** |

## 16. AI Assistant Questions

- "What is meter clock skew and why does it matter?"
- "Why is power factor blank on the meter screen?"
- "Where do the import and export registers come from?"
- "What is the difference between the Meter screen and GTI Data?"
- "What is ingestion lag?"
- "How do I trace a disputed billing figure?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| API / database / fields | No backend | The API specification |
| Whether skew is corrected upstream | Not recorded | Ask the gateway owner |
| Full list of the sixty-odd MS-* fields | Not enumerated in this guide | Read `src/lib/gti-parse.js` |
| Billing period boundaries | Not modelled in the product | Billing rules |
