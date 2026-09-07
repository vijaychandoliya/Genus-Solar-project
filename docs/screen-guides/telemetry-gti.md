---
route: /telemetry/gti/:tab
page: src/pages/telemetry-gti.jsx
title: GTI Telemetry
status: reviewed
updated: 2026-08-24
aliases: [gateway telemetry, GTI streams, data heartbeat info on-demand, rooftop gateway, message streams]
dataModules: [src/lib/hierarchy.jsx, src/lib/device-data.js, src/lib/gti-parse.js, src/lib/bands.js]
relatedScreens: [/telemetry/meter, /assets, /data/health]
---

# GTI Telemetry

> The rooftop gateway's four message streams — **Data · Heartbeat · Info · On-demand** —
> each one a tab you can link to.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists.** A rooftop gateway does not send one kind of message. It sends
four, and they answer different questions. This screen keeps them separate rather than
flattening them into one table.

**The tabs are route segments, not component state. [C]**

> *"The four tabs match the source DMS exactly (Data · Heartbeat · Info · On-demand), but
> they are ROUTE SEGMENTS, not component state — 'tab state is addressable'. A link to a
> specific stream has to survive being pasted into a ticket, and the source's in-component
> tabs cannot do that."*

So `/telemetry/gti/heartbeat` is a real, shareable address. The source DMS cannot produce
one **[C]**.

**The Info tab is a view, not a store. [C]**

> *"The Info tab is a VIEW of the device registry's nameplate, not a separate store.
> Firmware / hardware / manufacturer / model … belongs on the device, and the registry's
> completeness column depends on it living there."*

That is why editing nameplate belongs on [Devices](/assets), not here.

**When you would come here.** Checking whether a gateway is alive (Heartbeat). Reading what
it reported (Data). Checking its firmware (Info). Seeing a manual poll (On-demand).

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Service Engineer** | Is the gateway alive; what firmware is it on |
| **Analyst** | Raw stream contents |
| **Admin / Super Admin** | Whether the ingestion is working |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/telemetry/gti/:tab` — `data`, `heartbeat`, `info`, `ondemand` **[C]** |
| **Bare route** | `/telemetry/gti` **redirects** to `/telemetry/gti/data` **[C]** |
| **Navigation** | Rail → Telemetry → GTI (points at the Data stream) **[C]** |
| **Deep link** | **Yes — the tab is in the URL.** Paste `/telemetry/gti/heartbeat` into a ticket and it opens there **[C]** |

## 4. Screen Layout

```
Title              GTI
Context bar        Scope · Level · Readings
Tabs               Data · Heartbeat · Info · On-demand      ← route segments
Filter bar
Table              Per-stream columns, transcribed from the DMS,
                   plus freshness and a payload
Empty state        per stream
```

## 5. Component-by-Component Guide

### Tabs

| | |
|---|---|
| **Location** | Under the title |
| **Purpose** | Separate the four streams |
| **Interaction** | Selecting a tab **changes the URL** **[C]** |
| **Why it matters** | Browser back works between streams, and a link to one stream is shareable **[C]** |

### Tab — Data

| | |
|---|---|
| **What it represents** | The gateway's periodic reading messages |
| **Note** | The **envelope**. The meter body inside these messages is on [Meter](/telemetry/meter) **[C]** |

### Tab — Heartbeat

| | |
|---|---|
| **What it represents** | Liveness messages |
| **Known gap** | The gateway half of the nameplate **arrives empty in the heartbeat**, which is why GTI nameplate completeness sits at 50 % **[C]** |

### Tab — Info

| | |
|---|---|
| **What it represents** | Firmware, hardware, manufacturer, model |
| **Important** | A **view of the device registry's nameplate**, not a separate store **[C]** |
| **Why** | That record is the prerequisite for banding anything, and [Devices](/assets) completeness depends on it living on the device **[C]** |

### Tab — On-demand

| | |
|---|---|
| **What it represents** | Responses to a manual poll **[C]** |

### Per-row payload

Transcribed DMS columns **plus freshness and a payload** **[C]** — the two things the
source lacks.

## 6. Data Sources and Data Flow

```
Gateway messages (4 streams)
  └─> src/lib/gti-parse.js        parses each stream
       └─> src/lib/device-data.js  GTI_DATA · GTI_HEARTBEAT · GTI_INFO · GTI_ONDEMAND
            └─> telemetry-gti.jsx → the tab's table

Info tab ──> the same nameplate the device registry holds  (a view, not a copy)
```

| Displayed value | Source | Mark |
|---|---|---|
| Stream rows | gateway payloads via `gti-parse.js` | **[C]** |
| Info tab values | the device registry nameplate | **[C]** |
| Freshness | last message vs interval | **[C]** |
| API / database | — | **[U]** |

**How much data is there?** One GTI device across four message streams in the current
extract **[C]**.

**Update frequency.** Not live; bundled at build time **[C]**.

## 7. Charts, Metrics, and Dashboards

No charts.

## 8. Available Actions

### Switch stream

| | |
|---|---|
| **Steps** | Click a tab |
| **Result** | URL changes; the table shows that stream |
| **Notes** | Back returns to the previous tab **[C]** |

### Change scope · filter · open payload

Read-only. **No write actions. [C]** Editing nameplate belongs on [Devices](/assets).

## 9. Use Cases

### "Is this gateway alive?"
**Heartbeat** tab, then the freshness column.

### "What firmware is it on?"
**Info** tab. To correct it, go to the device registry — Info is a view.

### "Send a colleague the heartbeat stream."
Copy the URL. The tab is in it. **[C]**

### "Why is this device's nameplate only 50 % complete?"
The gateway half arrives empty in the heartbeat, and `rated_kw` is in no stream at all.
See [Devices](/assets). **[C]**

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Select a tab | URL and table | Yes **[C]** |
| Open `/telemetry/gti` | Redirect to `/data` | Yes **[C]** |
| Change scope | Rows re-scope | Yes **[C]** |
| Browser back | Previous tab | Yes **[C]** |

## 11. Navigation

**Reached from:** rail → Telemetry → GTI.
**Leads to:** [Meter](/telemetry/meter) for the message body; [Devices](/assets) for the
registry record.
**Back:** works **between tabs**, because they are routes **[C]**.

## 12. Roles and Permissions

Not permission-gated **[C]**. Read-only.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Messages in scope | The stream's table |
| **Empty** | No messages of that type | That stream's empty state |
| **Heartbeat with empty nameplate half** | Always, today | Blank gateway fields — expected **[C]** |
| **Unknown tab in URL** | Mistyped | **[U]** — behaviour not verified |

## 14. Common Questions

**Q. Why are there four tabs?**
A. A gateway sends four kinds of message and they answer different questions. Flattening
them would lose that. **[C]**

**Q. Can I link to one stream?**
A. Yes — the tab is a route segment, so `/telemetry/gti/heartbeat` is a real address. The
source DMS cannot do this. **[C]**

**Q. What is the difference between the Data tab and the Meter screen?**
A. Same messages. Data shows the envelope; [Meter](/telemetry/meter) shows the sixty-odd
meter fields in the body. **[C]**

**Q. Can I edit firmware on the Info tab?**
A. No. Info is a **view** of the device registry's nameplate. It belongs on the device
because the registry's completeness column depends on it living there. **[C]**

**Q. Why is the gateway part of Info blank?**
A. It arrives empty in the heartbeat. That is also why GTI nameplate completeness reads
50 %. **[C]**

**Q. How many gateways are there?**
A. One, across four streams, in the current extract. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| A tab is empty | No messages of that type in scope | Widen scope **[C]** |
| Info fields blank | Gateway half empty in heartbeat | Expected **[C]** |
| Link opened the wrong stream | Bare `/telemetry/gti` redirects to Data | Link the full path **[C]** |
| Meter fields missing from Data | They are on the Meter screen | Go to [Meter](/telemetry/meter) **[C]** |

## 16. AI Assistant Questions

- "What are the four GTI streams?"
- "Can I link to a specific GTI tab?"
- "What is the difference between GTI Data and the Meter screen?"
- "Why can't I edit firmware on the Info tab?"
- "Why is the gateway nameplate blank?"
- "How many GTI devices are there?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Behaviour for an unrecognised `:tab` value | Not verified | Try it, or read the page |
| API / database / fields | No backend | The API specification |
| Whether `rated_kw` will ever arrive | In no observed stream | Gateway firmware / data-supply |
| On-demand poll trigger mechanism | Not in this product | DMS documentation |
