---
route: /data/import
page: src/pages/data-import.jsx
title: Data — Import
status: reviewed
updated: 2026-08-24
aliases: [upload, import data, load file, csv upload, dry run, validation]
dataModules: [src/lib/hierarchy.jsx, src/lib/import-schemas.js]
relatedScreens: [/data/history, /data/health]
---

# Data — Import

> Check a file **before** it is loaded. The dry run is real — it parses the bytes you
> chose, in your browser.

**Evidence marks:** **[C]** confirmed · **[I]** inferred · **[U]** unknown.

> ⚠️ **You cannot actually commit an import. There is nowhere to commit to.** See §8.

---

## 1. Overview

**Why this screen exists.** To catch a malformed file before it becomes a problem you have
to unpick.

**The dry run is real. [C]** From the page source:

> *"The dry run is real. It parses the file you choose, in the browser, and the report comes
> from the actual bytes — a mocked validation report would tell you nothing about your file,
> which is the only thing this screen exists to tell you."*

**Commit is not built, and the screen says so rather than hiding it. [C]**

> *"Commit is not built, because there is nowhere to commit to. The screen is explicit about
> the boundary rather than showing a greyed-out Commit that implies a permissions problem."*

That distinction matters: a greyed button reads as *"you lack permission"*; explicit text
reads as *"this does not exist yet"*.

**Why validate before commit, always. [C]**

> *"The consumer master arrived as 9,673 rows in one load, and finding a malformed date
> afterwards would mean unpicking it with no batch id to unpick by — which is the gap
> `/data/history` documents."*

**When you would come here.** Before sending a file to whoever loads it. To check a
supplier's export matches the expected schema.

## 2. Who Uses This Screen

| Role | Why |
|---|---|
| **Admin / Super Admin** | Validate an extract before it is loaded |
| **Analyst** | Confirm a file's shape |
| **Service Engineer** | Check a field export parses |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).

## 3. How to Access It

| | |
|---|---|
| **Route** | `/data/import` **[C]** |
| **Navigation** | Rail → Data → Import |

## 4. Screen Layout

```
Title              Import
Notice             an Alert explaining the commit boundary
Card               Choose a file
Card               Expected schema
Table              Dry-run findings
```

## 5. Component-by-Component Guide

### Choose a file

| | |
|---|---|
| **Purpose** | Pick a local file to validate |
| **What happens** | It is parsed **in your browser**. **Nothing is uploaded** **[C]** |
| **Privacy consequence** | The file never leaves your machine, so validating a file with real consumer data does not transmit it **[I]** |

### Expected schema

| | |
|---|---|
| **Purpose** | What the file is supposed to contain |
| **Data source** | `src/lib/import-schemas.js` **[C]** |
| **Use** | Send this to whoever produces the extract |

### Dry-run findings

| | |
|---|---|
| **Purpose** | What is actually wrong with **your** file |
| **Data source** | The bytes you selected, parsed live **[C]** |
| **Notes** | Not a mock. If it is empty, your file matched **[C]** |

### The commit notice

States that commit is not built and why — **not** a disabled button **[C]**.

## 6. Data Sources and Data Flow

```
your local file
  └─> parsed in the browser
       └─> checked against src/lib/import-schemas.js
            └─> Dry-run findings

(no destination)   commit is not implemented — dms-parity-plan.md Phase 5
```

| Displayed value | Source | Mark |
|---|---|---|
| Findings | your file, parsed live | **[C]** |
| Expected schema | `import-schemas.js` | **[C]** |
| Where a commit would go | — | **[U] / does not exist** |

## 7. Charts, Metrics, and Dashboards

Not applicable.

## 8. Available Actions

### Run a dry run

| | |
|---|---|
| **Steps** | Choose a file → findings appear |
| **Data affected** | **None.** Nothing is uploaded or stored **[C]** |
| **Errors** | An unreadable or wrong-format file is reported as a finding **[I]** |

### Commit — **not available**

| | |
|---|---|
| **State** | Not built **[C]** |
| **Why** | There is nowhere to commit to (dms-parity-plan.md Phase 5) **[C]** |
| **Not a permissions problem** | The screen says so explicitly for that reason **[C]** |
| **What to do instead** | Send the validated file to whoever performs the load out-of-band **[I]** |

## 9. Use Cases

### "Does this extract match what the platform expects?"
Choose the file → read the findings. Empty means it matched.

### "The supplier's file keeps failing."
Send them the **Expected schema** card.

### "Can I load this into the platform?"
Not from here. Validate, then hand it over. §8.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Choose a file | Findings computed in the browser | Yes **[C]** |
| Choose a different file | Findings replaced | Yes **[C]** |
| Reload | Findings cleared **[I]** — nothing is persisted | Yes |

## 11. Navigation

**Reached from:** rail → Data → Import.
**Leads to:** [Batch history](/data/history) for what has been loaded; [Ingestion
health](/data/health).

## 12. Roles and Permissions

Not permission-gated **[C]**.

**[I]** If enforcement is added, import is an obvious admin-only action — but note that
today the *absence* of commit is a build state, not a permission.

## 13. Screen States

| State | When | What the user sees |
|---|---|---|
| **Initial** | No file chosen | The chooser and the schema |
| **Findings** | File parsed with problems | The findings table |
| **Clean** | File matched | No findings **[C]** |
| **Commit unavailable** | Always | The explanatory notice **[C]** |

## 14. Common Questions

**Q. Is my file uploaded anywhere?**
A. No. It is parsed in your browser and never leaves your machine. **[C]**

**Q. Why can't I commit?**
A. Commit is not built — there is nowhere to commit to. The screen says this explicitly
rather than showing a greyed-out button, because a greyed button would imply a permissions
problem. **[C]**

**Q. Is the validation real or a demo?**
A. Real. It parses the actual bytes of the file you chose. **[C]**

**Q. Why validate before loading rather than after?**
A. The consumer master arrived as 9,673 rows in one load. Finding a malformed date
afterwards would mean unpicking it **with no batch id to unpick by** — the gap documented
on [Batch history](/data/history). **[C]**

**Q. What file formats are accepted?**
A. **[U]** — not verified for this guide. The Expected schema card states what is
required.

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| No Commit button | Not built | Expected **[C]** |
| Findings on a file that "works elsewhere" | Different expected schema | Compare with the Expected schema card **[C]** |
| Findings vanished | Nothing is persisted | Re-select the file **[I]** |

## 16. AI Assistant Questions

- "Is my file uploaded when I use the Import screen?"
- "Why can't I commit an import?"
- "Is the dry run real or simulated?"
- "Why does the platform validate before loading?"
- "What schema does the consumer master need?"

## 17. Known Unknowns

| Unknown | Why | What would resolve it |
|---|---|---|
| Accepted file formats | Not verified | Read `import-schemas.js` |
| Where a commit will eventually write | No backend | The API specification |
| When commit will be built | dms-parity-plan.md Phase 5, undated | Roadmap |
