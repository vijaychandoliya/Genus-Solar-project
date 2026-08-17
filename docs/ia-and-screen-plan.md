# Genus Solar — IA & Screen Plan

**The information architecture and screen structure for the GIL-BMS rebuild.** What each screen
is, which band structure it uses, what object it operates on, and the rule that keeps it working.
Written before any code so the first commit lands against a decided structure rather than a
discovered one.

| | |
|---|---|
| Repo | `Genus-Solar-project` — greenfield, zero commits at time of writing |
| Stack | React 19 · MUI v9 · TanStack Table v8 · ECharts 6 · Vite |
| Conventions | [admin-layout-guide.md](admin-layout-guide.md) · [table-system.md](table-system.md) — carried from Genus WFM, authoritative here |
| Design system | Figma `Hp8Qa76b0R6DTuFwYrnLWE` — *02 Foundations — Color* read 17 Aug 2026 |
| Product sources | Screen IA · BRD v1.11 · SRS · Roles matrix · Product/Domain/Competitive Analysis v1.0 |
| Scope decision | Redesigned per the analysis — Site entity, alerting loop, semantic bands. Not a parity rebuild. |
| Status | Plan. Nothing built. **Amended 17 Aug 2026 — see the notice below.** |

> **Amendment — read [dashboard-ia.md](dashboard-ia.md) first.** This document was written from the
> four specs, which describe a device monitoring platform for retail store sites. Two data extracts
> received afterwards show the product is a **discom rooftop-solar rollout programme** for SBPDCL:
> BPL-tariff consumers inside a six-level distribution hierarchy, moving through survey, meter
> change, MDM and billing before anything generates.
>
> What survives here: the semantic band system (§5), the freshness and empty-state taxonomy (§6),
> the alarm lifecycle (§7.3), tokens (§10) and the table and layout rules throughout.
>
> What is superseded: **Site is not the top object — Consumer is** (§2.1, §3, §4, §7.2). The
> telemetry screens in §7.5–7.6 remain valid but attach at stage 9 of the pipeline rather than
> forming the product. Phase order in §12 changes — the rollout dashboards come first, because
> there is real data for them today and none yet for telemetry.

---

## §0 · What this document decides

Five decisions. Everything else in here follows from them.

| # | Decision | Displaces |
|---|---|---|
| D1 | **Site is a first-class object**, above Device. `Device.site_id` replaces `store_name`. | The denormalised `store_name` string on both User and Device |
| D2 | **Primary navigation is organised by question, not by device taxonomy** — 8 nodes, not 12. | Six sibling device-class menu items |
| D3 | **Every numeric telemetry field carries a band and a unit**, resolved from device nameplate. | Bare numbers in grids |
| D4 | **Normal is not a colour.** Only watch / warning / critical / unknown are rendered. | A green-amber-red coding of every cell |
| D5 | **Alarm is a first-class object with a lifecycle**, not a status word on a telemetry row. | `alarm_status` / `protection_status` as read-only strings |

> **The one rule above all others.** This product's job is to answer *what should I do about it,
> and by when* — not *what does this device report*. A screen that only retrieves is a screen that
> has not finished. Every plan below states the decision its screen supports; if it cannot, it does
> not ship in this phase.

---

## §1 · The thesis

The analysis states it in one line: GIL-BMS is a data access platform, not yet a decision platform.
Three structural consequences, and each one is an IA problem before it is a feature problem.

| Consequence | IA cause | Fixed by |
|---|---|---|
| No closed alerting loop | No Alarm object, so nowhere to put a queue | §2 Alarm · §7.3 |
| Cross-asset questions have no home | No Site object, so "everything at Store 214" is unaskable | §2 Site · §7.2 |
| Telemetry has no semantics | No nameplate, so no threshold can be computed | §2 Nameplate · §5 |

The dependency runs one way: **nameplate → bands → alerting**. Building the alerting engine first
means writing rules against fields whose safe range the system cannot know. Nameplate is a
one-sprint data-model change that four features depend on, which is why it is first in §12.

---

## §2 · Object model

Seven objects. Three are new; the analysis names all three as P0 or their prerequisite.

```
Organisation
└── Site  ★new                         id, code, name, address, lat/long,
    │                                  contact{name,phone}, commissioned_at,
    │                                  contracted_demand_kw, tariff_ref
    └── Device (asset)                 + nameplate ★new
        ├── Reading (×5 classes)       + provenance ★new
        └── Alarm  ★new ──── Rule ★new
            └── Visit ★new ──── Ticket
```

### 2.1 Site — the object the product was missing

Replaces `store_name` / `store_pass` as denormalised strings. Carries what a diagnostic journey
needs and a device record cannot hold: one address, one contact to call, one geolocation, one
commissioning date, one contracted demand figure against which meter max-demand is judged.

`store_pass` does **not** migrate. It is a shared credential rendered in grids and exports today;
Section 8 of the analysis treats it as a security defect. Site access is governed by assignment,
not by a password field.

### 2.2 Device nameplate — the prerequisite

Without these fields no threshold in §5 can be computed, and four features (readiness, rupee
insight, expected-vs-actual, derived KPIs) cannot be built at all.

| Group | Fields | Unlocks |
|---|---|---|
| Battery | `chemistry` (LFP/NMC), `series_count`, `nominal_voltage`, `rated_capacity_ah`, `rated_capacity_wh`, `max_charge_a`, `max_discharge_a` | Every cell and pack band; C-rate; autonomy |
| Solar | `installed_kwp`, `module_count`, `tilt`, `azimuth`, `inverter_ac_rating_kw`, `system_type` (PWM/MPPT) | Specific yield, PR, CUF, peer comparison |
| Meter | `contracted_demand_kw`, `tariff_ref` | Demand-overrun alerting, PF penalty exposure |
| Lifecycle | `commissioned_at`, `warranty_expiry`, `model`, `batch_ref` | Warranty adjudication, cohort analysis |

> **Gap, stated deliberately.** Nameplate for the existing fleet does not exist anywhere. Backfill
> is a data operation, not a UI one, and the app must render `Not configured` — never `0`, never a
> band — for any device whose nameplate is absent. See §6.

### 2.3 Alarm and Rule

| Object | Fields | Notes |
|---|---|---|
| `Rule` | `metric`, `device_class`, `scope` (fleet/site/device), `threshold`, `dwell_s`, `hysteresis`, `severity`, `channels[]`, `enabled` | Dwell and hysteresis are not optional. A rule without them produces a flapping alarm, and alert fatigue is the primary failure mode of monitoring products. |
| `Alarm` | `rule_id`, `device_id`, `site_id`, `severity`, `opened_at`, `state`, `assignee`, `acked_at`, `resolved_at`, `resolution`, `fault_cause` | State: `active → acknowledged → assigned → resolved`. Auto-resolve on return-to-band, with hysteresis. |
| `Visit` | `alarm_id`, `device_id`, `engineer`, `found`, `fault_cause`, `parts[]`, `at` | The label that makes prediction possible later. Every unrecorded visit is a training example the platform will never have. |

### 2.4 Reading provenance

Both ingestion paths write the same tables today, distinguished only by `file_data_date`. Add to
every telemetry row:

| Field | Values | Why |
|---|---|---|
| `source` | `mqtt` · `file_import` · `manual` | A streamed value and a value typed into a spreadsheet three weeks later warrant different confidence |
| `ingested_at` | timestamp | Separates reading time from arrival time |
| `import_batch_id` | uuid \| null | Makes rollback possible |
| `natural_key_hash` | hash | Deduplication; prevents the double-count that inflates energy totals |

**Availability metrics count `mqtt` rows only.** A large backfill otherwise makes an offline device
look like it reported continuously, which defeats the metric entirely.

---

## §3 · Navigation

Eight primary nodes, down from twelve. Six of the twelve were device-class silos answering variants
of one question, with labels parallel in form but not in kind — *Devices* is a registry, *BMS
Devices* is telemetry, and nothing in the labels says so.

| # | Node | Answers | Children |
|---|---|---|---|
| 1 | **Overview** | What needs attention today? | — |
| 2 | **Alarms** | What is open, who has it? | Inbox · Rules |
| 3 | **Sites** | What is happening at this location? | List · Detail |
| 4 | **Assets** | What do we own, where, in what state? | Registry · Detail |
| 5 | **Telemetry** | How is this parameter behaving across the fleet? | BMS · GTI · UPS · Solar · Meter |
| 6 | **Reports** | What happened over this period? | 8 types · Subscriptions |
| 7 | **Data** | Can I trust these numbers? | Import · History · Health |
| 8 | **Administration** | Who can do what? | Users · Roles · Audit · Organisation |

Account, theme, help, support tickets and logout move to the top-bar account menu — personal items
out of primary navigation.

**Order is deliberate.** Serial Position Effect: first and last are best remembered. Overview and
Alarms occupy the first two slots because they are the daily jobs (J2, J3, J10 in the analysis);
Administration takes the last because it is infrequent but must be findable. Reference material —
Sites, Assets, Telemetry — sits in the middle, where recall is weakest and it does not need to be
strong, because those are reached by drilling from the top two far more often than from the rail.

**Telemetry keeps the cross-fleet grids.** Demoting five top-level items into one node is not a
reason to delete their content. When comparison across the fleet genuinely *is* the job — an
analyst ranking every pack by cell delta — hiding options degrades the decision. The 20-column BMS
grid survives intact, one level down.

> **Gap.** There is no global search in this plan's first two phases. Findability across Sites,
> Assets and Alarms currently depends on knowing which node to enter. Acceptable at 60–120 sites;
> revisit before the fleet triples.

---

## §4 · Routes

Kebab-case throughout. The `/Genus` segment is dropped — it leaks the vendor name into every URL,
adds no navigational value, and is the natural place for a tenant slug if multi-tenancy arrives.

| Route | Screen | Access |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register — **Admin removed from the role dropdown** | Public |
| `/forgot-password` | Forgot password (OTP request) | Public |
| `/reset-password` | Reset password | Public |
| `/overview` | Overview — role-adaptive, see §7.1 | All |
| `/alarms` | Alarm inbox | All (scoped) |
| `/alarms/:alarmId` | Alarm detail | All (scoped) |
| `/alarms/rules` | Rule configuration | Admin+ |
| `/sites` | Site list | All (scoped) |
| `/sites/:siteId` | **Site detail** — the anchor screen | All (scoped) |
| `/assets` | Device registry | All (scoped) |
| `/assets/:deviceId` | Device detail | All (scoped) |
| `/telemetry/bms` | BMS cross-fleet | All (scoped) |
| `/telemetry/gti/:tab?` | GTI — `data` · `info` · `on-demand` · `heartbeat` | All (scoped) |
| `/telemetry/ups` | UPS cross-fleet | All (scoped) |
| `/telemetry/solar/:tab?` | Solar — `devices` · `heartbeat` | All (scoped) |
| `/telemetry/meter` | Meter cross-fleet | All (scoped) |
| `/reports` | Report picker | Admin+ |
| `/reports/:reportType` | Report output | Admin+ |
| `/data/import` | Upload with dry-run | Admin+ |
| `/data/history` | Batch history, rollback | Admin+ |
| `/data/health` | Ingestion health | Admin+ |
| `/admin/users` · `/admin/roles` · `/admin/audit` · `/admin/organisation` | Administration | Admin+ / Super Admin |
| `/account/profile` · `/account/support` · `/account/support/:ticketId` | Account | All |

**Tab state is addressable.** GTI and Solar tabs are route segments, not component state. An
operational tool where a specific view cannot be bookmarked or pasted into a message is costing its
users a real thing every day.

---

## §5 · The semantic band system

The single highest-leverage change in the plan. A pack voltage of 48.2 V is healthy for a 15S LFP
pack and a critical over-voltage for a 13S pack. Because that is not in the system today, the
interpretation burden sits entirely with the reader — which is exactly the expertise the platform
exists to democratise.

### 5.1 Five states, four of them rendered

| Band | Meaning | Rendering | Token |
|---|---|---|---|
| `normal` | Within design envelope | **No colour.** `text-primary`, tabular numerals | — |
| `watch` | Drifting; no action yet | Dot + text, no fill | `warning-500` dot, `text-secondary` label |
| `warning` | Action needed this week | Filled chip | `status-warning-background` / `status-warning-foreground` |
| `critical` | Action needed now | Filled chip | `status-danger-background` / `status-danger-foreground` |
| `unknown` | Nameplate absent, or reading stale | Value de-emphasised + age | `text-tertiary`, `neutral-100` |

> **Why `normal` gets no colour.** Emphasis is a budget, and it is zero-sum. If every cell in a
> 20-column grid carries a green, amber or red tint, the grid is uniformly loud and the one cell
> that matters is invisible — the exact failure the bands exist to prevent. Colouring only the
> exceptions means an engineer's eye lands on the problem without reading a single number. The cost
> is that "confirmed healthy" is not positively signalled at cell level; that is paid back at
> object level, where a site or asset header **does** carry an explicit `Healthy` chip in
> `status-success-*`. Green is reserved for answering a question the user actually asked.

**Colour is never the only signal.** Every band carries a word or an icon — a `warning` chip reads
*High*, not merely amber. Non-negotiable, both for colour-vision deficiency and because a printed
report loses the tint entirely.

**`info` is not used for status.** The Fluent info ramp (`#0078d4`) sits within a few degrees of the
brand primary (`#0467b2`). A blue chip in this product reads as *link* or *action*, not *state*.
Info is reserved for advisory banners, never for a telemetry band.

### 5.2 The config contract

Bands are data, not code. One registry, resolved per reading against the device's nameplate.

```js
// src/lib/bands.js
{
  id: "cell_voltage",
  label: "Cell voltage",
  unit: "V",
  precision: 3,
  requires: ["chemistry", "series_count"],   // no nameplate ⇒ band is `unknown`
  polarity: "band",                          // "band" | "htb" | "ltb"
  thresholds: ({ chemistry }) => chemistry === "LFP"
    ? { criticalLow: 2.50, warningLow: 2.80, watchLow: 3.00,
        watchHigh: 3.45,  warningHigh: 3.55, criticalHigh: 3.65 }
    : { /* NMC */ },
  hint: "LFP sits on a flat plateau near 3.20–3.30 V, so small deltas mean large SOC differences and voltage-based SOC is unreliable there.",
}
```

Resolver: `bandFor(metricId, value, nameplate) → "normal" | "watch" | "warning" | "critical" | "unknown"`.

Every band definition also supplies `hint`, surfaced through the existing `MetricInfo` affordance —
hover, focus **and** click, never hover alone. The criteria a reader is shown and the criteria the
figure was measured under are then the same sentence.

### 5.3 Seed thresholds

Domain values for a 48 V-class LFP system. **Re-derive per pack design before shipping** — these are
defaults for the registry, not truths.

| Metric | Critical low | Warning low | Normal | Warning high | Critical high |
|---|---|---|---|---|---|
| Cell voltage (LFP) | < 2.50 V | < 2.80 V | 3.00–3.45 V | > 3.55 V | > 3.65 V |
| Cell delta | — | — | < 50 mV | > 120 mV | > 250 mV |
| Pack temperature | < 0 °C charging | < 5 °C | 5–40 °C | > 45 °C | > 55 °C |
| Temperature spread | — | — | < 5 °C | > 8 °C | > 12 °C |
| SOH | — | — | > 90 % | < 85 % | < 80 % (EOL) |
| Grid voltage (1φ) | < 190 V | < 207 V | 207–253 V | > 253 V | > 270 V |
| Grid frequency | < 47.5 Hz | < 49.5 Hz | 49.5–50.5 Hz | > 50.5 Hz | > 52 Hz |
| UPS mode | — | — | Line | Battery | **Bypass** |
| Power factor | — | — | > 0.95 | < 0.90 (penalty) | < 0.85 |
| Max demand | — | — | < 80 % contracted | > 90 % contracted | > 100 % contracted |
| THD voltage | — | — | < 5 % | > 8 % | > 10 % |

`UPS mode = Bypass` is the highest-severity state in the fleet and is a band, not a status string —
bypass removes protection entirely while reporting no fault at all.

### 5.4 Derived metrics

The high-value diagnostics are derivations, not raw fields. These are computed client-side from
readings already collected, and each earns a place in the band registry:

`cell_delta` (max − min) · `weak_cell_id` · `temp_spread` · `c_rate` (against nameplate) ·
`autonomy_minutes` (SOC × capacity ÷ present load) · `efc_per_day` · `soh_trend` with projected
80 % crossing · `phase_imbalance` (V and I) · `specific_yield` (kWh ÷ kWp).

`autonomy_minutes` is the one to build first. It requires no new data — SOC, capacity and present
load are all collected today — and it is the only number one of the four personas actually wants.

---

## §6 · Freshness, provenance and empty states

A monitoring UI is a diagnostic instrument for four layers it does not control. It therefore has an
obligation to distinguish its own state from the state of the world. Silence must never read as
health.

### 6.1 Freshness classification

Computed from `now − reading.timestamp` against the device's expected reporting interval.

| Class | Condition | Rendering |
|---|---|---|
| `live` | < 1 × interval | Value plain; timestamp on hover |
| `late` | 1–3 × interval | Value plain; age chip *12 min ago* |
| `stale` | 3–12 × interval | Value at `text-tertiary`; age chip in `warning` |
| `offline` | > 12 × interval, or heartbeat lost | Value replaced by *No data since {time}*; row flagged |

**Bands are not computed on `stale` or `offline` readings.** A four-hour-old value showing a
comfortable green is a lie about the present.

### 6.2 The empty-state taxonomy

Four different nothings, four different sentences. This is a product requirement, not a nicety.

| Condition | Words | Never |
|---|---|---|
| No rows for current filters | Names the filter, offers the action that clears it | "No data" |
| Device offline | *No data since 14:32 — device not reporting* | A blank cell |
| Nameplate absent | *Not configured* | `0`, or a band |
| Request failed | `role="alert"` at the control; states the failure, keeps the control usable | A silent empty table |
| First load in flight | Prior figures stay on screen; chip reads *Checking…* | Blanking a populated screen |

### 6.3 Provenance affordance

Rows sourced from `file_import` carry a subtle marker; charts shade imported spans. A user reading a
grid must be able to tell a streamed value from one typed into a spreadsheet three weeks later
without leaving the row.

---

## §7 · Screen plans

Band structure per screen, in the vocabulary of [admin-layout-guide.md](admin-layout-guide.md)
§0–§2. Every table is full width — a table never sits in a column beside a chart. Charts may go
two-up.

### 7.1 Overview — `/overview`

Role-adaptive. **Two compositions, not one composition with things hidden.**

#### Composition A — Fleet (Super Admin, Admin, Service Engineer)

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` header | Title, fleet freshness chip (*N of M devices reporting*), date context |
| 2 | `TileDeck` | **Needs attention** · **On battery** · **Offline** · **Healthy** — counts, 4-up from sm |
| 3 | `WsTable`, full width | The category pane: ranked sites for the selected tile. Site · severity · what's wrong · age · assignee |
| 4 | Two-up charts | Alarms by severity, 7 days · Fleet energy summary |

Band 2 is a `TileDeck`, not a `KpiStrip`: clicking a figure opens the section that explains it, so
these are navigation and must be a real `tablist` with roving tabindex, arrow keys and
`aria-labelledby` on the pane. A `KpiStrip` would be wrong — its inset hairline only works in a
single row, and these are selectable.

This band structure replaces a KPI-card dashboard with an action queue. Rakesh's stated need is
*"which three stores to worry about this morning"*, and a count of total devices does not answer it.

#### Composition B — Site readiness (User / store operator)

One card. One sentence. One number.

```
┌──────────────────────────────────────────────┐
│  ⚡ Running on battery                        │
│                                              │
│  3 h 20 min          remaining at current load│
│                                              │
│  Support has been notified.                  │
│  Engineer assigned — Imran, ETA 45 min.      │
│                                              │
│  [ Call support ]                            │
└──────────────────────────────────────────────┘
```

Priya's intrinsic task is *will I keep trading?* Every fleet widget on her screen is extraneous
load — cognitive cost with no path to her decision. Serving her the same grids as a field engineer
serves neither well. This composition requires no new data: SOC, capacity and present load are all
collected today. It needs one derivation, one notification channel and one screen in plain language.

### 7.2 Site detail — `/sites/:siteId` — **the anchor screen**

The screen that justifies the Site object. It collapses the three-page diagnostic journey — open
BMS, open GTI, open Meter, join them mentally on device ID and timestamp — to zero navigations.

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` + `WsContext` | Breadcrumb *Sites / Store 214*. Status chip, last-seen, address, contact with tap-to-call, map link |
| 2 | `KpiStrip` | Readiness · Autonomy remaining · Load now · Yield today · Open alarms |
| 3 | **Shared timeline**, full width | Stacked state bands over one time axis — grid present, UPS mode, inverter mode, BMS protection — with SOC overlaid, outages shaded, alarm markers pinned |
| 4 | Asset cards, 2-up from md | One per co-located asset. 3–4 banded headline measures, freshness, link to its telemetry |
| 5 | Cell health (BMS present) | Per-cell bar chart, min/max/delta callout, weak cell named |
| 6 | `WsTable`, full width | Site history — alarms, visits, imports, interleaved |

Band 2 is a `KpiStrip`, not a `TileDeck`: these five figures are one reading of a site's condition,
meant to be read as a set, not a menu.

**Band 3 is the load-bearing panel.** Tesler's Law — the cross-asset join is irreducible complexity;
today the *user* absorbs it, holding a device ID and a timestamp in working memory while navigating
between sibling pages. Putting all four assets on one time axis moves that complexity into the
system, which is the only place it can go. The meter's import spike and the inverter's transfer to
grid and the battery's low-voltage cut-off become one visible causal chain instead of three
readings a person has to correlate.

### 7.3 Alarm inbox — `/alarms`

| Band | Component | Contents |
|---|---|---|
| 1 | `WsPage` header | Counts by severity, `aria-live` announcement on change |
| 2 | `FilterBar` | Severity · class · site · state · `WsDateRange` |
| 3 | `WsTable`, full width | Severity · site · asset · rule · opened · age · state · assignee. Bulk ack/assign. Row click → detail |

**Behave like an inbox.** Jakob's Law is the strongest argument available against a clever novel
control here: users arrive with a working mental model of a queue from email and ticketing tools —
unread/read, select-many, act-on-selection, assign, resolve. Matching it costs nothing and every
deviation costs relearning.

Empty state distinguishes *no active alarms* from *no rules configured* from *not loaded*. The
first is good news; the second is a configuration gap that will silently produce the first forever.

`/alarms/:alarmId` carries the alarm, its triggering series with the threshold drawn on it, the
fault decode (code → severity → probable causes → recommended checks), site history for the same
device, and the ack / assign / resolve controls with a fault-cause taxonomy on resolution.

> **Always show the evidence behind a flag** — the series, the threshold, the window. An unexplained
> flag destroys trust the first time it is wrong, and it will be wrong.

### 7.4 Assets registry — `/assets`

Band 1 header · Band 2 `FilterBar` · Band 3 full-width `WsTable`.

Columns: device · site · class · model · nameplate completeness · freshness · state · assigned user.
`lockFirstColumn` — the table is wide and the device name must not scroll away.

Bulk select drives bulk edit and bulk assign. Sunita's entire backlog is that 200 devices currently
means 200 dialogs.

### 7.5 Device detail — `/assets/:deviceId`

Band 1 `WsPage` + `WsContext` (nameplate summary, site link, freshness) · Band 2 `KpiStrip` of
banded headline measures · Band 3 chart with selectable Y parameter and threshold lines drawn ·
Band 4 full-width `WsTable` of readings with provenance · Band 5 device history (alarms, visits,
firmware).

The six documented tabs (Chart, General, Hour, Day, BMS, GTI) collapse into Band 3's parameter and
interval selectors. Six tabs that differ only by sampling interval are six places to look for one
answer.

### 7.6 Telemetry — `/telemetry/:class`

Band 1 header + `FcSubNav` across the five classes · Band 2 `WsDateRange` + site/device filter ·
Band 3 chart panel · Band 4 full-width `WsTable`.

Wide by design — the BMS grid carries ~20 columns and that is legitimate for an analyst comparing
across the fleet. Ship a **default visible set of 8**, with the rest available through the Columns
menu and remembered per user under `wfm-table-prefs`. Chunking, not capping: the columns are not
wrong because there are twenty, and hiding ones an analyst needs would be simplification into
uselessness.

### 7.7 The remainder

| Screen | Band structure | Note |
|---|---|---|
| `/sites` | Header · map with status pins · full-width table | Map and table, never side by side |
| `/alarms/rules` | `SettingSection` per device class | Long configuration surface, grouped and titled |
| `/reports` | Header · type picker · filters · full-width output table | Add period-over-period comparison; the module currently produces extracts, not reports |
| `/data/import` | Header · dropzone · **dry-run validation report** · commit | Never commit before showing row-level rejects |
| `/data/history` | Header · full-width table | Batch rollback by `import_batch_id` |
| `/data/health` | Header · `KpiStrip` · two-up charts | Ingestion lag, parse failure rate, reporting vs expected |
| `/admin/*` | List + `FormDialog` | Not a split pane — keeps tables full width |
| `/account/support` | Header · full-width ticket table · detail | Closes the loop; ticket `status` exists in the model today and no UI reads it |

---

## §8 · Roles and scope

Five roles. One is new.

| Role | id | Scope | Change from today |
|---|---|---|---|
| Super Admin | 1 | All | Gains audit log, organisation settings |
| Admin | 2 | All | **Removed from public registration** — self-elected admin is a security defect |
| Service Engineer | 3 | Assigned sites | Gains alarm assignment, visit logging |
| User (store operator) | 4 | Own site | Gains readiness composition (§7.1B) |
| **Analyst** ★new | 5 | All, read-only | Cohort analysis, evidence export. Serves the warranty persona, who has no role and no screen today |

| Node | 1 | 2 | 3 | 4 | 5 |
|---|:-:|:-:|:-:|:-:|:-:|
| Overview | ✅ | ✅ | ✅ | ✅ B | ✅ |
| Alarms — inbox | ✅ | ✅ | ✅ | ✅ own | ✅ read |
| Alarms — rules | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sites | ✅ | ✅ | ✅ assigned | ✅ own | ✅ |
| Assets | ✅ | ✅ | ✅ | ✅ own | ✅ |
| Telemetry | ✅ | ✅ | ✅ scoped | ✅ scoped | ✅ |
| Reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| Data | ✅ | ✅ | ❌ | ❌ | ❌ |
| Administration | ✅ | ✅ partial | ❌ | ❌ | ❌ |

**Scope is separated from role.** `role` says what a user may do; `scope` (fleet / site set / single
site) says what they may do it to. Conflating them is why a fifth role currently cannot be added
without touching every data-fetch call site.

> **Gap, carried from the WFM guide and still open here.** There is no permission-denied layout.
> Locked *content* has `WsLockedChip`; locked *routes* render nothing. With five roles and
> route-level differences this now needs designing — it is no longer theoretical.

---

## §9 · Components

| Carried from WFM unchanged | New for this product |
|---|---|
| `WsShell` · `WsPage` · `WsContext` · `WsSection` | `SiteTimeline` — the stacked state-band chart (§7.2 band 3) |
| `WsTable` · `wsCols` · `DataTable` | `BandedValue` — value + band + unit + `MetricInfo` |
| `KpiStrip` · `KpiTile` · `TileDeck` | `FreshnessChip` — live/late/stale/offline |
| `PanelHeader` · `StatusChip` · `WsTag` | `CellBars` — per-cell voltage bar chart |
| `FormDialog` · `SettingSection` · `OptionCard` | `AlarmRow` · `AlarmLifecycle` |
| `FilterBar` · `WsDateRange` · `GridEmptyOverlay` | `NameplateBlock` — with a completeness indicator |
| `MetricInfo` · `EChartCard` · `EmptyState` | `ReadinessCard` — §7.1B, the whole composition |

`StatusChip` needs one correction before reuse: it infers palette from text, and maps `Active` to
warning. In this product `Active` is a device lifecycle state and reads as good. Pass an explicit
band rather than relying on inference.

---

## §10 · Design tokens

From the Figma *02 Foundations — Color* page into `src/lib/tokens.js` + `src/tokens.css`, generated
— never hand-edited.

| Group | Tokens |
|---|---|
| Brand | `blue-50…950` (primary `blue-500` `#0467b2`) · `orange-50…950` (accent `orange-500` `#ee7304`) |
| Neutral | `neutral-50…950` |
| Status | `success` · `warning` · `danger` · `info` at 100/500/700, plus `status-*-foreground` / `status-*-background` pairs |
| Surface | `canvas` · `raised` · `overlay` · `base` · `subtle` |
| Text | `primary #141414` · `secondary #474747` · `tertiary #616161` · `disabled #a3a3a3` · `on-brand` |
| Border | `subtle #e0e0e0` · `default #c7c7c7` · `strong #808080` |
| Action | `primary` and `accent`, each `rest` / `hover` / `pressed` |
| Focus | `focus-ring #0467b2` |
| Type | Inter — `Display/XL` 56 · `Heading/2` 32 · `Heading/3` 28 · `Title/L` 20 · `Title/M` 18 · `Label/L` 14 · `Label/M` 12 · `Label/S` 10 · `Body/L` 16 · `Body/M` 14 · `Body/S` 12 · `Data/Mono` 14 |

Two things to resolve before generating:

> **The type ramp does not match the WFM ramp.** Figma gives 10/12/14/16/18/20/28/32/56; the WFM
> convention is 10/12/14/16/20/24/28/32/40 at weights 400/600/700. Figma's `Heading/2` is 32 (shared),
> but 18 and 56 are new and 24/40 are absent. Reconcile in one direction and generate from it —
> two ramps in one app is the most common source of *this looks AI-designed*.

> **Only light-mode values resolved.** The Figma collection documents light and dark resolutions per
> token, but the variable read returned a single mode. Dark values must be pulled per-mode before
> the token file is generated; the WFM guide requires verifying every layout in both themes, and
> inherited text colour going black in dark mode is a known failure here.

---

## §11 · API deltas

The documented API is 35 endpoints. This plan adds the following; nothing in the existing set is
removed.

| Area | Endpoints |
|---|---|
| Sites | `GET/POST /api/sites` · `GET/PUT/DELETE /api/sites/{id}` · `GET /api/sites/{id}/assets` · `GET /api/sites/{id}/timeline?from&to` |
| Nameplate | `GET/PUT /api/devices/{id}/nameplate` · `POST /api/devices/bulk` |
| Alarms | `GET /api/alarms` · `GET /api/alarms/{id}` · `POST /api/alarms/{id}/ack|assign|resolve` |
| Rules | `GET/POST /api/rules` · `PUT/DELETE /api/rules/{id}` |
| Visits | `POST /api/visits` · `GET /api/devices/{id}/visits` |
| Faults | `GET /api/fault-codes?model=` |
| Import | `POST /api/imports/dry-run` · `POST /api/imports/commit` · `DELETE /api/imports/{batchId}` |
| Health | `GET /api/health/ingestion` |
| Audit | `GET /api/audit` |

**Server-side authorisation on every one of them, from JWT claims.** Role currently lives in a
readable cookie and is checked in the client; that is a UI convenience, not access control, and it
is a sales blocker before it is a security defect.

---

## §12 · Build phases

Sequencing follows the dependency chain, not the impact ranking — nameplate before bands before
alerting, because the reverse order means writing rules against fields whose safe range is unknown.

| Phase | Contents | Gate |
|---|---|---|
| **0 · Foundation** | Vite + React 19 + MUI v9 · tokens generated from Figma (both modes) · `WsShell` · routing · auth · the WFM table and page primitives ported | Shell renders in light and dark, LTR and RTL |
| **1 · Trust** | Site + nameplate objects · band registry + `BandedValue` · freshness classification · empty-state taxonomy · fault dictionary | 100 % of numeric fields carry a unit and a band; offline devices visible within one interval |
| **2 · The anchor** | Site list · **site detail with shared timeline** · cell bars · asset cards | Cross-asset diagnosis without leaving one screen |
| **3 · The loop** | Alarm + Rule objects · inbox · rule config · ack/assign/resolve · notification channels · readiness composition | Detection precedes the phone call |
| **4 · Breadth** | Telemetry pages · registry · reports with comparison · data import with dry-run · administration · audit | Parity with the documented product, on the new structure |
| **5 · Field** | PWA — scan-to-find, one-screen health, offline read cache, visit logging | The engineer stops bypassing the platform on site |

Phases 1 and 2 are where the product stops being a data access platform. Phase 4 looks like the
largest but is the most mechanical — it is ~15 screens of `WsPage` + `FilterBar` + `WsTable` against
an established pattern.

**Explicitly deferred:** no new device classes, no new telemetry fields unless a derived metric
requires one, no machine learning, no control or command dispatch until audit and authorisation
land.

---

## §13 · Open questions

Answers change the build; none of them block Phase 0.

| # | Question | Blocks |
|---|---|---|
| Q1 | Can a device be visible to two users — a store operator *and* an engineer? `assigned_user` is singular; the assignment API takes an array. | Scope model, §8 |
| Q2 | What is the expected reporting interval, per device class? Freshness classification is defined against it and it is unstated everywhere. | §6.1 |
| Q3 | Does nameplate exist anywhere for the current fleet, or is backfill a manual data operation? | Phase 1 sizing |
| Q4 | Sign convention on pack current — positive charge or positive discharge? | Every band on current |
| Q5 | Which ramp wins, Figma's or WFM's? | Token generation |
| Q6 | Is the fifth role (Analyst) in scope, or does warranty work stay an export? | §8 |
| Q7 | Notification channels available — push, email, SMS, WhatsApp? Email is currently wired for OTP only. | Phase 3 |

---

Written 17 August 2026 against the four source artefacts, the competitive analysis v1.0, the Genus
WFM layout and table guides, and the Figma colour foundations page. Thresholds in §5.3 are domain
defaults and are marked for re-derivation. Nothing here has been built.
