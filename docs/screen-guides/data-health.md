---
route: /data/health
page: src/pages/data-health.jsx
title: Data — Ingestion Health
status: reviewed
updated: 2026-08-24
aliases: [ingestion health, pipeline health, is data arriving, parse errors, latency, lag]
dataModules: [src/lib/hierarchy.jsx, src/lib/bands.js, src/lib/device-data.js, src/lib/gti-parse.js, src/lib/device-samples.js]
relatedScreens: [/data/import, /data/history, /telemetry/gti/data, /telemetry/meter]
---

# Data — Ingestion Health

> Is data arriving, how late is it, and did it parse? **Everything here is measured, not
> configured.**

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists.** To tell you whether the pipeline is working, using measurements
rather than assumptions.

**Two independent clocks, and the gap between them IS the lag. [C]**

> *"The four real gateway payloads carry two independent clocks — the filename is UTC, the
> payload `TIMESTAMP` is IST — and the gap between them IS the ingestion lag. That is why
> `timestamp` and `insertedOn` are separate fields on every parsed row rather than one
> normalised stamp."*

Normalising them into one stamp would have destroyed the only measurement this screen
exists to take.

### The screen answers three questions and **refuses a fourth** **[C]**

| # | Question | Answer |
|---|---|---|
| 1 | **Is data arriving?** | Per stream, **with the reason where it is not** |
| 2 | **How late is it?** | Measured lag, against the device's own declared `STINTERVAL` — **not a constant** |
| 3 | **Did it parse cleanly?** | Failed reads and sentinels, counted |
| 4 | **Is the FLEET healthy?** | **Refused.** Four messages from two gateways is a sample, and a parse-rate percentage over n=4 would read as a fleet statistic. **The banner says so** |

That refusal is the most important thing on the screen. A number that looks like a fleet
statistic but is computed from four messages would be **worse than no number**.

**When you would come here.** A figure looks stale. Checking whether a stream has stopped.
Investigating clock or lag problems.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Admin / Super Admin** | Is the pipeline working |
| **Service Engineer** | Which stream stopped, and why |
| **Analyst** | Whether data is fresh enough to quote |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/data/health` **[C]** |
| **Navigation** | Rail → Data → Health |

## 4. Screen Layout

```
Title              Ingestion health
Banner             the sample-size refusal — read this first
Context bar        Scope · Level · Messages in scope
Per-stream rows    GTI Data · GTI Heartbeat · GTI Info · GTI On-demand · BMS · …
Table              measured lag, parse results, sentinels
```

## 5. Component-by-Component Guide

### The sample-size banner

| | |
|---|---|
| **Purpose** | Stop a reader treating these figures as fleet statistics |
| **What it says** | The data is a sample — four messages from two gateways (`SAMPLE_SCOPE`) **[C]** |
| **Why it exists** | A parse-rate percentage over n=4 would read as a fleet number **[C]** |
| **Read it first.** | Every figure below is scoped by it |

### Per-stream arrival

| | |
|---|---|
| **Streams** | GTI Data · GTI Heartbeat · GTI Info · GTI On-demand · BMS · and the rest **[C]** |
| **What it shows** | Whether that stream has messages — **and the reason where it does not** **[C]** |
| **Why the reason matters** | "No messages" and "no extract received" are different problems |

### Measured lag

| | |
|---|---|
| **Calculation** | Filename UTC minus payload IST **[C]** |
| **Judged against** | The device's **own declared `STINTERVAL`**, not a constant **[C]** |
| **Why** | A device that reports hourly is not late at 20 minutes; one that reports every 15 is |

### Parse results and sentinels

| | |
|---|---|
| **What it shows** | Failed reads and sentinel values, **counted** **[C]** |
| **Why counted, not rated** | A percentage over four messages would look like a fleet parse rate **[C]** |

## 6. Data Sources and Data Flow

```
gateway payload files
  ├─ filename        UTC
  └─ payload TIMESTAMP   IST
        └─> src/lib/gti-parse.js    keeps `timestamp` and `insertedOn` SEPARATE
             └─> src/lib/device-samples.js  (SAMPLE_SCOPE = 4 messages, 2 gateways)
                  └─> data-health.jsx → arrival · lag · parse results
```

| Displayed value | Source | Derivation | Mark |
|---|---|---|---|
| Ingestion lag | two clocks on the same message | UTC − IST | **[C]** |
| Lateness | lag vs the device's declared `STINTERVAL` | comparison | **[C]** |
| Parse failures / sentinels | the parser | counted | **[C]** |
| Fleet health | **refused** | — | **[C]** |
| API / database | — | | **[U]** |

**Sample size: four messages from two gateways. [C]** Everything on this screen is scoped
by that.

## 7. Charts, Metrics, and Dashboards

Metrics are documented in §5. **No metric here is expressed as a fleet percentage, on
purpose.**

## 8. Available Actions

Change scope · read. **Read-only. [C]**

## 9. Use Cases

### "Has ingestion stopped?"
Per-stream arrival. Where a stream is empty, the reason is stated.

### "Why is this reading old?"
Measured lag, judged against that device's own interval.

### "What's our parse success rate?"
**The screen refuses to tell you**, because four messages cannot produce a fleet rate. Use
the counts. §14.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | Messages in scope | Yes **[C]** |
| New payloads + rebuild | New measurements | No — needs a build **[C]** |
| A device changing its `STINTERVAL` | What counts as late | Next message **[C]** |

## 11. Navigation

**Reached from:** rail → Data → Health.
**Leads to:** [GTI](/telemetry/gti/data) for the stream itself; [Batch
history](/data/history); [Meter](/telemetry/meter) for clock skew.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Sample banner** | Always | The n=4 warning **[C]** |
| **Stream present** | Messages exist | Arrival, lag, parse results |
| **Stream absent** | No messages | **The reason**, not a blank **[C]** |
| **Fleet health** | Always | **Refused** — no such figure **[C]** |

## 14. Common Questions

**Q. What is ingestion lag exactly?**
A. Gateway payloads carry two independent clocks — the filename is UTC, the payload
`TIMESTAMP` is IST. The gap between them is the lag. They are kept as separate fields for
exactly this reason; normalising them would destroy the measurement. **[C]**

**Q. Why won't the screen show a parse success rate?**
A. Four messages from two gateways is a sample. A percentage over n=4 would read as a fleet
statistic and mislead. The banner says so, and counts are shown instead. **[C]**

**Q. How does it decide a message is late?**
A. Against the device's **own declared `STINTERVAL`**, not a fixed threshold. A device
reporting hourly is not late at 20 minutes. **[C]**

**Q. A stream shows nothing — is it broken?**
A. Read the reason next to it. "No messages of this type" and "no extract received" are
different problems. **[C]**

**Q. Is this the same as meter clock skew?**
A. No. Ingestion lag is the gap between the **file's** clock and the **payload's** clock.
Meter clock skew is the **meter's own RTC** against the message — see
[Meter](/telemetry/meter). **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| A stream is empty | No messages, or no extract | Read the stated reason **[C]** |
| Lag looks large | Real, measured | Check the gateway's upload path **[I]** |
| No overall health % | Deliberately refused | Use the counts **[C]** |
| Numbers seem small | Sample is 4 messages | Expected **[C]** |

## 16. AI Assistant Questions

- "What is ingestion lag and how is it measured?"
- "Why doesn't the Data health screen show a parse success rate?"
- "How does the platform decide a message is late?"
- "What is the difference between ingestion lag and meter clock skew?"
- "Why does a stream show no messages?"
- "How many messages is the health screen based on?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Fleet-wide health | Refused at n=4 | A larger extract |
| API / database | No backend | The API specification |
| Whether lag is stable at scale | Four messages | More payloads |
| The full stream list once real data arrives | Only GTI observed | The DMS extract |
