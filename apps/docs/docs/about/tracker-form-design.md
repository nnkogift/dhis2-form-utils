# Tracker form design

DHIS2 tracker programs involve two distinct form interactions a consuming application has to
coordinate: **registration** (Tracked Entity Attribute values plus enrollment system fields —
`enrolledAt`, `occurredAt`, `orgUnit` — to create a tracked entity and enroll it into a program),
and **data entry** (data element values per program stage event, handled by `useEventForm`).

`useTrackerForm` covers registration only. This is a deliberate scope decision, not a temporary
limitation — conflating registration and first-stage data entry into one hook would couple
fundamentally different payload shapes, rule-evaluation targets, and submission flows in ways
that reduce composability and make each half harder to test in isolation. A consuming app
composes `useTrackerForm` for registration and a separate `useEventForm` call for the first
stage's data entry.

## The domain model behind it

| Layer         | Owns                   | API location                   | Rule variable source |
| ------------- | ---------------------- | ------------------------------ | -------------------- |
| TrackedEntity | TEA attribute values   | `trackedEntities[].attributes` | `TEI_ATTRIBUTE`      |
| Enrollment    | Dates, orgUnit, status | `enrollments[]`                | —                    |
| Event         | Data element values    | `events[].dataValues`          | `DATAELEMENT_*`      |

All TEA values belong on the TrackedEntity, never the enrollment — the enrollment payload carries
only system fields. This is a hard requirement of the Tracker API (`POST /api/tracker`), and it's
why `useTrackerForm`'s form values are a flat object combining TEA fields (keyed by TEA uid) with
`orgUnit`/`enrolledAt`/optional `occurredAt`, which the caller splits apart at submission time —
see [Set up a tracker registration form](../how-to/tracker-registration-form.md).

## Why enrollment rule evaluation needs its own context builder

`buildRuleEngineContext` (used by `useEventForm`) maps `programRuleVariables` using `dataElement`
as the field identifier, and rule actions using `dataElement.id`. Enrollment evaluation is
different in every one of those respects:

- Variables are sourced from `TEI_ATTRIBUTE`, not `DATAELEMENT_*` — the field identifier must be
  the TEA uid.
- `programStage` on the rule variable must be `null` — TEA variables aren't stage-scoped.
- Rule actions target `trackedEntityAttribute.id`, not `dataElement.id`.
- `DATAELEMENT_*` variable source types have no meaning at enrollment time and must be filtered
  out.
- Evaluation calls `engine.evaluateEnrollment(...)`, not `engine.evaluateEvent(...)`.

Branching a single function on a `formType` parameter, or accepting a union metadata type, would
obscure intent on both sides and make each path harder to test alone. `buildEnrollmentRuleEngineContext`
is the dedicated function for the enrollment path; `buildRuleEngine` then returns a
`BuiltRuleEngine` that already knows which evaluation method to call, based on how its context
was built — the distinction is invisible past that point.

## Why `FormStore` needs no changes for tracker forms

`FormStore` subscribes to form value changes, debounces evaluation, and pushes results into
field/section/feedback stores — see
[Form state and the reactive loop](./form-state-and-reactive-loop.md). None of that logic cares
whether the underlying fields are data elements or TEA attributes; it operates on a flat
`Record<string, unknown>` regardless. The only thing that differs between an event form and a
tracker form is _which_ `RuleEngineJs` method gets called at evaluation time — and that's already
abstracted behind `BuiltRuleEngine`, opaque to `FormStore`. This is why `useTrackerForm` mirrors
`useEventForm`'s implementation almost line for line: same store, same hard constraints (no
`useEffect`, no `form.watch`, `effectHandlers` via ref only), different context builder.

## What's explicitly out of scope

- `useTrackerForm` does not fetch metadata — the caller owns the fetch, directly or via
  `useTrackerMetadataQuery`.
- It does not generate tracked entity or enrollment UIDs, or handle the linkage between them —
  caller responsibility at submission time.
- Updating an existing enrollment isn't handled by the initial design. Nothing forecloses it —
  `formOptions.defaultValues` can be pre-populated with existing attribute values — but the
  POST-vs-PATCH submission distinction for updates stays caller-owned.
