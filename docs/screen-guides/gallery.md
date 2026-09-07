---
route: /gallery
page: src/pages/gallery.jsx
title: Component Gallery
status: reviewed
updated: 2026-08-24
aliases: [gallery, component showcase, style guide, storybook, all components, test page]
dataModules: [src/lib/bands.js, src/lib/programme-data.js]
relatedScreens: [/admin/design-tokens, /admin/appearance]
---

# Component Gallery

> Every component in every state, on one page. **There is no test suite; this page is the
> substitute.**

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

---

## 1. Overview

**Why this screen exists. [C]**

> *"Every component in every state, on one page, so light/dark and LTR/RTL can be verified
> by looking rather than by reasoning about JSX. There is no test suite; this page is the
> substitute and it is expected to stay current."*

**It cannot drift from the app, and that was learned the hard way. [C]**

> *"The 9 real survey rows, one source of truth shared with the Overview page. **Earlier
> drafts of this gallery hand-typed verdicts and got 5 of 9 wrong** — marking rows 'Feasible'
> that fail the shadow-free test in the rule. Now imported, so the gallery can never drift
> from what the app actually computes."*

Five of nine wrong is why nothing here is hand-typed.

**When you would come here.** Checking a Look or scheme across every component. Verifying
dark mode or RTL. Seeing what a component looks like in a state you cannot easily reach.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Designer / developer** | Verify every component in every state |
| **Admin / Super Admin** | See what a Look does everywhere at once |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/gallery` **[C]** |
| **Navigation** | **[U]** — whether it appears in the rail is not verified. Reachable by URL **[C]** |

## 4. Screen Layout

```
Sections of components, each showing its full range of states —
KPI tiles · status chips · band chips · tables · charts · dialogs ·
buttons · inputs · empty states · freshness chips …
```

## 5. Component-by-Component Guide

### Every component section

| | |
|---|---|
| **Purpose** | One component, all its states, side by side |
| **Data source** | **Imported**, never hand-typed — the same 9 survey rows Overview uses, and a real nameplate fixture **[C]** |
| **Why** | An earlier hand-typed draft got 5 of 9 verdicts wrong **[C]** |

### The battery nameplate fixture

A 48 V-class 15S LFP pack — *"enough nameplate to unlock the battery bands"* **[C]**. It
exists so band behaviour can be seen at all; without a nameplate those metrics resolve
`unknown`.

### Band and status examples

Healthy · Needs attention · Offline · On battery · Feasible · Coverage **[C]** — the real
band vocabulary, resolved through `bands.js`.

## 6. Data Sources and Data Flow

```
src/lib/programme-data.js    the same 9 survey rows Overview uses
src/lib/bands.js             the live band registry
  └─> gallery.jsx → every component, every state
```

| Displayed value | Source | Mark |
|---|---|---|
| Survey-derived examples | the same rows Overview uses | **[C]** |
| Band colours | the live registry | **[C]** |
| Battery example | a nameplate fixture, declared in the page | **[C]** |
| API / database | — | **[U] / not applicable** |

**Nothing here is hand-typed. [C]** That is the page's central rule.

## 7. Charts, Metrics, and Dashboards

Chart components appear as **examples**, not as data to read. Do not quote a figure from
this page — read it on the screen that owns it **[I]**.

## 8. Available Actions

Look. **Read-only. [C]** Change Look, scheme or mode elsewhere and return here to see the
effect everywhere at once.

## 9. Use Cases

### "Does this Look work everywhere?"
Apply it on [Appearance](/admin/appearance), then come here.

### "Check dark mode and RTL."
Switch mode or direction and scan the page — that is what it is for.

### "What states does this component have?"
Find its section.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Change Look / scheme / mode / direction | Every example repaints | Yes **[C]** |
| A component gains a state | The gallery should gain it too | **[I]** — by convention, not enforced |

## 11. Navigation

**Reached from:** `/gallery` directly.
**Leads to:** [Design tokens](/admin/design-tokens), [Appearance](/admin/appearance).

## 12. Roles and Permissions

Not permission-gated **[C]**.

**[I]** This is an internal verification page. Whether an end user should reach it is an
open question — see §17.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Populated** | Always | Every component **[C]** |
| **Reflects current theme** | Always | Whatever Look, scheme and mode you have **[C]** |

## 14. Common Questions

**Q. Is this a real screen or a test page?**
A. A verification page. There is no test suite; this is the substitute. **[C]**

**Q. Can I trust the numbers here?**
A. They are real — imported from the same source Overview uses, precisely so the gallery
cannot drift. But read figures on the screen that owns them. **[C]**

**Q. Why does it use real survey rows?**
A. An earlier hand-typed draft got **5 of 9 verdicts wrong**. Importing removed the
possibility. **[C]**

**Q. How do I check dark mode?**
A. Switch mode; every example repaints. **[C]**

**Q. Should this page be visible to end users?**
A. **[U]** — an open question.

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| A component looks wrong here | Likely wrong everywhere | Check [Design tokens](/admin/design-tokens) audit **[C]** |
| A component is missing | Gallery not updated | Add it — the page is expected to stay current **[C]** |
| Numbers differ from Overview | They should not | Report it — same source **[C]** |

## 16. AI Assistant Questions

- "What is the Gallery page for?"
- "Are the numbers on the Gallery real?"
- "How do I check dark mode across all components?"
- "Why does the Gallery import real survey data?"
- "Does Genus Solar have a test suite?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Whether `/gallery` appears in the rail | Not verified | Read the nav config |
| Whether end users should reach it | Not decided | Product decision |
| Whether every component is actually represented | By convention, not enforced | An audit |
