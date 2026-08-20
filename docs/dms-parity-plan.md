# DMS parity — what the screens show, what we have, what to build

**Source:** eight screenshots of the running *Genus Data Management System* (Dashboard, Devices,
GTI System ×4 tabs, BMS Devices, UPS Devices, Dynamic Reports; File Upload seen in the rail only).

**Companion:** [ia-and-screen-plan.md](ia-and-screen-plan.md) §7.4–7.6 already specifies most of
these screens. [dashboard-ia.md](dashboard-ia.md) Q7 records why none of them are built:
*device telemetry schema outstanding*. This document closes that gap into a work plan.

---

## 1 · Headline verdict

**Every telemetry-side screen in the DMS has zero data behind it in this repo, by design.**
`src/lib/programme-data.js`'s `DEVICE_FLEET` states it outright — no device, GTI, BMS or UPS record
exists in either source extract, and the Overview tiles render `notConfigured` rather than `0`. The
DMS screenshots are the first evidence that this data exists *somewhere*.

| DMS screen | This repo today | Verdict |
|---|---|---|
| Dashboard — 5 counters | `/overview` — 6 programme tiles + 5 device tiles, 4 of them `notConfigured` | **Shell built, 4 of 5 numbers missing** |
| Devices (registry) | `/assets` — rooftop *condition*, not a device registry | **Wrong object. Registry missing entirely** |
| GTI System — 4 tabs | `/telemetry/gti` → `Placeholder` | **Missing** |
| BMS Devices | `/telemetry/bms` → `Placeholder` | **Missing** (bands exist, data does not) |
| UPS Devices | `/telemetry/ups` → `Placeholder` | **Missing** |
| Dynamic Reports | `/reports` — built, but programme reports only | **Different product. No date range, no device report, no Generate** |
| File Upload | `/data/import` → `Placeholder` | **Missing** |
| Log out / user chip | Avatar chip exists; no auth, no logout | **Missing** |

---

## 2 · Field-level inventory

### 2.1 Dashboard — 5 counters

| DMS | Value | Here |
|---|---|---|
| Users | 2567 | **3** — `SYSTEM_ACCOUNTS`, the `Created By` / `Employee ID` values stamped on the extracts. Not the same claim. |
| Devices | 146 | `notConfigured` |
| GTI System | 3 | `notConfigured` |
| BMS Devices | 63 | `notConfigured` |
| UPS Devices | 76 | `notConfigured` |

> **The DMS's own counters disagree with its own tables.** Devices card says **146**, the Devices
> table footer says **1–10 of 151**. BMS card **63** against a table of **44**. UPS card **76**
> against **42**. GTI card **3** against **1 row in each of the four tabs**.
>
> Each pair is presumably counting a different population — registered devices vs. devices with a
> latest reading, say — but nothing on screen says which. We cannot ship either number until we know
> what each counts; §3d of [AGENTS.md](../AGENTS.md) requires a `freshness` string on every KPI tile
> stating exactly that. This is the first question for whoever owns the DMS.

### 2.2 Devices — registry

Filters: `Device Type` (All) · `Search City` · `Search Consumer Name` · `Search Phone Number` · search button.

Columns: `#` · Consumer Name · Mobile No. · Device No. · Device Type (UPS/GTI/BMS) · Dealer ·
System Type (Solar / Non Solar) · Owning User Email · `On` (toggle) · Operation (3 unlabelled icons).
151 rows.

Here: **no `Device` entity exists at all.** `/assets` is built from the 9 survey rows — roof age,
orientation, structure and earthing runs. A different object.

Three things in this table have no home in the current model: **Dealer**, **System Type**, and
**Owning User Email**. `hierarchy-data.js` carries geography and `registered` counts only.

> **Consumer Name + Mobile No. + Owning User Email is PII, and `assets.jsx` refuses it on purpose:**
> the consumer master's 9,673 names and phone numbers are deliberately *not* bundled into the client
> build. A device registry keyed on consumer identity reopens that decision. It needs an explicit
> answer (§5, Q3) — masked columns, a server-side registry, or scope-gated reveal — not a quiet
> import.

### 2.3 GTI System — four tabs

| Tab | Columns |
|---|---|
| GTI DATA | Device No. · Msg ID · Msg Type (`telemetry`) · Timestamp · Max Index · Index · Load · Inserted On · JSON |
| GTI HEARTBEAT | Device No. · Msg Type (`heartbeat`) · Timestamp · JSON |
| GTI INFO | Device No. · Msg Type (`gateway_handshake`) · Firmware · Hardware · Manufacturer · Model · Inserted On · JSON |
| GTI ON-DEMAND | Device No. · Type (`ondemand`) · CM Key · PM Key · Cmd (`read`) · Timestamp · JSON |

All four hold exactly one row, all for device `357108850179110`. Timestamps span
05 Mar → 09 Jun 2026 — i.e. **the newest GTI reading is over two months stale**, and nothing on the
screen says so.

Here: `Placeholder`. The plan already calls for these four as **route segments**
(`/telemetry/gti/:tab?`, §7.5 "tab state is addressable"), which matches the DMS's tab set exactly.

**GTI INFO is not telemetry — it is nameplate.** Firmware / Hardware / Manufacturer / Model is
precisely the record §2.2 of the plan calls "the prerequisite" for banding any numeric field. It
should feed the device registry, not sit only in a tab.

### 2.4 BMS Devices

Columns: Device No. · Date Time · SOC ⓘ · Cycles · Temp 1 · Temp 2 · Temp 3 · Temp 4 · Cells · Capacity.
Export: Excel + CSV. Search. 44 rows.

| Field | Band registry status |
|---|---|
| SOC | ✅ `soc` |
| Temp 1–4 | ✅ `pack_temp`, and `temp_spread` is derivable from the four |
| Cells, Capacity | ⚠️ These are **nameplate**, not readings — `series_count` and rated capacity, which `cell_voltage` already declares in its `requires` |
| Cycles | ❌ No band. `efc_per_day` is named in plan §5.4 but not in `bands.js` |

> **Three rows show `-58.0` and `-48.0` °C.** Those are sensor-fault sentinels, not temperatures.
> `bandFor("pack_temp", -58)` returns **`critical`** today — a confident red on a broken sensor.
> §2 of [AGENTS.md](../AGENTS.md) requires `unknown` plus the reason instead. A plausibility floor
> per metric has to land before any of this data is banded.
>
> Also visible: `GE000000000000` (a null device id), `GENUS 300 10` and `GENUS BMS` (model names in
> a device-number column), and one row with Capacity `10000` against 43 rows of `100` — a unit
> mismatch (Ah vs. Wh) or a typo. All four are exception-queue rows, not display problems.

### 2.5 UPS Devices

Columns: Device No. · Date Time · Voltage · Load · Action (JSON). Excel + CSV. 42 rows.

Every value is `0.00` except one row at `228.70` V. Newest reading is 14 Aug 2026; oldest on page 1
is 09 Jul 2026.

Here: `Placeholder`. `grid_voltage` band exists. **`ups_mode` does not** — despite plan §5.3 calling
`UPS mode = Bypass` *"the highest-severity state in the fleet"*. The DMS screen does not show mode at
all, which means the most important UPS field is either absent from the source or hidden inside the
JSON payload.

> `0.00` V on 41 of 42 devices is not "zero volts". It is almost certainly *no reading* rendered as a
> number — exactly the failure mode §6 of the plan names (`Device offline → "No data since 14:32"`,
> never a blank or a zero).

### 2.6 Dynamic Reports

Controls: `Report` dropdown (Device Report) · device-number search · Start Date · End Date ·
**GENERATE** · Export CSV.

Columns: Device Type (`ups`) · Timestamp · Backup Status · Inverter Mode · Mains Voltage · Inverter Status.
Every value is a bare `1` or `0`, with no legend anywhere on the screen.

Here: `/reports` is built, but is a different thing — a `TileDeck` picker over four already-computed
programme views (Programme summary, Exceptions, Site records, Asset condition) with CSV export. It
has **no date range, no device filter, and no Generate step**, and its own header says why: there is
one snapshot of this data, so no period-over-period comparison is offered.

Missing pieces: a **`WsDateRange`** component (named in plan §7.6, not built), a device-scoped report
type, and a decoder for the status codes.

> **`Backup Status = 1` is not information.** A bare code fails §7 of AGENTS.md ("colour is never the
> only signal" — here there is not even colour) and plan D3 ("every numeric telemetry field carries a
> band and a unit"). And **"Mains Voltage" holding `0` is a flag, not a voltage** — a name collision
> with the real `grid_voltage` metric that will make every future query ambiguous. Needs the same
> rename treatment §8 of dashboard-ia.md gave `Device ID` → `capture_device`.

### 2.7 File Upload

Rail item only. Here: `/data/import`, `/data/history`, `/data/health` are all `Placeholder`.
Plan requires upload **with a dry-run validation report before commit**, and batch history with
rollback by `import_batch_id` — neither is visible in the DMS rail.

### 2.8 Shell chrome

| DMS | Here |
|---|---|
| Hamburger | ✅ — and correctly separated from Mini layout (AGENTS.md §3a-3) |
| Dark-mode toggle | ✅ `ThemeCustomizer`, nine schemes |
| Avatar + user name | ✅ chip, but not bound to a real account |
| Log out | ❌ no auth layer |
| Back arrow beside every page title | Breadcrumbs instead — deliberate, keep |
| Rows per page / pagination | ✅ `DataTable` |
| Per-screen search | ✅ `DataTable` toolbar |
| `JSON` action per row | ❌ **no JSON viewer exists** |
| Excel export | ❌ CSV only (`exportCsv`, data-table.jsx:339). No xlsx writer is a dependency |

---

## 3 · The gaps, ranked

| # | Gap | Blocks |
|---|---|---|
| 1 | **No `Device` entity.** No id, class, model, nameplate, site link, owner, dealer, on/off state | Everything below |
| 2 | **No telemetry readings** — GTI (4 message types), BMS, UPS | 3 screens + dashboard counters |
| 3 | **No plausibility floor per metric** — `-58 °C` bands as `critical`, `0.00 V` bands as `critical` | Any banded telemetry. Ship this *before* the screens |
| 4 | **No JSON payload viewer** — every DMS row has one | 5 screens |
| 5 | **No `WsDateRange`** | Reports, all telemetry screens |
| 6 | **No status-code decoder** — Backup Status / Inverter Mode / Inverter Status | Device Report |
| 7 | **Bands missing**: `ups_mode`, `charge_cycles`, `capacity_ratio` | BMS + UPS screens |
| 8 | **No reporting interval per class** (dashboard-ia.md Q2, still open) | `freshnessOf()` cannot classify anything |
| 9 | **No Excel export** | Two screens offer it |
| 10 | **No dealer / system-type / owning-user attributes** | Devices registry filters |
| 11 | **No auth** — real user count, logout | Dashboard "Users", `/admin/*` |

---

## 4 · Build plan

Ordered so that semantics land before the screens that use them — the same order §12 of the plan
already argues for. Every phase ends with its components added to `/gallery`, per AGENTS.md §9.

### Phase 0 · Get the data, define the entity  *(blocking — awaiting the extract)*

**Decided:** the rows come from a **real extract of the DMS**, not a fixture. A synthetic fleet was
considered and rejected — `DEVICE_FLEET`'s existing comment is the standing decision against
fabricated rows, and §3c records that an earlier hand-typed dataset got 5 of 9 verdicts wrong.
Phase 0 therefore does not start until one of a read API, a DB extract, or a per-screen CSV export
lands in the repo.

Needed, one file per screen: Devices (151 rows) · GTI data / heartbeat / info / on-demand ·
BMS (44) · UPS (42) · the Device Report output. Plus one raw JSON payload per message type — the
`JSON` action's contents are where the undocumented enums (Q4) and the possibly-hidden UPS mode
(Q7) will be found.

- New `src/lib/device-data.js` — `RAW_DEVICES` transcribed field for field, everything else derived,
  exactly the shape of `programme-data.js`.
- Extend the model with `dealer`, `systemType`, `owner`, `enabled`, and a nameplate sub-record fed by
  **GTI INFO** (firmware, hardware, manufacturer, model) and **BMS** (cells, capacity).
- Link devices to the hierarchy. The DMS keys on consumer; plan §7.6's amendment says the object
  telemetry hangs from is **Consumer**, not a retail Site — so this is a consumer-number join, and
  dashboard-ia.md Q1's unresolved master↔survey join applies here too.
- Delete the `DEVICE_FLEET` stub; the four Overview tiles become real.

### Phase 1 · Semantics — before any screen

- `src/lib/bands.js`: add `ups_mode` (Line/Battery/**Bypass**, enum band), `charge_cycles`,
  `capacity_ratio`. Add a **`plausible` range** to every metric so sentinel values return `unknown`
  with a reason, never `critical`.
- Reporting interval per device class, so `freshnessOf()` works. Closes Q2.
- New atom **`CodeValue`** — renders `1` as `1 · On backup`, with the full enum in a `MetricInfo`
  affordance (hover **and** focus **and** click, AGENTS.md §7). No bare code ships.
- New **`JsonPayloadDialog`** — the row-level JSON action, one component reused by all five screens.
- New **`WsDateRange`** — a start/end pair with `dd-mm-yyyy` formatting per §8.

### Phase 2 · Device registry — `/assets`

Per plan §7.4. The current `/assets` (rooftop condition) is a genuinely useful aggregate and should
not be deleted — move it to a second tab or to `/sites`, and give the registry the `/assets` route
the plan assigns it.

- Columns: Device No. · class · model · **nameplate completeness** · freshness · state · site · dealer · system type · owner.
- `lockFirstColumn` — the table is wide and the device id must not scroll away.
- `FilterBar` with device type / city / consumer / phone, matching the DMS's four filters.
- Replace the DMS's three unlabelled icon buttons with a named row menu. An icon with no accessible
  name fails §7 outright.
- **PII question answered explicitly first** (§5, Q3).
- Bulk select → bulk edit / bulk assign, which is the actual backlog plan §7.4 describes.

### Phase 3 · Telemetry screens

Band structure from plan §7.6 for each: header + sub-nav · `WsDateRange` + device filter · chart
panel · full-width `WsTable`.

- `/telemetry/gti/:tab?` — four tabs as route segments: `data` · `heartbeat` · `info` · `on-demand`.
  Columns exactly as §2.3. `info` also writes into the registry's nameplate.
- `/telemetry/bms` — SOC, cycles, temps 1–4, cells, capacity, **plus derived** `temp_spread`,
  `cell_delta`, `weak_cell_id`, `autonomy_minutes` (plan §5.4). Default 8 visible columns, rest
  behind the Columns menu.
- `/telemetry/ups` — voltage, load, **and mode** if the source carries it; if it does not, the screen
  says so rather than omitting the field silently.
- `/telemetry/solar`, `/telemetry/meter` — stay `Placeholder`. Not in the DMS, no data.

### Phase 4 · Reports parity

Add a **Device Report** alongside the four programme reports rather than replacing them — the
programme reports are the ones with data today.

- `WsDateRange` + device-number filter + explicit **Generate**.
- Columns per §2.6, every status field through `CodeValue`.
- Rename `Mains Voltage` → `mains_present` in our model, with the source name kept for reference
  only — the same treatment §8 of dashboard-ia.md gave `Device ID`.
- Excel: either add a writer or state CSV-only in the toolbar. Do not show a disabled button.

### Phase 5 · File upload

`/data/import` with dry-run before commit · `/data/history` with rollback by `import_batch_id` ·
`/data/health` with ingestion lag and parse-failure rate.

### Phase 6 · Users and auth  *(blocked on a backend)*

`/admin/users`, `/admin/roles`, real logout, and the Dashboard's real user count. Until an auth
backend exists, `admin-users.jsx`'s current framing — "the accounts that have actually touched this
data", explicitly *not* a registered-user count — remains the honest one.

---

## 5 · Open questions

> **Update — four real payloads landed.** Two gateways, a 2-minute capture, parsed and loaded
> (`gti-parse.js`, `device-samples.js`). They changed three of this document's assumptions: the "GTI
> Data" stream carries a **net meter**, not an inverter; the four filename streams are transport
> envelopes rather than schemas; and nameplate arrives with every data frame rather than from a
> handshake. See AGENTS.md §3c-3 for the full finding list. Q2, Q5 and Q6 are answered below.

| # | Question | Blocks |
|---|---|---|
| ~~Q1~~ | ~~Can we get a read API, DB extract or per-screen CSV from the DMS?~~ **Answered: yes — real extract, no fixture.** Four sample payloads received; the bulk export is still outstanding. | Phase 0 |
| Q2 | What does each dashboard counter count, given it disagrees with its own table (146/151, 63/44, 76/42, 3/1)? | Dashboard tiles |
| Q3 | Consumer name / mobile / email in the device registry — masked, server-side, or scope-gated? | Phase 2 |
| Q4 | Are `Backup Status` / `Inverter Mode` / `Inverter Status` documented enums anywhere, or must we reverse them from the JSON payloads? **Still open** — the sample payloads contain none of these fields, so they belong to a UPS schema we have not seen. `TMPSTS` bit meanings join this question. | Phase 1, Phase 4 |
| ~~Q5~~ | ~~Expected reporting interval per class?~~ **Answered by the payload: `STINTERVAL`** — 15 min Data, 30 min Heartbeat, declared per message per device. Seeds remain only for BMS/UPS. | All freshness |
| ~~Q6~~ | ~~Is `0.00` a real reading or a missing one?~~ **Answered: missing.** An all-zero frame carries meter RTC `000000` while the nameplate stays populated — a failed read. Three sentinels confirmed in the real data: `0.00 V`, `-127 °C`, `(0,0)`. | Phase 1 plausibility ranges |
| Q7 | Does the UPS source carry a mode field (Line/Battery/Bypass)? Unanswered — no UPS payload in the sample. | Phase 3 |
| Q8 | Excel export — required, or is CSV acceptable? | Phase 4 |
| **Q9** | **Are the meter RTCs actually drifting, or does `MS-…--DATE` mean something other than "now"?** One meter reads 25 days behind, the other 72 days ahead, each internally consistent. This decides whether the billing data is usable at all. | Everything billing-related |
| **Q10** | What are `POFF` (1468 / 4773) and `LBPONDUR` (3337) measured in — minutes or event counts? Both readings are plausible either way. | Meter screen units |
| **Q11** | Is `ASN_21` (`JD10002` / `JD10003`) the join key to the consumer register? If it joins, it unblocks every coverage percentage in the product (dashboard-ia.md Q1). | Coverage, Phase 2 |
| **Q12** | Where is the inverter object? No sample payload contains one, and `rated_kw` is absent from the nameplate — so specific yield has neither numerator nor denominator. | `/telemetry/solar` |
| **Q13** | What is `VD` (5 on Data, 0 on Heartbeat)? Read as a schema/object version and not relied on. | Parser hardening |
