---
route: /admin/roles
page: src/pages/admin-roles.jsx
title: Administration — Roles
status: reviewed
updated: 2026-08-24
aliases: [permissions, access matrix, roles, RBAC, who can do what, access control]
dataModules: [src/lib/hierarchy.jsx, src/lib/rbac.js]
relatedScreens: [/admin/users, /alarms/rules]
---

# Administration — Roles

> An editable access matrix over five roles. **It governs nothing today, and it does not
> survive a reload.**

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **This is the screen most likely to be misunderstood on the whole platform.** It looks
> like access control. It is a design artefact.

---

## 1. Overview

**Nothing is enforced, and nothing persists. [C]**

> *"There is no auth layer, so these grants govern nothing today and are gone on reload.
> Stated in the banner rather than [left to be discovered]."*

**The baseline is kept so the diff is exact. [C]**

> *"The plan's own table is frozen in `rbac.js` as `ROLE_BASELINE` / `MATRIX_BASELINE` and
> is never written to. Every edit lands on a copy, so `rbacDiff()` can answer 'what did we
> change' exactly — which is the artefact worth having after an access workshop. **A session
> where someone toggles fifteen cells is useless if nobody can reconstruct which fifteen.**"*

**So what is this screen for?** Designing and recording an access model — the output is the
diff, to be implemented later. It is **not** a control panel.

**When you would come here.** Running an access workshop. Recording an intended model.
Checking which roles exist.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Admin / Super Admin** | Design the access model |
| **Analyst** | Understand the intended model |

> **Roles are designed, not enforced — and this is the screen that designs them. [C]** See
> [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/admin/roles` **[C]** |
| **Navigation** | Rail → Administration → Roles |

## 4. Screen Layout

```
Title              Roles
Banner             nothing is enforced; nothing persists
KPI strip          Changed from plan · Nav nodes governed
Matrix             roles × permission nodes, editable
```

## 5. Component-by-Component Guide

### The banner

States plainly that grants govern nothing and are lost on reload **[C]**. **Read it
first** — everything else on the screen looks like it works.

### KPI — Changed from plan

| | |
|---|---|
| **Purpose** | Exactly how far the current matrix has moved from the specified baseline |
| **Calculation** | `rbacDiff()` against the frozen `MATRIX_BASELINE` **[C]** |
| **Why it matters** | **This is the screen's actual output.** The artefact worth having after a workshop **[C]** |

### KPI — Nav nodes governed

How many permission nodes the matrix covers **[C]**.

### The matrix

| | |
|---|---|
| **Rows / columns** | Permission nodes × the five roles, plus any role added here **[C]** |
| **Editing** | Every edit lands on a **copy**; the baseline is never written **[C]** |
| **Effect on the product** | **None.** No route guard reads this **[C]** |
| **Persistence** | **None.** Gone on reload **[C]** |

### The five roles **[C]**

Super Admin · Admin · Service Engineer · User (store operator) · Analyst.

## 6. Data Sources and Data Flow

```
src/lib/rbac.js
  ├─ ROLE_BASELINE / MATRIX_BASELINE     frozen, never written
  └─ working copy                        every edit lands here
       ├─> rbacDiff()  → "Changed from plan"
       └─> the matrix UI

(nothing else reads this)
  no route guard · no conditional rendering · no API
```

| Displayed value | Source | Mark |
|---|---|---|
| Roles and nodes | `rbac.js` baseline | **[C]** |
| Edits | in-page working copy | **[C]** |
| Enforcement | **none anywhere** | **[C]** |
| API / database | — | **[U]** |

**Verified:** `rbac.js` is imported by exactly two screens — this one and
[Users](/admin/users) — both of which display and edit it **[C]**.

## 7. Charts, Metrics, and Dashboards

The KPI strip is in §5.

## 8. Available Actions

### Toggle a grant · Set a whole role column · Add a role

| | |
|---|---|
| **Expected result** | The matrix updates and *Changed from plan* moves |
| **Data affected** | **Nothing outside this page** **[C]** |
| **On reload** | **All edits are lost** **[C]** |
| **How to keep the outcome** | Record the diff before leaving **[I]** |

## 9. Use Cases

### "Design our access model."
Edit the matrix, then capture *Changed from plan* — that diff is the deliverable.

### "Restrict Analysts from the admin screens."
You can express it here. **It will not take effect.** §14.

### "Which roles exist?"
The five columns.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Toggle a grant | Matrix + diff | Yes **[C]** |
| Reload | **Everything resets to baseline** | Yes **[C]** |
| An edit here | **Nothing in the rest of the product** | **[C]** |

## 11. Navigation

**Reached from:** rail → Administration → Roles.
**Leads to:** [Users](/admin/users).

## 12. Roles and Permissions

**The permissions screen is not itself permission-gated. [C]** Anyone who can open the app
can edit the matrix — which is harmless precisely because it enforces nothing.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Baseline** | Fresh load | The specified matrix **[C]** |
| **Edited** | After toggling | *Changed from plan* > 0 **[C]** |
| **After reload** | Always | Back to baseline **[C]** |

## 14. Common Questions

**Q. I set permissions but nothing changed.**
A. Correct. There is no auth layer, so these grants govern nothing. No route guard or
conditional rendering reads this matrix. **[C]**

**Q. My changes disappeared after reload.**
A. Expected — nothing persists. Capture *Changed from plan* before leaving. **[C]**

**Q. Then what is this screen for?**
A. Designing and recording an access model. Every edit lands on a copy so the diff is
exact — a workshop where someone toggles fifteen cells is useless if nobody can reconstruct
which fifteen. **[C]**

**Q. Can I use this to restrict a user right now?**
A. No. Nothing in the product is permission-gated. **[C]**

**Q. How is this different from Alarm rules?**
A. Alarm rules are **load-bearing today** — editing one repaints the product. This governs
nothing. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Permissions have no effect | No enforcement exists | Expected **[C]** |
| Changes lost | No persistence | Record the diff first **[C]** |
| A user still sees everything | Same reason | Expected **[C]** |

## 16. AI Assistant Questions

- "Why don't my permission changes do anything?"
- "Does Genus Solar have access control?"
- "What is the Roles screen for if it enforces nothing?"
- "Why do my role changes disappear on reload?"
- "How is the Roles screen different from Alarm rules?"
- "Which roles exist in the platform?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| When enforcement will exist | dms-parity-plan.md Phase 6, undated | Roadmap |
| Whether this matrix will be the source of truth | Not decided | Auth design |
| How the diff would be applied | No mechanism | Auth design |
