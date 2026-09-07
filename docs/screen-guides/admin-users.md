---
route: /admin/users
page: src/pages/admin-users.jsx
title: Administration — Users
status: reviewed
updated: 2026-08-24
aliases: [users, accounts, people, user management, add user, provisioning]
dataModules: [src/lib/hierarchy.jsx, src/lib/programme-data.js, src/lib/rbac.js]
relatedScreens: [/admin/roles, /admin/organisation]
---

# Administration — Users

> Two populations in one table: accounts **observed in the data**, and accounts
> **provisioned here**. They are not the same thing.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **A provisioned account reaches no server and does not survive a reload.** See §8.

---

## 1. Overview

**Two populations, one table. [C]**

| Population | What it is | Its "role" | Its survey count |
|---|---|---|---|
| **Observed** | Read back off the two extracts | **A descriptor of what they did, not a grant** **[C]** | Real **[C]** |
| **Provisioned** | Created here, with an RBAC role and a hierarchy scope | One of the five RBAC roles **[C]** | **A true 0** — they have done nothing yet, which is not a missing value **[C]** |

That distinction is the point of the screen. An observed "surveyor" is someone the data
says surveyed; a provisioned Analyst is someone granted a role that governs nothing yet.

**There is no auth backend, and the screen says so three times. [C]**

> *"There is no auth backend, so a provisioned account reaches no server and does not
> survive a reload. The screen says so in three places — the subtitle, the dialog, and the
> row's own origin chip — **because a form that silently discards its submit is worse than
> no form**."*

**When you would come here.** Seeing who touched the data. Drafting an access list.
Checking which roles exist.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Admin / Super Admin** | Draft the access list |
| **Analyst** | Who produced a survey |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/admin/users` **[C]** |
| **Navigation** | Rail → Administration → Users |

## 4. Screen Layout

```
Title / subtitle   Users — the subtitle states the no-backend limit
Context bar        Scope · Level · Accounts · Provisioned
Table              Accounts — origin chip distinguishes observed from provisioned
Dialog             Add user — restates the limit
```

## 5. Component-by-Component Guide

### Origin chip

| | |
|---|---|
| **Purpose** | Tell the two populations apart at a glance |
| **Values** | **Observed** (from the extracts) · **Provisioned** (created here) **[C]** |
| **Why it matters** | An observed role describes behaviour; a provisioned role is a grant that governs nothing **[C]** |

### Survey count

| | |
|---|---|
| **Observed accounts** | Real counts from the extracts **[C]** |
| **Provisioned accounts** | **A true 0**, not a blank — they have done nothing yet **[C]** |

### Add user dialog

| | |
|---|---|
| **Fields** | One of the five RBAC roles, plus a hierarchy scope **[C]** |
| **What happens on submit** | The row appears. **Nothing reaches a server, and it is gone on reload** **[C]** |
| **Where this is stated** | Subtitle, dialog and origin chip — three places **[C]** |

## 6. Data Sources and Data Flow

```
the two source extracts
  └─> observed accounts (role = a descriptor, survey count real)

this screen's own state
  └─> provisioned accounts (role = an RBAC grant, survey count 0)
       └─> NOT persisted, NOT sent anywhere      dms-parity-plan.md Phase 6

src/lib/rbac.js
  └─> the five roles offered
```

| Displayed value | Source | Mark |
|---|---|---|
| Observed accounts | the extracts | **[C]** |
| Provisioned accounts | in-page state only | **[C]** |
| The five roles | `rbac.js` | **[C]** |
| Auth backend | **does not exist** | **[C]** |

## 7. Charts, Metrics, and Dashboards

No charts.

## 8. Available Actions

### Add a user

| | |
|---|---|
| **Steps** | Add user → choose a role and scope → submit |
| **Expected result** | A row with a **Provisioned** origin chip |
| **Data affected** | **None beyond this page.** No server, no persistence **[C]** |
| **On reload** | **The account is gone** **[C]** |
| **Why offer it at all** | To draft and discuss an access list; the screen is explicit rather than pretending **[I]** |

## 9. Use Cases

### "Who surveyed this area?"
Observed accounts and their real survey counts.

### "Draft an access list for the workshop."
Add provisioned users — but export or record the outcome before reloading. §14.

### "Why does this user show 0 surveys?"
If provisioned, that is a true zero.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Add a user | A provisioned row appears | Yes **[C]** |
| Reload | **Provisioned users disappear** | Yes **[C]** |
| Change scope | Accounts re-scope | Yes **[I]** |

## 11. Navigation

**Reached from:** rail → Administration → Users.
**Leads to:** [Roles](/admin/roles); [Organisation](/admin/organisation).

## 12. Roles and Permissions

Not permission-gated **[C]**. Ironically, the user-management screen has no access control
— because none exists anywhere.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Observed only** | Fresh load | Accounts from the extracts **[C]** |
| **With provisioned** | After adding | Extra rows with the Provisioned chip **[C]** |
| **After reload** | Always | Provisioned rows gone **[C]** |

## 14. Common Questions

**Q. I added a user and they vanished after reload.**
A. Expected. There is no auth backend, so a provisioned account reaches no server. The
screen states this in the subtitle, the dialog and the row's origin chip. **[C]**

**Q. What is the difference between Observed and Provisioned?**
A. Observed accounts are read off the extracts — their role describes what they **did**.
Provisioned accounts are created here with an RBAC role and scope, and have done nothing
yet. **[C]**

**Q. Why does a provisioned user show 0 surveys instead of blank?**
A. Because it is a **true zero**, not a missing value. They genuinely have done nothing.
**[C]**

**Q. Does assigning a role restrict anything?**
A. No. No enforcement exists anywhere in the application. **[C]**

**Q. Why offer a form that does not save?**
A. To draft and discuss an access list. The screen is explicit about the limit in three
places, because a form that silently discards its submit would be worse than no form.
**[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Added users disappear | No backend | Expected; record the outcome elsewhere **[C]** |
| A role has no effect | No enforcement | Expected **[C]** |
| Someone missing | Only appears if in the extracts or added here | Add them **[C]** |

## 16. AI Assistant Questions

- "Why did the user I added disappear?"
- "What is the difference between observed and provisioned accounts?"
- "Does assigning a role actually restrict anything?"
- "Why does a provisioned user show 0 surveys?"
- "Is there an auth backend?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| When auth will exist | dms-parity-plan.md Phase 6, undated | Roadmap |
| Whether observed accounts become real accounts | Not designed | Product decision |
| API / database | No backend | The API specification |
