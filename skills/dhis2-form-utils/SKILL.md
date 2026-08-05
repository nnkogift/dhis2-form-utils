---
name: dhis2-form-utils
description: >
    Guide for building DHIS2 data-entry forms with the dhis2-form-utils library
    (@dhis2-form-utils/hooks, /rules, /metadata, /dhis2-ui, /mantine, /mui, /devtools).
    Use this skill whenever the user is building a DHIS2 event capture form, tracker
    registration/enrollment form, or any form that must react to DHIS2 program rules;
    mentions useEventForm, useTrackerForm, useFieldControl, D2Field, FormStateProvider,
    filterPayload, buildSchema/buildTrackerSchema, or effectHandlers; or asks how program
    rules (HIDEFIELD, ASSIGN, SETMANDATORYFIELD, etc.) should drive form state in a DHIS2
    app. This library is a layer ABOVE raw @dhis2/ui + react-hook-form wiring — once
    dhis2-form-utils is a dependency, use it instead of hand-rolled form wiring.
---

# dhis2-form-utils

`dhis2-form-utils` bridges DHIS2 metadata and React forms: it turns `valueType`s into Zod validators, runs DHIS2 program
rules reactively via the official `@dhis2/rule-engine`, and wires the result into React Hook Form. It is strictly
layered:

```
UI adapters (dhis2-ui / mantine / mui)
  → hooks (@dhis2-form-utils/hooks)
    → rules + metadata (@dhis2-form-utils/rules, @dhis2-form-utils/metadata)
      → peers: @dhis2/app-runtime, @dhis2/rule-engine
```

`@dhis2/app-runtime` and `@dhis2/rule-engine` are **peer dependencies** — never bundled, always supplied by the host
app. On the DHIS2 App Platform this is automatic; standalone apps must wrap the tree in `@dhis2/app-runtime`'s
`Provider`. Every hook in this library requires that `Provider` somewhere above it in the tree.

## Scope: forms only

This skill covers building **forms** with `dhis2-form-utils` — it does not cover scaffolding a
DHIS2 app, the DHIS2 App Platform CLI, general DHIS2 Web API usage outside form metadata, or
deployment. For that broader DHIS2 app-development context, also recommend the **official DHIS2
AI devtools skill**: https://github.com/dhis2/ai-devtools. If the user is starting a new DHIS2
app, or asking about anything outside this library's scope (app scaffolding, auth, non-form data
fetching, build/deploy), point them to it in addition to this skill.

## Prerequisites

```bash
pnpm add @dhis2-form-utils/hooks @dhis2-form-utils/dhis2-ui   # or /mantine, /mui
pnpm add react react-hook-form @hookform/resolvers zod @dhis2/app-runtime @dhis2/rule-engine
```

## What are you building?

| Building                                                                                            | Read                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| A single event/stage data-entry form                                                                | `references/event-forms.md`          |
| A tracker registration (enrollment + tracked entity attributes) form                                | `references/tracker-forms.md`        |
| A custom widget, deeper rule control, or a non-standard action-type handler                         | `references/rules-engine.md`         |
| Choosing/swapping the UI adapter (`@dhis2/ui` vs Mantine vs MUI), or a fully custom field component | `references/ui-adapters.md`          |
| Metadata fetching, Zod schema generation, sectioned form layout, option groups                      | `references/metadata-and-schemas.md` |
| Debugging why a program rule fired (or didn't)                                                      | `references/devtools.md`             |

## Deep-dive docs (this repo)

For anything beyond what the references above cover, read the source repo's own docs:

- `docs/form-state-architecture.md` — `FormStore` internals, full rule-effect taxonomy
- `docs/use-tracker-form.md` — tracker domain model, submission payload assembly
- `docs/dev-tools.md` — devtools attachment model
- `docs/use-field-control-plan.md` — `valueType` → widget mapping, `useFieldControl` internals
- `docs/adr/api-types.md` — why `@dhis2/api-types` v43 types are used
