---
route: /assets
page: src/pages/devices.jsx
title: Devices
status: reviewed
updated: 2026-08-24
aliases: [device registry, assets, equipment list, device list, inverters, gateways]
dataModules: [src/lib/hierarchy.jsx, src/lib/device-data.js, src/lib/bands.js]
features: [src/features/devices]
relatedScreens: [/assets/condition, /telemetry/gti/data, /telemetry/bms, /telemetry/ups, /telemetry/meter, /data/health]
---

# Devices

> Every registered device in the selected area, and — the point of the screen — whether
> its **nameplate is complete enough for its telemetry to be judged at all**.

**Evidence marks:** **[C]** confirmed from code or source data · **[I]** inferred, evidence
named · **[U]** unknown — never guessed.

> ⚠️ **The route is `/assets`, not `/devices`. [C]** A known trap: `src/pages/devices.jsx`
> is mounted at `/assets`, and `/assets/condition` is a *different* screen
> (`assets.jsx`). Typing `/devices` redirects to Overview.

---

## 1. Overview

**Why this screen exists.** It is the device registry, and it leads with **nameplate
completeness** because an incomplete nameplate is *why a device's telemetry cannot be
banded*. If we do not know a gateway's rated kW, its yield cannot be judged good or bad —
it can only be displayed.

**Four deliberate differences from the source DMS screen. [C]** From the first comment in
[`src/pages/devices.jsx`](../../src/pages/devices.jsx):

1. **No consumer PII.** The source screen leads with Consumer Name, Mobile No. and Owning
   User Email. This shows the consumer **number** only — already public in the survey
   extract — and leaves the rest server-side.
2. **Nameplate completeness is the lead column** after identity, because it is the point
   of the screen. The source screen has no equivalent, so nothing there tells you why a
   pack reads *unknown*.
3. **Freshness on every row.** The source shows a timestamp with no judgement attached;
   one of its GTI devices last reported over two months ago and the screen says nothing.
4. **A named row menu**, not three unlabelled icon buttons.

**When you would come here.** Auditing which devices are missing specs. Finding a device
by number. Checking whether a device is still reporting. Getting to a device's raw payload.

## 2. Who Uses This Screen

| Role | Why they come here |
|---|---|
| **Service Engineer** | Which devices are stale or missing nameplate data |
| **Admin / Super Admin** | Registry completeness across the fleet |
| **Analyst** | Whether telemetry can be judged before quoting a figure |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).
> No route guard exists; anyone who can open the app can open this screen.

## 3. How to Access It

| | |
|---|---|
| **Route** | `/assets` **[C]** |
| **Navigation** | Rail → Assets |
| **Deep link** | `/assets`. Scope, class filter and search are **not** in the URL, so a shared link does not carry them **[C]** |
| **Not** | `/devices` — no such route **[C]** |

## 4. Screen Layout

```
Breadcrumbs / title    Devices
Context bar            Scope · Level · Devices in scope · interval note
Filter bar             Class dropdown · "Device or consumer no." search
─────────────────────────────────────────────────────────────────────
Table                  Registry — first column frozen, 10 rows per page
  Device no. · Class · Meter · Nameplate · Reporting · Last reading ·
  System · Dealer · Consumer no. · State · ⋮
Row menu               View raw record · Edit nameplate (disabled) ·
                       Assign to user (disabled)
Dialog                 Raw record as JSON
```

## 5. Component-by-Component Guide

### Filter bar — Class

| | |
|---|---|
| **Location** | Above the table |
| **Purpose** | Narrow to one device class |
| **What the user sees** | All classes · UPS · BMS · GTI **[C]** |
| **Data source** | A static list in the page — UI configuration, **not** data **[C]** |
| **User interaction** | Select → table refilters |
| **Notes** | `meter` is a class in the domain model but **not offered in this dropdown** **[C]** — see §17 |

### Filter bar — Search

| | |
|---|---|
| **Purpose** | Find a device by number or consumer number |
| **Data fields** | Matches device number **or** consumer reference **[C]** |
| **Trigger** | Typing — filters as you type **[C]** |
| **Notes** | Search is passed to the data layer as a query, not applied to a local array **[C]** |

### Column — Nameplate (the lead column)

| | |
|---|---|
| **Purpose** | Whether we know enough about this device to judge its telemetry |
| **What the user sees** | A banded percentage, or the tag **No schema** |
| **What the data represents** | Share of the **class's own expected** nameplate fields that are populated |
| **Calculation** | `nameplateCompleteness()` in [`device.rules.ts`](../../src/features/devices/model/device.rules.ts) **[C]** |
| **Expected fields per class** | `gti`: meter_manufacturer, meter_firmware, meter_current_rating, gateway_firmware, gateway_hardware, rated_kw · `ups`: manufacturer, model, rated_va, firmware · `bms`: manufacturer, model, chemistry, series_count, rated_capacity_ah, rated_cycles **[C]** |
| **Blank handling** | `null` **and empty string** both count as missing — the payloads send `""` for an unpopulated field **[C]** |
| **`No schema`** | The class declares no expected nameplate, so completeness is **unmeasurable**, which is not zero **[C]** |
| **Band** | `bandFor("photo_completeness", …)` **[C]** |
| **Notes** | A typical GTI device reads **50 %** — the meter half arrives with every data frame, the gateway half arrives empty in the heartbeat, and `rated_kw` is in no payload at all. That is why *specific yield* is still uncomputable **[C]** |

### Column — Reporting (freshness)

| | |
|---|---|
| **Purpose** | Whether the device is still reporting, judged against **its own** interval |
| **What the user sees** | A chip: `Fresh` / `Late` / `Stale` / `Never`, plus an age |
| **Calculation** | Overdue = time since last reading ÷ the device's effective interval. ≤1 `fresh`, ≤3 `late`, else `stale` **[C]** |
| **Interval used** | The device's declared interval when it sends one; otherwise the class default of 15 minutes **[C]** |
| **`Never` vs `Stale`** | Distinct on purpose. A device that never reported is not a device that stopped **[C]** |
| **Caveat** | The UPS and BMS class defaults are marked `[seed]` in the source — no UPS or BMS payload has been observed, so those intervals are assumptions **[C]**. A wrong interval silently reclassifies a healthy device as stale |

### Column — Meter

| | |
|---|---|
| **What the user sees** | e.g. `C3 · 5-30A`, or `—` |
| **Data fields** | `nameplate.meter_category` and `nameplate.meter_current_rating` **[C]** |
| **Notes** | Joined with `·`; blank when neither is present |

### Column — Consumer no.

| | |
|---|---|
| **Purpose** | Link a device to a consumer without exposing identity |
| **Notes** | **Deliberately the number, never the name.** See §1 **[C]** |

### Row menu (⋮)

| | |
|---|---|
| **Location** | Last column |
| **Options** | **View raw record** (works) · **Edit nameplate** (disabled) · **Assign to user** (disabled) **[C]** |
| **Why disabled** | Not implemented. There is no backend to write to **[I]** — no write path exists anywhere in the app |
| **Accessibility** | Each button is named `Actions for device <number>` **[C]** |

## 6. Data Sources and Data Flow

**This is the only screen currently running on the new data stack. [C]**

```
GTI device payloads  (data + heartbeat message streams)
   └─> src/lib/gti-parse.js
        └─> src/lib/device-data.js        DEVICES, devicesFor(nodeId)
             └─> devices.from-legacy.ts   legacy shape → domain model   🟨 mock-only
                  └─> mockDeviceRepository        scoped, paged, async
                       └─> app/bootstrap/container.ts     picks mock | api
                            └─> useDevices({ scopeId })   TanStack Query
                                 └─> toDeviceRows()       adds completeness, freshness
                                      └─> devices.jsx → WsTable
```

**When the API arrives, only the middle changes. [C]** `apiDeviceRepository` produces the
same domain model from `devices.schema.ts` (Zod) and `devices.mapper.ts`. The page and
every column are untouched.

| Displayed value | Source | Derivation | Mark |
|---|---|---|---|
| Device no., Class, System, Dealer, Consumer no., State | GTI payloads | parsed, mapped | **[C]** |
| Meter | payload nameplate | two fields joined | **[C]** |
| Nameplate % | payload nameplate | `nameplateCompleteness()` | **[C]** |
| Reporting | last reading + interval | `freshness()` | **[C]** |
| Last reading | payload timestamp | formatted | **[C]** |
| API / service | — | none answers `src/services/http/` yet | **[U]** |
| Database / entity | — | | **[U]** |

**Update frequency.** Not live. Payloads are bundled at build time; TanStack Query caches
for 30 seconds and does **not** refetch on window focus **[C]**.

**How many devices are there really?** Two, in the current extract **[C]**. The source DMS
holds **151** **[C]**, and an extract of it has not been received.

## 7. Charts, Metrics, and Dashboards

No charts. Two metrics live in table columns and are documented in §5: **Nameplate
completeness** and **Reporting freshness**.

## 8. Available Actions

### Filter by class

| | |
|---|---|
| **Location** | Filter bar |
| **Preconditions** | None |
| **Steps** | Pick a class → table refilters |
| **Data affected** | None — read-only |
| **Edge case** | `meter` devices cannot be filtered for; the option is absent **[C]** |

### Search by device or consumer number

| | |
|---|---|
| **Steps** | Type → filters as you type |
| **Edge case** | Matches number fields only, not dealer or system type **[C]** |

### View raw record

| | |
|---|---|
| **Location** | Row menu ⋮ |
| **Steps** | ⋮ → *View raw record* → JSON dialog |
| **Expected result** | The device's record as stored, including the derived fields |
| **Use it when** | A column looks wrong and you want the underlying values |

### Edit nameplate / Assign to user

| | |
|---|---|
| **State** | **Disabled** **[C]** |
| **Why** | Not implemented; no write path exists **[I]** |
| **Workaround** | Nameplate data comes from the device payload; correcting it is an upstream task **[I]** |

> **No write actions work on this screen today. [C]**

## 9. Use Cases

### "Which devices are missing their specs?"
Sort by **Nameplate** ascending. Anything below 100 % is missing something; ⋮ → *View raw
record* shows which fields.

### "Has this device stopped reporting?"
Search its number → read **Reporting**. `Stale` means overdue by more than three of its own
intervals; `Never` means it has not reported at all.

### "Why does this device's yield show as unknown elsewhere?"
Usually `rated_kw` is missing — visible here as a nameplate below 100 %. Specific yield is
kWh ÷ kWp and cannot be computed without the rating. **[C]**

### "Find the device for consumer 1140028871."
Type the consumer number into search — it matches consumer reference as well as device
number. **[C]**

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change scope | The whole list re-queries | Yes **[C]** |
| Change class filter | Refilters | Yes **[C]** |
| Type in search | Refilters as you type | Yes **[C]** |
| Open ⋮ → View raw record | Dialog opens | Yes **[C]** |
| Time passing | `Reporting` and the age can change | On re-render **[C]** |
| New extract + rebuild | Underlying rows | No — needs a build **[C]** |
| Backend event | Nothing — no backend | **[U]** |

## 11. Navigation

**Reached from:** rail → Assets; [Overview](/overview) device tiles **[I]**.
**Leads to:** the telemetry screens for a device's readings; [Data health](/data/health).
**Breadcrumbs:** page header **[C]**.
**Back:** browser back. Scope, filter and search are not in the URL, so back does not
restore them **[C]**.

## 12. Roles and Permissions

**Nothing here is permission-gated. [C]** *Edit nameplate* and *Assign to user* are
disabled because they are unimplemented, **not** because of your role — a distinction
worth making, because a user seeing a greyed control usually assumes permissions.

**[I]** Were enforcement added, those two are the natural candidates for restriction.

## 13. Screen States

| State | When | What the user sees | What to do |
|---|---|---|---|
| **Loading** | Briefly, on scope change | Spinner + "Loading…" | Wait. The mock adds 120–400 ms of deliberate latency **[C]** |
| **Populated** | Devices in scope | The table | — |
| **No results** | Filter or search matches nothing | *No devices match these filters* | Clear the search or change class **[C]** |
| **Empty** | No devices in scope at all | *Registry not yet ingested* + the reason | Expected — see §14 **[C]** |
| **Error** | A query fails | Message, **Try again**, and a reference id | Quote the reference id to support **[C]** |
| **Partial** | Devices present, nameplates incomplete | Percentages below 100 % | That is the screen working, not failing |

## 14. Common Questions

**Q. Why does this device show 50 % nameplate?**
A. It is a GTI gateway, which expects six fields. The meter half arrives with every data
frame; the gateway half arrives empty in the heartbeat; and `rated_kw` is in no payload at
all. Three of six is 50 %. **[C]**

**Q. What is the difference between `Stale` and `Never`?**
A. `Stale` means it reported once and is now overdue by more than three of its own
intervals. `Never` means it has never reported. A device that never reported is not a
device that stopped. **[C]**

**Q. Why can't I click *Edit nameplate*?**
A. It is unimplemented — not a permission problem. There is no write path in the
application yet. **[C]**

**Q. Why are there only two devices?**
A. That is what the current extract contains. The source DMS holds 151. **[C]**

**Q. Why does this say `No schema`?**
A. That device's class declares no expected nameplate fields, so completeness is
unmeasurable. That is different from 0 % — which would mean *we checked and found
nothing*. **[C]**

**Q. Where is the consumer's name?**
A. Deliberately absent. This screen shows the consumer **number** only; the source DMS
screen leads with name, mobile and email, and bundling those into a client build was
refused. **[C]**

**Q. Is `Reporting` trustworthy for UPS and BMS?**
A. Less so. Their 15-minute intervals are marked `[seed]` — no UPS or BMS payload has been
observed, so the interval is an assumption, and a wrong interval reclassifies a healthy
device as stale. **[C]**

**Q. Why is `meter` missing from the class filter?**
A. The dropdown offers UPS, BMS and GTI only, though `meter` exists in the domain model.
Appears to be an oversight. **[C]** for the absence, **[U]** for the reason.

**Q. Is this live?**
A. No — bundled at build time, cached 30 seconds, no refetch on focus. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| "Registry not yet ingested" | No devices in scope, or no extract | Widen scope. Otherwise expected **[C]** |
| Nameplate below 100 % everywhere | Payloads genuinely omit fields | ⋮ → View raw record to see which **[C]** |
| Everything reads `Stale` | Extract is older than the intervals | Check *Last reading* — the extract is a snapshot **[C]** |
| Filter finds nothing | Search matches numbers only | Search by device or consumer number **[C]** |
| A meter device will not filter | No `meter` option in the dropdown | Use search instead **[C]** |
| Error with a reference id | A query failed | Quote the reference id — it is the request id **[C]** |
| Count disagrees with the DMS | Different sources | The DMS holds 151; this shows the extract **[C]** |

## 16. AI Assistant Questions

- "Why does this device show 50 % nameplate completeness?"
- "What is the difference between Stale, Late and Never on the Devices screen?"
- "Where does the Devices screen get its data from?"
- "Why can't I edit a device's nameplate?"
- "Why is the consumer's name not shown on the Devices screen?"
- "What does *No schema* mean in the Nameplate column?"
- "How do I find a device by consumer number?"
- "Why are there only two devices in the registry?"
- "Which nameplate fields does a GTI gateway need?"
- "Is the Devices screen live or cached?"
- "Why is specific yield uncomputable?"
- "What URL is the Devices screen on?" — `/assets`, not `/devices`

## 17. Known Unknowns / Information Not Available

| Unknown | Why | What would resolve it |
|---|---|---|
| API / service | No backend answers `src/services/http/` yet | The API specification |
| Database / entity / field names | No database in this product | Backend schema docs |
| Why `meter` is absent from the class filter | Absence confirmed; intent not recorded | Ask the screen's author |
| Real UPS / BMS reporting intervals | Marked `[seed]`; no payload observed | A UPS or BMS payload |
| When *Edit nameplate* / *Assign to user* will work | Not planned in the repo | Product roadmap |
| Whether nameplate is correctable in-product or only upstream | Not decided | Product decision |
| The DMS extract's arrival date | Not recorded | Data-supply agreement |
