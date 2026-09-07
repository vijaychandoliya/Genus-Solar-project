---
route: /account/profile, /account/support
page: src/pages/placeholder.jsx
title: Placeholder Routes
status: reviewed
updated: 2026-08-24
aliases: [profile, my account, support tickets, not built, coming soon, empty screens]
dataModules: [src/lib/hierarchy.jsx]
relatedScreens: [/admin/users, /overview]
---

# Placeholder Routes — Profile & Support

> Two nav destinations that resolve to a real screen explaining **what specifically is
> missing** — not "coming soon".

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> One guide covers both routes: they render the same component, and writing it up twice
> would be duplication pretending to be coverage.

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

So each placeholder names its **actual blocker**. That is the whole content of the screen,
and it is more useful than a progress bar.

**When you would come here.** Clicking Profile or Support and wanting to know why there is
nothing there.

## 2. Who Uses This Screen

Anyone who clicks the nav item. **[C]**

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Routes** | `/account/profile` · `/account/support` **[C]** |
| **Navigation** | Account menu / rail **[I]** |

## 4. Screen Layout

```
Title              Profile  |  Support tickets
Body               what this screen would show, and what specifically blocks it
```

## 5. Component-by-Component Guide

### The explanation

| | |
|---|---|
| **Purpose** | Name the **specific** blocker, not a status |
| **Typical blockers** | An object that appears in **no payload**, or an **auth layer that does not exist** **[C]** |
| **Why not "coming soon"** | That reads as backlog. These are not waiting on effort **[C]** |

## 6. Data Sources and Data Flow

**No data. [C]** These screens render an explanation. `hierarchy.jsx` is imported for the
shell's scope context, not for content **[I]**.

| Displayed value | Source | Mark |
|---|---|---|
| The explanation | the page itself | **[C]** |
| Profile data | **does not exist** — no auth layer | **[C]** |
| Support tickets | **do not exist** — no such object in any payload | **[C]** |

## 7. Charts, Metrics, and Dashboards

Not applicable.

## 8. Available Actions

**None. [C]** Read the explanation and navigate elsewhere.

## 9. Use Cases

### "Where are my profile settings?"
There is no auth layer, so there is no profile to show. Appearance preferences live on
[Appearance](/admin/appearance) and are stored per browser.

### "How do I raise a support ticket?"
Not in this product. Use your existing support channel. **[I]**

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Navigating here | The explanation renders | Yes **[C]** |
| Anything else | Nothing | **[C]** |

## 11. Navigation

**Reached from:** the account menu / rail **[I]**.
**Leads to:** anywhere else. **Breadcrumbs:** standard shell **[I]**.

## 12. Roles and Permissions

Not permission-gated **[C]** — and could not be, since there is no auth layer, which is
precisely what blocks Profile.

## 13. Screen States

One state: the explanation **[C]**.

## 14. Common Questions

**Q. Why is this screen empty?**
A. It is not empty — it explains what specifically blocks the screen. Profile needs an auth
layer that does not exist; support tickets are an object that appears in no payload. **[C]**

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
| Nothing on Profile | No auth layer | Expected **[C]** |
| No support ticketing | No such object exists | Use your existing channel **[I]** |

## 16. AI Assistant Questions

- "Why is the Profile screen empty?"
- "How do I raise a support ticket in Genus Solar?"
- "Where do I change my settings?"
- "Why does the nav link to screens that do not work?"
- "When will Profile be built?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| When these will be built | Not recorded | Roadmap |
| What Profile would contain | No auth design | Auth design |
| Whether support ticketing is in scope at all | Not decided | Product decision |
