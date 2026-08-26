---
route: /your/route
page: src/pages/your-page.jsx
title: Screen Name
status: draft
updated: YYYY-MM-DD
aliases: [what users call this screen, another name for it]
dataModules: [src/lib/example-data.js]
relatedScreens: [/other/route]
---

# Screen Name

> One sentence a new user would recognise. What this screen is for, in their words.

**Evidence marks:** **[C]** confirmed from code or source data · **[I]** inferred, with the
evidence named · **[U]** unknown — never guessed.

---

## 1. Overview

**Why this screen exists.**

**What business problem it solves.**

**When you would come here.** Three or four concrete moments.

## 2. Who Uses This Screen

| Role | Why they come here |
|---|---|

> **Roles are designed, not enforced. [C]** `src/lib/rbac.js` defines the roles and the
> permission matrix, and it is imported only by `/admin/roles` and `/admin/users`, which
> display and edit it. There are no route guards anywhere in the application — every
> route is reachable by anyone who can open the app. Treat this table as *intended*
> audience, never as access control.

## 3. How to Access It

| | |
|---|---|
| **Route** | `` |
| **Navigation** | |
| **Deep link** | |
| **Landing screen?** | |

## 4. Screen Layout

```
top to bottom, as a reader sees it
```

## 5. Component-by-Component Guide

<!-- Repeat this block for every element a user could ask about. Delete unused rows
     rather than writing "N/A" — an empty row is noise, an absent row is a decision. -->

### Component Name

| | |
|---|---|
| **Location** | |
| **Purpose** | |
| **What the user sees** | |
| **What the data represents** | |
| **Data source** | |
| **Data fields** | |
| **Calculation** | |
| **User interaction** | |
| **Trigger** | |
| **Expected result** | |
| **Permissions** | |
| **Related screens** | |
| **Possible states** | |
| **Notes** | |

## 6. Data Sources and Data Flow

**The most important section. Trace every hop you can confirm, and stop where the
evidence stops.**

```
source file → data module → derivation → page → component → displayed value
```

| Displayed value | Source | Module | Derivation | Mark |
|---|---|---|---|---|

**Update frequency.**

**What the data is NOT.** Name the plausible-but-wrong reading a user might have.

## 7. Charts, Metrics, and Dashboards

Per metric: what it means, how it is calculated, what period it covers, what filters
affect it, what a reader can conclude, and what they cannot.

*If the screen has none:* `Not applicable — this screen has no charts or metrics.`

## 8. Available Actions

### Action name

| | |
|---|---|
| **Location** | |
| **Who can perform it** | |
| **Preconditions** | |
| **Steps** | |
| **Expected result** | |
| **Data affected** | |
| **Next screen or state** | |
| **Errors and edge cases** | |

## 9. Use Cases

Task-shaped, phrased as a user would phrase it.

### "…"

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|

## 11. Navigation

**Reached from:** · **Leads to:** · **Breadcrumbs:** · **Back behaviour:**

## 12. Roles and Permissions

Restate the unenforced-RBAC fact. Then note any element that *would* be
permission-dependent once enforcement exists, marked **[I]**.

## 13. Screen States

| State | When | What the user sees | What to do |
|---|---|---|---|
| Loading | | | |
| Populated | | | |
| Empty | | | |
| No results | | | |
| Error | | | |
| Partial | | | |

## 14. Common Questions

**Q. …**
A. …

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|

## 16. AI Assistant Questions

Questions **this guide can answer**. Do not list questions it cannot.

- "…"

## 17. Known Unknowns / Information Not Available

Everything marked **[U]**, collected — so it is findable, and so it becomes a work list
when the missing system arrives.

| Unknown | Why | What would resolve it |
|---|---|---|
