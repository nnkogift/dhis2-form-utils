# Design handoff — Program Rules Playground

Audience: a coding agent implementing these designs in the `playground` app (DHIS2 App Platform, React, TypeScript, Tailwind v4 + `@dhis2/ui` + `@dhis2-form-utils/*`).

Reference design: **`Program Rules Playground App.dc.html`** (interactive; click a program row, switch rail items and panel tabs).
Explorations and the recreation of the current UI: `Program Rules Playground.dc.html` (options 1a–1e).

Chosen directions: **1b** program list, **1b** tracker rules page (enrollment rail), **1d** event rules page. Rule effects use **inline badges + ghost placeholders** (ghosts for hidden fields and hidden sections only).

---

## 1. Scope of change

| Area | Verdict |
| --- | --- |
| Program list | Redesign — new columns, segmented type filter, whole-row navigation |
| Tracker program page | **New capability** — registration *and* every program stage, via an enrollment rail |
| Event program page | Redesign — context bar + single stage form + unified panel |
| Rule rails | Merge `ProgramRulesPanel` + `RuleDevtoolsPanel` into one right panel with Rules / Trace / Graph tabs |
| Field rendering | Add rule-effect annotation (inline badge, ghost placeholder) |
| System fields | Move org unit + dates out of the form flow into a pinned context bar |

---

## 2. Files to touch

Existing (paths relative to `playground/src`):

- `pages/ProgramListPage.tsx` — restructure header + filters row; pass new columns.
- `components/programs/ProgramListTable.tsx` — new columns; row-level `onClick`; trailing chevron cell.
- `components/programs/ProgramListFilters.tsx` — replace `SingleSelectField` with a segmented control; search gets a leading `IconSearch16`.
- `pages/ProgramPlaceholderPage.tsx` — becomes the real program page: renders the context bar, then either the tracker shell or the event shell. Rename to `ProgramPage.tsx`.
- `components/programs/forms/ProgramRegistrationFormScreen.tsx` — no longer the whole tracker screen; becomes the *registration slot* inside the tracker shell.
- `components/programs/forms/FormSectionCard.tsx` — card gains a header row (title + right-aligned note) and supports a `hiddenBy` state.
- `components/programs/forms/TrackerSystemFields.tsx` / `EventSystemFields.tsx` — no longer render inside the form; feed the context bar instead.
- `hooks/usePrograms.ts` — extend the query (see §7).

New:

- `components/programs/ProgramContextBar.tsx`
- `components/programs/forms/TrackerProgramShell.tsx` — rail + slot router
- `components/programs/EnrollmentRail.tsx`
- `components/programs/forms/ProgramStageFormScreen.tsx` — per-stage event form
- `components/rules/RulePanel.tsx` — tabbed container
- `components/rules/RuleCatalogList.tsx`
- `components/rules/FieldEffectBadge.tsx`
- `components/rules/HiddenFieldPlaceholder.tsx`
- `components/rules/HiddenSectionPlaceholder.tsx`
- `components/rules/RuleFeedbackList.tsx` — replaces the current `FormFeedback` presentation

---

## 3. Routes

```
/                          program list
/programs/:programId                       → registration slot (tracker) or the single stage (event)
/programs/:programId/stages/:programStageId → a stage slot; ?event=<uid> selects one event of a repeatable stage
```

Keep the existing `listParams` location-state round trip so "Programs" returns to the same page, search and filter.

---

## 4. Program list

Layout: page max-width 1240px, padding `28px 32px 48px`, `gap: 20px`.

Header row: title `Programs` (24px / 500) with subtitle *"Pick a program to open its forms and watch its rules evaluate. Nothing is saved unless you ask for it."* on the left; search + segmented control right-aligned on the same baseline.

- Search: 300×36, `inset 0 0 0 1px var(--grey-500)`, radius 3, leading `IconSearch16` in `--grey-600`, placeholder *Search by name, code, or ID*. Keep the existing 300 ms debounce and URL sync. The separate "Clear search" button is dropped — the search field owns clearing.
- Type filter: segmented control (`All` / `Tracker` / `Event`), radius 5, selected segment `--teal-600` background with white text. Replaces the labelled single-select; keeps the same `type` URL param but **relabel `registration` → Tracker** in the UI copy only.

Table — columns and widths:

| Column | Width | Content |
| --- | --- | --- |
| Program | `1fr` | `displayName` (14px / 500) with the UID below in 11px mono, `--grey-600` |
| Type | 120px | Tag: Tracker → `--teal-100` on `--teal-900`; Event → `--blue-100` on `--blue-900` |
| Stages | 88px | `programStages.length`, right-aligned, tabular numerals |
| Rules | 128px | `programRules.length`, right-aligned, preceded by a 6px dot: `--teal-600` when > 0, `--grey-400` when 0; render `None` for 0 |
| Last updated | 140px | `lastUpdated`, `d MMM yyyy`, 13px `--grey-600` |
| — | 44px | `IconChevronRight16`, `--grey-600` |

Rows: `border-bottom: 1px solid var(--grey-300)`, cell padding `11px 12px` (7px 12px in compact density), `background: var(--grey-100)` on hover, **entire row** is the navigation target (today only the name cell is clickable). Footer: `N programs` on the left, rows-per-page + page indicator on the right. Empty state keeps the current copy.

---

## 5. Program page — shared chrome

### Context bar (pinned, both program types)

`background: #fff`, `border-bottom: 1px solid var(--grey-400)`, padding `10px 20px`, `display:flex; align-items:center; gap:20px`.

Left → right: back link (`IconArrowLeft16` + "Programs", `--teal-700`, 13px / 500) · 1px × 28px divider · program name (15px / 700) with `Tracker · <trackedEntityType> · N rules` beneath in 12px `--grey-600` · then right-aligned, each with an 11px uppercase `--grey-600` label above a 32px control: **Organisation unit** (196px select) · **Enrollment date** or **Event date** (130px) · **Incident date** (130px, only when `displayIncidentDate`) · **Reset playground** button (`IconSync16`).

Rationale: these are playground context, not captured data. Moving them out of the form removes them from the rule-evaluation surface and keeps the form to real attributes and data elements.

### Right panel (both program types)

Single `<aside>`, 404px, `--grey-100` background, left border `--grey-400`. Replaces both existing rails.

Header: teal status dot + "Rules" (15px / 700), right-aligned `N in scope · M firing`.
Tabs (`--blue-600` 3px underline when selected): **Rules** (the catalogue, was `ProgramRulesPanel`) · **Trace** (was the devtools Trace tab) · **Graph** (was the devtools Graph tab).

Rule card: white, radius 5, padding `11px 12px 11px 14px`, `flex-shrink: 0`, with a 3px full-height accent bar on the left edge:

| State | Accent | Status text |
| --- | --- | --- |
| Selected | `--blue-600` | (unchanged) |
| Firing, in scope | `--teal-600` | `Firing` in `--teal-700` |
| Idle, in scope | `--grey-400` | `Idle` in `--grey-600` |
| Out of scope | transparent | `Out of scope` in `--grey-500`, name in `--grey-600`, plus `Applies to <stage>` |

Card body: rule name (13px / 600), effect badges, then the condition in 11px mono `--grey-700` (hidden when `showConditions` is off). Clicking a card selects it and switches to Graph.

**Scope is a new concept:** a rule is *in scope* when the slot you are viewing is the slot it applies to (`programStage` on the rule, or registration for attribute-only rules). Reuse `filterEventProgramRules` from `@dhis2-form-utils/metadata` per stage; attribute-only rules belong to registration.

---

## 6. Tracker program page (1b)

### Enrollment rail

`<nav>` 268px, `--grey-100`, right border `--grey-300`, own scroll. Header: `Enrollment` in 11px / 700 uppercase, letter-spacing `.09em`, `--grey-600`.

One row per slot: **Registration** first (`IconUser16`, meta `N attributes`), then one row per program stage in `sortOrder` (`IconQueue16` when repeatable, `IconFileDocument16` otherwise; meta `N events`). Row: padding `10px 16px 10px 19px`, 3px left accent bar, and when selected `background: var(--teal-100)`, accent `--teal-600`, label `--teal-900`, icon `--teal-600`. A `N firing` chip in `--teal-100` / `--teal-900` appears when that slot has firing rules.

Footer: `Add event` button (`IconAdd16`) plus the note *"Repeatable stages accept more than one event, so you can test rules that compare across events."* For a repeatable stage, list its events as indented child rows under the stage and let `Add event` append one.

### Form column

`--grey-050` background. Sticky-ish header at `20px 28px 0`: slot title (20px / 700) + subtitle (13px `--grey-600`), and right-aligned the **hidden-fields toggle** — `Hidden fields shown` / `Hidden fields collapsed` (`IconViewOff16`), teal-tinted when on. Body scrolls, `padding: 16px 28px 28px`, `gap: 16px`.

Order inside the body: rule feedback → sections → action row.

Sections: white card, `border: 1px solid var(--grey-300)`, radius 3, `e050` shadow, `flex-shrink: 0`. Header `12px 16px` with the section title (15px / 600) and a right-aligned count note. Fields in a **two-column grid**, `gap: 16px 20px` — a one-column stack wastes the width freed by merging the rails. Unsectioned fields keep the existing behaviour: render in one implicit card.

Action row: left, *"Nothing is written to the server until you save."*; right, `Re-run rules` (secondary) + primary `Register tracked entity` / `Save event`.

Data: registration = `programTrackedEntityAttributes` sorted by `sortOrder`, grouped by `programSections`; stage = `programStageDataElements` grouped by `programStageSections`. Both already resolve through `resolveFormSectionLayout`.

---

## 7. Event program page (1d)

Identical to §6 minus the rail — the form column starts immediately after the context bar. The single stage's name is the page title; the context bar's date is **Event date** and there is no incident date. Panel behaves the same; every rule is in scope.

### Metadata the list needs

`hooks/usePrograms.ts` must add to `fields`:

```
lastUpdated,
programStages~size,
programRules~size
```

Falling back to `programStages[id]` / `programRules[id]` and taking `.length` is acceptable if `~size` is unavailable on the target version. `programType` already distinguishes `WITH_REGISTRATION` from `WITHOUT_REGISTRATION`.

---

## 8. Rule-effect visualisation — the rules

This is the part to get exactly right.

### 8.1 Inline badge — for effects that change how a field behaves

Rendered immediately after the field label, inside the label row. `display:inline-flex; gap:4px; radius:4px; padding:2px 6px; font-size:11px; font-weight:600`, with the effect's 16px icon. The `title` attribute reads `<ACTIONTYPE> from rule: <rule name>`.

Colour and icon per variant — **lift these verbatim from `utils/devtools/src/effectStyles.ts`**, do not re-pick them:

| Variant | Action types | Background | Text | Icon |
| --- | --- | --- | --- | --- |
| hide | `HIDEFIELD` `HIDEOPTION` `HIDEOPTIONGROUP` `HIDESECTION` `HIDEPROGRAMSTAGE` | `--grey-200` `#f3f5f7` | `--grey-900` `#212934` | `IconViewOff16` |
| show | `SHOWFIELD` `SHOWOPTION` `SHOWOPTIONGROUP` | `#e8f5e9` | `#103713` | `IconView16` |
| assign | `ASSIGN` | `#e3f2fd` | `#093371` | `IconEdit16` |
| mandatory | `SETMANDATORYFIELD` `UNSETMANDATORYFIELD` | `#ffecb3` | `#6f3205` | `IconStarFilled16` |
| warning | `SHOWWARNING` `WARNINGONCOMPLETE` | `#ffecb3` | `#6f3205` | `IconWarningFilled16` |
| error | `SHOWERROR` `ERRORONCOMPLETE` | `#ffe5e8` | `#330202` | `IconErrorFilled16` |
| feedback | `DISPLAYTEXT` `DISPLAYKEYVALUEPAIR` | `#e1bee7` | `#4a148c` | `IconMessages16` |

Badge copy: `Required by rule` (mandatory), `Assigned` (assign), `Warning` (warning), `Error` (error), `Hidden` (hide).

Field ring and help text follow the badge:

- mandatory / warning → ring `#ffa902`, help text in `#6f3205`
- error → ring `--red-500`, help text in `--red-700`
- assign → ring `--blue-300`, field read-only, help *"Read-only while a rule assigns it."*

### 8.2 Ghost placeholder — for hidden fields and hidden sections **only**

A hidden field keeps its grid slot; a hidden section keeps its card. Both render a placeholder instead of the control:

```
height: 36px (field) / padding: 12px 14px (section)
background: repeating-linear-gradient(135deg, #f8f9fa 0 6px, #f3f5f7 6px 12px)
border: 1px dashed var(--grey-400); border-radius: 3px
font-size: 12px; color: var(--grey-600)
```

Field placeholder text: `Hidden by <rule name>`. The label above it drops to `--grey-600` and still carries the `hide` badge.
Section placeholder: `IconViewOff16` + `Section hidden by <rule name>` (rule name in 600 weight); the section header stays visible.

Governed by the header toggle. **Off** = today's behaviour (`D2Field` returns `null`, `FormSection` returns `null`) with only the badge on the label as a trace. **On** is the default, because seeing *that* a field disappeared and *why* is the whole point of the playground.

Implementation: `useFieldControl().isHidden` and `useSectionState(id).hidden` already carry the state; they need the **rule that caused it**. Extend the field/section state with the originating `ruleId` (the trace store already knows it — see `getActiveRuleIds` / `TraceEffect.targetId`) and resolve the display name through `createLabelLookup`.

### 8.3 Rule feedback — `DISPLAYTEXT` / `DISPLAYKEYVALUEPAIR`

Rendered as a block at the **top of the form body**, above the sections — not as a `NoticeBox` and not in the panel:

```
background: #f7f2fa; box-shadow: inset 0 0 0 1px #e1bee7; border-radius: 3px
padding: 10px 14px; IconMessages16 in #4a148c
```

Line 1: `<content>: ` in 600 weight followed by the value. Line 2: `Display text · <rule name>` or `Display key-value pair · <rule name>` in 12px `--grey-600` — the attribution is what makes it teachable.

Keep the existing split between `location: 'feedback'` and `location: 'indicators'`; render indicators as a second group under a `Program indicators` label.

---

## 9. Visual tokens used

All values come from the bound DHIS2 UI design system (`_ds/.../tokens/colors.css`) and match `@dhis2/ui`:

- Header bar `#165c92`, 40px, Roboto 13px / 500, white with `drop-shadow(0 0 2px rgba(0,0,0,.5))`
- Surfaces white; page `--grey-050`; rails `--grey-100`; table header `--grey-200`
- Borders `--grey-300` (hairlines) / `--grey-400` (structural); input rings `inset 0 0 0 1px var(--grey-500)`
- Primary action `--blue-600`; selection `--teal-600` / `--teal-100`; radii 3px controls, 4px buttons, 5px segmented + rule cards
- Type: Roboto throughout; 14px body, 13px dense, 11–12px meta, 15px section titles, 20px slot titles, 24px page title
- No animation, no gradients other than the ghost hatch, no colored shadows

---

## 10. Layout invariants (learned the hard way)

- Any card or `<section>` inside a `flex-direction: column` scroll container needs `flex-shrink: 0`, or it is compressed below its content height and clipped.
- Panel and rail own their scrolling (`min-height: 0; overflow: auto`); the page itself does not scroll.
- Inputs use `inset` rings, never borders, so state changes do not shift layout.

---

## 11. Acceptance criteria

1. A tracker program shows Registration plus every program stage, and a stage's rules fire when you edit that stage's data elements.
2. A repeatable stage can hold more than one event, and each event has its own form state.
3. An event program shows only its single stage form — no rail.
4. Org unit and dates appear only in the context bar; they are absent from the form body.
5. With the toggle on, every field or section hidden by a rule leaves a ghost placeholder naming the rule.
6. Every field a rule made mandatory, assigned, warned or errored carries the matching inline badge, and its tooltip names the rule.
7. `DISPLAYTEXT` / `DISPLAYKEYVALUEPAIR` render at the top of the form body with the rule name attributed.
8. The rules panel marks each rule Firing / Idle / Out of scope for the slot in view.
9. The program list shows stage count, rule count and last-updated, and the whole row navigates.
10. Nothing is written to the server until the user presses the primary action.

---

## 12. Open questions

- Sample content in the prototype (Child Programme attributes, Malaria data elements, the eight rules) is illustrative. Real metadata replaces it; only the *structure* is normative.
- Repeatable-stage event rows in the rail are specified but not drawn in the prototype — confirm whether events should be listed inline under the stage or selected from a dropdown in the form header.
- The Graph tab is shown as a simplified dependency list. If the existing `RuleGraphView` is kept as-is, only its container chrome changes.
