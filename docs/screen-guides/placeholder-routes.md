---
route: /account/profile, /account/support, /telemetry/solar, /admin/audit
page: src/pages/placeholder.jsx
title: Placeholder Routes
status: reviewed
updated: 2026-09-08
aliases: [profile, my account, support tickets, not built, coming soon, empty screens, solar, pv generation, specific yield, inverter, audit log, who changed what]
dataModules: [src/lib/hierarchy.jsx]
relatedScreens: [/admin/users, /admin/roles, /telemetry/meter, /data/health, /data/history, /overview]
---

# Placeholder Routes — the four blocked destinations

> Four nav destinations that resolve to a real screen explaining **what specifically is
> missing** — not "coming soon".

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> One guide covers all four routes: they render the same component, and writing it up four
> times would be duplication pretending to be coverage.

---

## 1. Overview

**Why these routes exist at all. [C]**

> *"Every nav destination resolves to a real route from day one, so the rail is never a set
> of dead links."*

**Why the message is not "not built yet". [C]**

> *"'Not built yet' was the wrong message. It reads as backlog — as though someone simply
> has not got to it. Four routes remain, and **not one of them is waiting on effort**. Each
> is waiting on something specific that does not exist: an object that appears in no
> payload, or an auth layer that has not been written. A screen built over either would
> have to invent its rows."*

So each placeholder names its **actual blocker**, and what would lift it. That is the whole
content of the screen, and it is more useful than a progress bar.

**Two kinds of blocker, and they resolve differently. [C]** The screen labels which one it
is, because a missing extract is an integration question and a missing auth layer is a
build one — different people, different timescales.

| Route | Would show | Blocked on | Kind |
|---|---|---|---|
| `/telemetry/solar` | Specific yield per rooftop — generation against installed kWp | No inverter object in any payload, **and** no `rated_kw` on the nameplate | **No such data** **[C]** |
| `/admin/audit` | Who changed what, when, and from where | No auth layer, and nothing writes a durable change | **No backend** **[C]** |
| `/account/profile` | Your own details, scope, preferences, sign-out | No sign-in, so there is no "you" | **No backend** **[C]** |
| `/account/support` | Raise and track an issue against a site or device | No ticket store anywhere, including in the source DMS | **No backend** **[C]** |

**When you would come here.** Clicking Solar, Audit log, Profile or Support and wanting to
know why there is nothing there.

## 2. Who Uses This Screen

Anyone who clicks the nav item. **[C]** Solar and Audit log are the two a programme
reviewer is most likely to reach for, because both are standard in a DMS and their absence
here is deliberate rather than accidental **[I]**.

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Routes** | `/telemetry/solar` · `/admin/audit` · `/account/profile` · `/account/support` **[C]** |
| **Navigation** | Telemetry → Solar · Administration → Audit log · account menu **[C]** |
| **Registered** | Not written out one by one — every nav destination without a built screen becomes one of these routes automatically **[C]** |

## 4. Screen Layout

```
Title              what the screen would be
Kind chip          "No such data"  |  "No backend"
Body               what it would show · what specifically blocks it · what would unblock it
Related            links to the screens that DO carry the nearest real data
```

## 5. Component-by-Component Guide

### The explanation

| | |
|---|---|
| **Purpose** | Name the **specific** blocker, not a status |
| **Kind chip** | `No such data` (warning) or `No backend` (info) — which kind of problem it is **[C]** |
| **Unblocks list** | What would have to arrive. This is the part that makes it a work item rather than an apology **[C]** |
| **Related links** | Where the nearest real data lives, so the visit is not wasted **[C]** |
| **Why not "coming soon"** | That reads as backlog. These are not waiting on effort **[C]** |

### An unspecified route

A nav destination with no entry in the page's `SPEC` renders a different message: that the
route exists in the navigation but has no specification recorded. **[C]** Seeing it means
somebody added a nav item without deciding what it is — the screen says so rather than
rendering a confident-looking blank.

## 6. Data Sources and Data Flow

**No data. [C]** These screens render an explanation. `hierarchy.jsx` is imported for the
shell's scope context, not for content **[I]**.

| Displayed value | Source | Mark |
|---|---|---|
| The explanation | the page itself | **[C]** |
| PV generation | **does not exist** — no inverter object in any sample payload | **[C]** |
| Installed capacity | **does not exist** — `rated_kw` absent from the nameplate | **[C]** |
| Audit entries | **do not exist** — no auth layer, and no write path to record | **[C]** |
| Profile data | **does not exist** — no auth layer | **[C]** |
| Support tickets | **do not exist** — no such object in any payload | **[C]** |

## 7. Charts, Metrics, and Dashboards

Not applicable. Specific yield would be the chart on `/telemetry/solar`, and it has neither
a numerator nor a denominator **[C]**.

## 8. Available Actions

**None. [C]** Read the explanation and follow a related link.

## 9. Use Cases

### "Where is the solar generation screen?"
Blocked twice over, independently. No inverter object appears in any sample payload — the
stream named "GTI Data" carries a net meter, not an inverter — so there is no generation
figure. And `rated_kw` is absent from the device nameplate, so there is nothing for
generation to be a fraction of. The nearest real data is
[Meter telemetry](/telemetry/meter), which shows what the stream actually carries. **[C]**

### "Who changed this threshold, and when?"
Not recorded. An audit entry is an event that has to have happened: there is no auth layer,
so no action is attributable to anyone, and nothing in the product writes a change anywhere
durable. [Batch history](/data/history) is the closest thing to a log that real data
supports. **[C]**

### "Where are my profile settings?"
There is no auth layer, so there is no profile to show. Appearance preferences live on
[Appearance](/admin/appearance) and are stored per browser.

### "How do I raise a support ticket?"
Not in this product. Use your existing support channel. **[I]**

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Navigating here | The explanation renders | Yes **[C]** |
| Changing scope | Nothing — these screens hold no scoped data | **[C]** |
| Anything else | Nothing | **[C]** |

## 11. Navigation

**Reached from:** Telemetry → Solar, Administration → Audit log, and the account menu
**[C]**.
**Leads to:** the related screens each placeholder links to, or anywhere else.
**Breadcrumbs:** standard shell **[I]**.

## 12. Roles and Permissions

Not permission-gated **[C]** — and could not be, since there is no auth layer, which is
precisely what blocks three of the four.

## 13. Screen States

One state per route: the explanation **[C]**. There is no loading state, no empty state and
no error state, because nothing is fetched.

A second state exists for a route that is in the nav but not in the page's `SPEC` — "no
specification recorded" **[C]**. It is a defect message, not a normal state.

## 14. Common Questions

**Q. Why is this screen empty?**
A. It is not empty — it explains what specifically blocks the screen, and what would lift
the block. **[C]**

**Q. Why is there no Solar screen when this is a solar programme?**
A. Because the data for it does not exist yet, in two independent ways: no payload carries
an inverter reading, and the nameplate carries no rated capacity. A screen built now would
have to invent both numbers. **[C]**

**Q. Is the audit log switched off, or missing?**
A. Missing, and deliberately. A log rendered today would be empty or fabricated, and an
empty audit log is indistinguishable from a broken one. **[C]**

**Q. Why does the nav link to a screen that does nothing?**
A. So the rail is never a set of dead links. Every destination resolves to a real route.
**[C]**

**Q. When will these be built?**
A. **[U]** — not recorded. Each is waiting on something specific, not on effort. **[C]**

**Q. Where do I change my settings then?**
A. [Appearance](/admin/appearance) for how the product looks — stored in your browser.
There is no user profile. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Solar shows no chart | No inverter object and no `rated_kw` | Expected — read the blocker **[C]** |
| Audit log lists nothing | No auth layer, no write path | Expected; use [Batch history](/data/history) **[C]** |
| Nothing on Profile | No auth layer | Expected **[C]** |
| No support ticketing | No such object exists | Use your existing channel **[I]** |
| "No specification recorded" | A nav item was added with no entry in the page's `SPEC` | Report it — this one is a defect **[C]** |

## 16. AI Assistant Questions

- "Why is there no Solar telemetry screen?"
- "Where can I see who changed a role or a threshold?"
- "Why is the Profile screen empty?"
- "How do I raise a support ticket in Genus Solar?"
- "What would have to happen for the Solar screen to be built?"
- "Why does the nav link to screens that do not work?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| When these will be built | Not recorded | Roadmap |
| Whether an inverter stream is coming at all | Not recorded — only the gateway's `INVERR` flag hints an inverter exists | An integration answer on the gateway payload |
| Where rated capacity would come from | Absent from every nameplate seen | A nameplate extract carrying `rated_kw` |
| What Profile would contain | No auth design | Auth design |
| Whether support ticketing is in scope at all | Not decided | Product decision |
