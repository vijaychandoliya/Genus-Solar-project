---
route: /admin/appearance
page: src/pages/appearance.jsx
title: Appearance
status: reviewed
updated: 2026-08-24
aliases: [looks, themes, theme picker, styling, branding, dark mode, colours]
dataModules: [src/lib/token-resolve.js, src/lib/looks/index.js]
relatedScreens: [/admin/design-tokens, /gallery]
---

# Appearance

> Choose how Genus Solar looks. Six complete appearances, every one **checked for
> readability before it shipped**, applied to the whole product in one click and
> reversible in one more.

**Evidence marks:** **[C]** confirmed from code or source data · **[I]** inferred, evidence
named · **[U]** unknown — never guessed.

---

## 1. Overview

**Why this screen exists.** The product already had a token editor at
[`/admin/design-tokens`](/admin/design-tokens) that can change any of 29 colour roles and
292 component slots. That is the right tool for a designer and the wrong one for everybody
else: it assumes you know which colours must contrast with which. This screen is the
other half — **a short list of complete, safe choices.**

**The rule the screen is written to. [C]** From
[`src/pages/appearance.jsx`](../../src/pages/appearance.jsx): the word *token* never
appears, and neither does *contrast*, *semantic*, *alias*, *tier* or a hex value. A colour
scheme is called an **accent colour**, because that is what it does.

**What makes a Look trustworthy.** Every Look is scored by the build against 145 rendered
foreground/background pairs across 9 accent colours and both light and dark. A Look that
introduces a single readability problem **cannot be built** **[C]**. Two of the six
actively *fix* problems the standard appearance has — Contrast Dark retires 25, Slate
retires 8 **[C]**.

**When you would come here.** Setting the product up for a team. Making it readable
outdoors. Making it calmer. Switching to a dark control-room appearance. Undoing any of
those.

## 2. Who Uses This Screen

| Role | Why they come here |
|---|---|
| **Admin / Super Admin** | Set the product's appearance for their team |
| **User (store operator)** | Pick something readable for their working conditions |
| **Service Engineer** | Field-readable appearance for outdoor use |

> **Roles are designed, not enforced. [C]** See [README](README.md#3--roles-are-designed-but-not-enforced).
> Despite living under `/admin/`, this screen has no route guard.

## 3. How to Access It

| | |
|---|---|
| **Route** | `/admin/appearance` **[C]** |
| **Navigation** | Rail → Administration → Appearance, directly above *Design tokens* **[C]** |
| **Deep link** | `/admin/appearance` |

## 4. Screen Layout

```
Title       Appearance
Subtitle    …every option here has been checked for readability…
Action      [Back to <previous>]   — appears only after you switch
─────────────────────────────────────────────────────────────────
Panel       Looks — "Now showing <name>. Your accent colour and
            light/dark setting stay as they are."
              a grid of 6 cards, 1–3 per row by screen width
              each: miniature preview · name · one line · "Readable"
─────────────────────────────────────────────────────────────────
Link        Need to change one specific colour or size? Fine-tune the design →
Dialog      (conditional) "N of your earlier changes will keep overriding this Look"
```

## 5. Component-by-Component Guide

### Look card

| | |
|---|---|
| **Location** | The grid |
| **Purpose** | Show what a Look actually looks like, on this product |
| **What the user sees** | A miniature of a real Genus screen — a header strip, three KPI tiles, three table rows — then the name, one plain sentence, and a **Readable** badge |
| **What the data represents** | The Look's own resolved values, not the current theme |
| **Data source** | `resolveTokens(source, lookPatch(id))` — the **same function the build uses** **[C]** |
| **Why a miniature and not swatches** | A swatch row is a token-literate way to preview, and the reader of this screen is the one person who cannot read it **[C]** |
| **User interaction** | Clicking selects the Look and applies it product-wide immediately |
| **States** | Normal · **In use** (2px accent border + the words) · hover · keyboard focus ring **[C]** |
| **Accessibility** | A real `<button>` with `aria-pressed` **[C]** |

### "Readable" badge

| | |
|---|---|
| **Purpose** | Say that the appearance has been checked, without saying *contrast* |
| **What it means** | The Look introduces **no** readability problem, verified by the build against 145 pairs × 9 accents × 2 modes **[C]** |
| **Extra text** | Some cards add `· fixes N problems` — that Look repairs shortfalls the standard appearance has **[C]** |
| **Why on every card** | Deliberate. A badge on every card reads as furniture; a badge on some would read as a warning about the others **[C]** |

### The six Looks

| Look | Character | vs Standard |
|---|---|---|
| **Standard** | Today's appearance. Permanent, never removable | baseline |
| **Field** | High contrast, larger type, flat, sharp — outdoor and glare | no change |
| **Calm** | Low chroma, soft corners, subtle depth, relaxed spacing | no change |
| **Compact** | Standard colour, condensed rows and tighter spacing | no change |
| **Contrast Dark** | Dark-first, high contrast — control rooms and night use | **fixes 25** |
| **Slate** | Near-monochrome, accent only at highlights | **fixes 8** |

**[C]** from the audit block in each `src/tokens/looks/*.look.json`.

### "Back to <previous>" button

| | |
|---|---|
| **Location** | Top right, **only after you have switched** |
| **Purpose** | One-click undo |
| **Notes** | It names the Look it returns to, so the button says what it does **[C]** |

### Panel note

Reads *"Now showing <name>. Your accent colour and light/dark setting stay as they are."*
— stated because the commonest fear is that picking a Look will undo other settings.
It will not: those are separate controls **[C]**.

### Conflict dialog

| | |
|---|---|
| **When** | Only if you previously changed something in the token editor that this Look also sets **[C]** |
| **Title** | *"N of your earlier changes will keep overriding this Look"* |
| **Body** | The affected items in plain language — *Page background*, *Card background*, *Corner roundness* — never token names **[C]** |
| **Choices** | **Cancel** · **Keep my changes** · **Use the Look's** |
| **Why it exists** | Your edits sit on top of a Look and keep winning. Without the dialog, a Look would silently look broken and you would not know why **[C]** |

## 6. Data Sources and Data Flow

**This screen has no external data. [C]** No network, no extract, no database.

```
scripts/figma-tokens.json          the reviewed token source of truth
   └─> src/tokens/looks/*.look.json    six Looks, each a sparse override patch
        └─> lookPatch(id)
             └─> resolveTokens(source, merge(lookPatch, yourOverrides))
                  └─> getTheme()  →  the whole product repaints
                       └─> localStorage["genus-tokens"] = { look, overrides }
```

| Displayed value | Source | Mark |
|---|---|---|
| Look names, blurbs, character | the `.look.json` files | **[C]** |
| Miniature colours | `resolveTokens()` for that Look, current accent and mode | **[C]** |
| "fixes N problems" | the `audit` block in the Look file | **[C]** |
| Your current Look | `localStorage["genus-tokens"]` | **[C]** |
| API / service / database | none — nothing leaves the browser | **[U] / not applicable** |

**Persistence.** `localStorage`, per browser. **Your choice does not follow you to another
device, and does not apply to anyone else. [C]**

**Update frequency.** Instant, in-browser. No request, no reload.

## 7. Charts, Metrics, and Dashboards

Not applicable — this screen has no charts. The card miniatures are illustrations of a
real screen, not data visualisations.

## 8. Available Actions

### Apply a Look

| | |
|---|---|
| **Location** | Any card |
| **Who can perform it** | Anyone who can open the screen **[C]** |
| **Preconditions** | None |
| **Steps** | Click a card. If you have conflicting earlier edits, the dialog appears first |
| **Expected result** | The entire product repaints immediately. The card shows **In use** and *Back to <previous>* appears |
| **Data affected** | Appearance only. **No business data is touched** **[C]** |
| **Errors** | If `localStorage` is unavailable (private browsing, quota), the Look applies for this session but does not survive a reload **[C]** |

### Undo

| | |
|---|---|
| **Steps** | *Back to <previous>* |
| **Expected result** | Returns to the previous Look |
| **Notes** | Standard is permanent, so there is always a way back **[C]** |

### Resolve a conflict

| | |
|---|---|
| **Preconditions** | Earlier token-editor edits that overlap the Look |
| **Choices** | **Keep my changes** — Look applies, your edits still win on those items · **Use the Look's** — your edits on those items are dropped · **Cancel** — nothing happens |
| **Data affected** | *Use the Look's* discards those specific overrides **[C]** |

### Fine-tune the design

| | |
|---|---|
| **Location** | Link below the panel |
| **Result** | Opens [Design tokens](/admin/design-tokens) — the expert tool |
| **Caution** | Edits there sit **on top of** your Look and will keep winning **[C]** |

## 9. Use Cases

### "Our engineers can't read the screen outdoors."
Pick **Field** — high contrast, larger type.

### "This is too bright for the control room at night."
Pick **Contrast Dark**. It also fixes 25 readability problems Standard has.

### "We need more rows on screen."
Pick **Compact** — condensed rows and tighter spacing, colour unchanged.

### "I tried one and want to go back."
*Back to <previous>*, or pick **Standard**.

### "I changed a colour last week and the new Look looks wrong."
Your edit is overriding it. Re-pick the Look and choose **Use the Look's**.

## 10. Triggers and System Behavior

| Trigger | What changes | Immediate? |
|---|---|---|
| Click a card | Whole product repaints; card marked *In use* | Yes **[C]** |
| Click with conflicting edits | Dialog first, nothing applied until you choose | Yes **[C]** |
| *Back to <previous>* | Reverts | Yes **[C]** |
| Change accent or light/dark elsewhere | Card miniatures re-render in the new context | Yes **[C]** |
| Reload | Your Look is restored from `localStorage` | Yes **[C]** |
| Open on another device | **Standard** — the choice is per browser | **[C]** |
| Backend event / scheduled job | Nothing — none exist | **[U]** |

## 11. Navigation

**Reached from:** rail → Administration → Appearance.
**Leads to:** [Design tokens](/admin/design-tokens) via the fine-tune link.
**Breadcrumbs:** `Genus Solar › Administration` **[C]**.
**Back:** browser back leaves the screen; **it does not undo an applied Look** — use
*Back to <previous>* **[C]**.

## 12. Roles and Permissions

**Not permission-gated. [C]** Despite the `/admin/` route, there is no guard.

**[I]** This is a strong candidate for restriction if enforcement is added — an appearance
is a per-user preference, but an org-wide default would be an admin decision. That
question is open; see §17.

## 13. Screen States

| State | When | What the user sees | What to do |
|---|---|---|---|
| **Populated** | Always | Six cards | — |
| **In use** | One card matches your Look | 2px accent border, "In use" | — |
| **Conflict** | Overlapping earlier edits | The dialog | Choose |
| **Loading** | Not applicable | Nothing is fetched **[C]** | — |
| **Empty** | Cannot occur | Six Looks are compiled in **[C]** | — |
| **Error** | Cannot occur | No request can fail **[C]** | — |
| **Storage unavailable** | Private browsing, quota | Look applies, does not survive reload **[C]** | Use a normal window |

## 14. Common Questions

**Q. Will picking a Look change my data?**
A. No. Appearance only. **[C]**

**Q. Does my choice affect other users?**
A. No. It is stored in your browser only. Another person, or another device, sees
Standard. **[C]**

**Q. What does "Readable" mean?**
A. The build checked this Look against 145 rendered colour pairings across 9 accent
colours and both light and dark, and it introduces no readability problem. A Look that did
could not have been built. **[C]**

**Q. What does "fixes 25 problems" mean?**
A. That Look repairs 25 readability shortfalls the standard appearance has. **[C]**

**Q. I picked a Look but part of the screen looks wrong.**
A. You have an earlier token-editor edit overriding it. Re-pick the Look and choose *Use
the Look's*. **[C]**

**Q. Will a Look change my accent colour or dark mode?**
A. No — separate settings, stated in the panel note. **[C]**

**Q. Can I make my own Look?**
A. Not from this screen. Looks are authored as files. **[C]** Whether user-authored Looks
will be offered is **[U]**.

**Q. Which Look is best for outdoors?**
A. **Field** — high contrast, larger type, built for glare. **[C]**

**Q. How do I get back to normal?**
A. Pick **Standard**. It is permanent and never removable. **[C]**

## 15. Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Look reverts after reload | `localStorage` unavailable | Leave private browsing / free space **[C]** |
| Part of the UI ignores the Look | An earlier token-editor override | Re-pick → *Use the Look's* **[C]** |
| Colleague sees a different appearance | Per-browser preference | Ask them to pick the same Look **[C]** |
| Dialog appears unexpectedly | You made token edits earlier | Read the list; it names them plainly **[C]** |
| Card miniatures all look alike | Some Looks differ in spacing and shape, not colour | Compare Compact and Field for density and corners **[C]** |
| Cannot find how to make a Look | Not offered in the UI | Authored as files **[C]** |

## 16. AI Assistant Questions

- "What is a Look in Genus Solar?"
- "What does the Readable badge mean on the Appearance screen?"
- "Which Look should I use outdoors?"
- "Will changing the Look affect my data or other users?"
- "Why does part of the screen ignore the Look I picked?"
- "What is the difference between a Look and an accent colour?"
- "How do I undo a Look?"
- "What does 'fixes 25 problems' mean?"
- "Can I create my own Look?"
- "Where is the Appearance screen and who can use it?"
- "What is the difference between Appearance and Design tokens?"

## 17. Known Unknowns / Information Not Available

| Unknown | Why | What would resolve it |
|---|---|---|
| Whether a Look should be per-user or per-tenant | Open product decision, recorded in `docs/looks-workplan.md` | Product decision |
| Whether this becomes tenant-facing branding | `token-engine-architecture.md` §5.1, still open | Product decision |
| Whether user-authored Looks will ship | Deferred | Roadmap |
| Whether an org-wide default will exist | Not designed | Product decision |
| Whether Appearance will be permission-gated | No enforcement exists at all | The RBAC enforcement decision |
