# `useTrackerForm` — Architecture Document

**Status:** Accepted  
**Date:** 2026-07-01  
**Package:** `@dhis2-form-utils/hooks`  
**Depends on:** `@dhis2-form-utils/rules`, `@dhis2-form-utils/metadata`, `@dhis2/rule-engine@3.8.1`, `@dhis2/api-types/v43`

---

## Context

DHIS2 tracker programs involve two distinct form interactions that a consuming application must coordinate:

1. **Registration** — collecting Tracked Entity Attribute (TEA) values and enrollment system fields (`enrolledAt`, `occurredAt`, `orgUnit`) to create a new tracked entity and enroll it into a program.
2. **Data entry** — collecting data element values per program stage event, handled separately by `useEventForm`.

`useTrackerForm` covers only registration. The consuming application is responsible for orchestrating the two hooks; this library does not attempt to manage both within a single abstraction.

This scope decision is deliberate. Conflating registration and first-stage data entry into one hook would couple fundamentally different payload shapes, rule evaluation targets, and submission flows in ways that reduce composability and make individual testing harder.

---

## What this document covers

- The `TrackerProgramMetadata` type and why it is shaped the way it is
- Why `buildEnrollmentRuleEngineContext` is a separate function from `buildRuleEngineContext`
- How `useTrackerForm` mirrors `useEventForm` exactly in structure
- The form values shape and how `occurredAt` is handled
- How the submission payload is assembled by the caller

---

## Domain model

The DHIS2 Tracker data model has three layers:

| Layer         | Owns                   | API location                   | Rule variable source |
| ------------- | ---------------------- | ------------------------------ | -------------------- |
| TrackedEntity | TEA attribute values   | `trackedEntities[].attributes` | `TEI_ATTRIBUTE`      |
| Enrollment    | Dates, orgUnit, status | `enrollments[]`                | —                    |
| Event         | Data element values    | `events[].dataValues`          | `DATAELEMENT_*`      |

**All TEA values belong on the TrackedEntity**, not the enrollment. The enrollment payload carries only system fields. This is a hard requirement of the Tracker API (`POST /api/tracker`) and is reflected in the form values shape and submission mapping.

---

## Types

### `TrackerProgramMetadata`

This is the pre-fetched metadata the caller passes to `useTrackerForm`. It mirrors the role of `ProgramStageMetadata` in `useEventForm` — a typed, minimal projection of what the API returns, shaped for what the hook actually needs. The caller owns the fetch; the hook owns nothing about data loading.

All types are derived from `@dhis2/api-types/v43`. No DHIS2 types are hand-written in this library.

```ts
import type { components } from '@dhis2/api-types/v43';

type Schemas = components['schemas'];

/**
 * The subset of ProgramRuleAction fields needed by buildEnrollmentRuleEngineContext.
 *
 * dataElement is deliberately excluded — enrollment rules target TEA attributes,
 * not data elements. Including it would create a false affordance.
 */
export type ExpandedProgramRuleAction = Pick<
    Schemas['ProgramRuleAction'],
    | 'id'
    | 'programRuleActionType' // HIDEFIELD | ASSIGN | HIDESECTION | SHOWWARNING | etc.
    | 'data' // expression string for ASSIGN actions
    | 'content' // display text for DISPLAYTEXT / SHOWWARNING
    | 'trackedEntityAttribute' // { id } — the TEA this action targets
    | 'programStageSection' // { id } — for HIDESECTION actions
    | 'location' // placement hint for DISPLAYTEXT
>;

/**
 * ProgramRule with its actions expanded inline.
 *
 * The default ProgramRule schema has programRuleActions: BaseIdentifiableObject[]
 * (just UIDs). buildEnrollmentRuleEngineContext needs the full action shape to
 * construct RuleActionJs instances. The caller must request expanded fields when
 * fetching: ?fields=programRules[id,condition,priority,name,programRuleActions[...]]
 */
export type ExpandedProgramRule = Pick<
    Schemas['ProgramRule'],
    'id' | 'condition' | 'priority' | 'name'
> & {
    programRuleActions: ExpandedProgramRuleAction[];
};

export type TrackerProgramMetadata = {
    id: string;
    displayName: string;

    /**
     * Required for building the TrackedEntity payload at submission time.
     * The hook does not use this value internally — it is passed through
     * in the return value for the caller's use.
     */
    trackedEntityType: { id: string };

    /**
     * Controls whether the occurredAt field is included in the form.
     * When false, occurredAt is omitted from the Zod schema entirely —
     * it is not present as an optional field, it simply does not exist.
     */
    displayIncidentDate: boolean;

    /** Used by buildTrackerSchema to constrain the enrolledAt date picker. */
    selectEnrollmentDatesInFuture: boolean;

    /** Used by buildTrackerSchema to constrain the occurredAt date picker. */
    selectIncidentDatesInFuture: boolean;

    /** UI label for the enrolledAt field. Falls back to a default if absent. */
    displayEnrollmentDateLabel?: string;

    /** UI label for the occurredAt field. Falls back to a default if absent. */
    displayIncidentDateLabel?: string;

    /**
     * The program-scoped TEA list. Each entry wraps a TrackedEntityAttribute
     * with program-specific settings (mandatory, sortOrder, renderType, etc.).
     *
     * The TEA's id is used as the form field key. This matches how the
     * Tracker API expects attributes: [{ attribute: teaId, value: "..." }].
     */
    programTrackedEntityAttributes: Array<
        Pick<
            Schemas['ProgramTrackedEntityAttributeParams'],
            | 'id'
            | 'mandatory'
            | 'allowFutureDate'
            | 'searchable'
            | 'displayInList'
            | 'sortOrder'
            | 'renderType'
            | 'renderOptionsAsRadio'
        > & {
            trackedEntityAttribute: Pick<
                Schemas['TrackedEntityAttributeParams'],
                | 'id'
                | 'displayName'
                | 'formName'
                | 'valueType'
                | 'optionSet'
                | 'unique'
                | 'generated'
                | 'fieldMask'
                | 'confidential'
                | 'orgunitScope'
            >;
        }
    >;

    /**
     * Program rules with actions expanded.
     * Only rules without a programStage filter apply at enrollment time.
     * buildEnrollmentRuleEngineContext handles this filtering internally.
     */
    programRules: ExpandedProgramRule[];

    /**
     * Only TEI_ATTRIBUTE and CALCULATED_VALUE source types are relevant for
     * enrollment rule evaluation. Others (DATAELEMENT_*) are silently ignored
     * by buildEnrollmentRuleEngineContext.
     */
    programRuleVariables: Array<
        Pick<
            Schemas['ProgramRuleVariable'],
            | 'id'
            | 'name'
            | 'programRuleVariableSourceType'
            | 'trackedEntityAttribute'
            | 'valueType'
            | 'useCodeForOptionSet'
        >
    >;

    /**
     * Optional. Present when the program defines sections for grouping attributes.
     * Used by section-aware UI consumers; ignored by the hook itself.
     */
    programSections?: Array<{
        id: string;
        displayName?: string;
        sortOrder?: number;
        trackedEntityAttributes: Array<{ id: string }>;
    }>;
};
```

---

## `buildEnrollmentRuleEngineContext`

### Why not reuse `buildRuleEngineContext`?

`buildRuleEngineContext` was designed for program stage event forms. It maps `programRuleVariables` using `dataElement` as the `field` identifier on `RuleVariableJs`, and maps `programRuleActions` using `dataElement.id` in the `values` Map passed to `RuleActionJs`.

Enrollment evaluation is fundamentally different:

- Variables are sourced from `TEI_ATTRIBUTE`, not `DATAELEMENT_*` — the `field` on `RuleVariableJs` must be the TEA uid, not a DE uid
- `programStage` on `RuleVariableJs` must be `null` — TEA variables are not stage-scoped
- Rule actions target `trackedEntityAttribute.id` in their `values` Map, not `dataElement.id`
- `DATAELEMENT_*` variable source types must be filtered out — they have no meaning at enrollment time
- The evaluation call is `engine.evaluateEnrollment(ruleEnrollment, [], context)`, not `engine.evaluateEvent(...)`

Sharing one function would require branching on a `formType` parameter or accepting a union metadata type — both of which obscure intent and make the function harder to test in isolation. A dedicated function is the correct boundary.

### Signature

```ts
// In @dhis2-form-utils/rules

export function buildEnrollmentRuleEngineContext(
    metadata: TrackerProgramMetadata
): RuleEngineContextJs;
```

### Implementation contract

```
1. Filter programRuleVariables to sourceType === 'TEI_ATTRIBUTE' | 'CALCULATED_VALUE'

2. For each TEI_ATTRIBUTE variable:
   - field = variable.trackedEntityAttribute.id
   - fieldType = mapDhis2ValueTypeToRuleValueType(variable.valueType)
   - programStage = null
   - useCodeForOptionSet = variable.useCodeForOptionSet ?? false
   - options = [] (resolved at evaluation time from form values)
   → new RuleVariableJs(RuleVariableType.TEI_ATTRIBUTE, name, useCodeForOptionSet, options, field, fieldType, null)

3. For each CALCULATED_VALUE variable:
   - field = '' (no backing field — value is derived from expression)
   - fieldType = mapDhis2ValueTypeToRuleValueType(variable.valueType)
   - programStage = null
   → new RuleVariableJs(RuleVariableType.CALCULATED_VALUE, name, false, [], field, fieldType, null)

4. Filter programRules to those without a programStage (enrollment-level rules only)

5. For each rule, map its actions to RuleActionJs:
   - type = action.programRuleActionType
   - data = action.data ?? null
   - values = new Map([
       ['field', action.trackedEntityAttribute?.id ?? ''],
       ['content', action.content ?? ''],
       ['location', action.location ?? ''],
       ['programStageSection', action.programStageSection?.id ?? ''],
     ])
   → new RuleActionJs(data, type, values, null)
   → new RuleJs(rule.condition, actions, rule.id, rule.name, null, rule.priority ?? null)

6. Return new RuleEngineContextJs(
     rules,
     ruleVariables,
     new RuleSupplementaryDataJs([], [], new Map()),
     new Map()
   )
```

`mapDhis2ValueTypeToRuleValueType` is a shared utility already used by `buildRuleEngineContext`. It maps DHIS2's `ValueType` (`TEXT | INTEGER | NUMBER | BOOLEAN | DATE | ...`) to the rule engine's `RuleValueType` (`TEXT | NUMERIC | BOOLEAN | DATE`). It lives in `@dhis2-form-utils/rules/utils` and is not exported from the package root.

---

## Form values shape

```ts
/**
 * The flat RHF form values for a tracker registration form.
 *
 * TEA fields are keyed by TEA uid — matching how the Tracker API expects them.
 * Enrollment system fields (orgUnit, enrolledAt) are always present.
 * occurredAt is present only when metadata.displayIncidentDate === true.
 */
type TrackerFormValues = {
    [teaUid: string]: string;
    orgUnit: string;
    enrolledAt: string; // ISO date string
    occurredAt?: string; // ISO date string — only when displayIncidentDate is true
};
```

The `occurredAt` field's conditional presence is handled in `buildTrackerSchema` (in `@dhis2-form-utils/metadata`), not in the hook. The hook receives the already-built schema and passes it to `zodResolver`. This keeps the hook's responsibility clear: wire the form, wire the store, return both.

```ts
// In @dhis2-form-utils/metadata

export function buildTrackerSchema(metadata: TrackerProgramMetadata): z.ZodObject<z.ZodRawShape> {
    const teaFields = Object.fromEntries(
        metadata.programTrackedEntityAttributes.map(({ trackedEntityAttribute, mandatory }) => [
            trackedEntityAttribute.id,
            buildTeaFieldSchema(trackedEntityAttribute, mandatory),
        ])
    );

    const base = {
        orgUnit: z.string().min(11).max(11),
        enrolledAt: z.string().date(),
        ...teaFields,
    };

    return metadata.displayIncidentDate
        ? z.object({ ...base, occurredAt: z.string().date() })
        : z.object(base);
}
```

---

## `useTrackerForm` — hook design

The hook mirrors `useEventForm` exactly in structure. The same `FormStore` class is reused — it is evaluation-target-agnostic; what changes is the context passed to it and, at evaluation time, which `RuleEngineJs` method `FormStore` calls internally.

```ts
// In @dhis2-form-utils/hooks

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import type { Resolver, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { TrackerProgramMetadata } from '@dhis2-form-utils/metadata';
import { buildTrackerSchema } from '@dhis2-form-utils/metadata';
import type { BuiltRuleEngine, EffectHandlersMap } from '@dhis2-form-utils/rules';
import { buildEnrollmentRuleEngineContext, buildRuleEngine } from '@dhis2-form-utils/rules';
import { FormStore } from './formStore';

export type DefaultFormValue = Record<string, string>;

export type UseTrackerFormOptions = {
    /**
     * The program UID. Used by the caller to identify which program this form
     * instance is for. Not consumed internally by the hook.
     */
    programId: string;
    metadata: TrackerProgramMetadata;
    effectHandlers?: EffectHandlersMap;
};

export type UseTrackerFormReturn<FormValue extends DefaultFormValue = DefaultFormValue> = {
    form: UseFormReturn<FormValue>;
    formStore: FormStore;
};

export function useTrackerForm<FormValue extends DefaultFormValue = DefaultFormValue>({
    options,
    formOptions,
}: {
    options: UseTrackerFormOptions;
    formOptions?: Omit<Parameters<typeof useForm<FormValue>>[0], 'resolver'>;
}): UseTrackerFormReturn<FormValue> {
    const metadata = useMemo(() => options.metadata, [options.metadata]);
    const schema = useMemo(() => buildTrackerSchema(metadata), [metadata]);

    const form = useForm<FormValue>({
        ...(formOptions ?? {}),
        resolver: zodResolver(schema) as unknown as Resolver<FormValue>,
    });

    const ruleEngineContext = useMemo(() => buildEnrollmentRuleEngineContext(metadata), [metadata]);
    const ruleEngine = useMemo(() => buildRuleEngine(ruleEngineContext), [ruleEngineContext]);
    const formStore = useMemo(() => new FormStore(), []);

    const effectHandlersRef = useRef(options.effectHandlers);
    const prevEngineRef = useRef<BuiltRuleEngine | null>(null);

    if (prevEngineRef.current !== ruleEngine) {
        if (prevEngineRef.current !== null) {
            formStore.reinit(
                form as UseFormReturn<Record<string, unknown>>,
                ruleEngine,
                effectHandlersRef
            );
        } else {
            formStore.init(
                form as UseFormReturn<Record<string, unknown>>,
                ruleEngine,
                effectHandlersRef
            );
        }
        prevEngineRef.current = ruleEngine;
    }

    return { form, formStore };
}
```

### Why `FormStore` is reused without modification

`FormStore` subscribes to form value changes, debounces evaluation, and pushes `FieldStateMap` and non-field effects into their respective stores. None of this logic is specific to whether the underlying RHF fields represent data elements or TEA attributes — it operates on the form's flat `Record<string, unknown>` values regardless. The only evaluation-specific behaviour is the `RuleEngineJs` method called at evaluation time. This is already abstracted behind `BuiltRuleEngine` — which wraps the correct method based on how it was built.

`buildRuleEngine` in `@dhis2-form-utils/rules` accepts a `RuleEngineContextJs` and returns a `BuiltRuleEngine` that knows whether to call `evaluateEvent` or `evaluateEnrollment`. When given a context built by `buildEnrollmentRuleEngineContext`, it returns a `BuiltRuleEngine` backed by `evaluateEnrollment`. `FormStore` calls `builtRuleEngine.evaluate(formValues)` — the dispatch is opaque to the store.

---

## Submission — caller responsibility

`useTrackerForm` does not submit. It returns `{ form, formStore }`. The caller assembles the Tracker API payload after calling `form.handleSubmit`.

```ts
// In the consuming application

const { form, formStore } = useTrackerForm({ options: { programId, metadata } });

const [mutate] = useDataMutation(CREATE_TRACKER_MUTATION);

const handleSubmit = form.handleSubmit((values) => {
    // Strip hidden fields — TEA fields hidden by rules must not be submitted
    const visibleValues = filterPayload(values, formStore.fieldStore.getSnapshot());

    // Separate TEA fields from enrollment system fields
    const teaUids = new Set(
        metadata.programTrackedEntityAttributes.map((p) => p.trackedEntityAttribute.id)
    );

    const attributes = Object.entries(visibleValues)
        .filter(([key]) => teaUids.has(key))
        .map(([attribute, value]) => ({ attribute, value }));

    mutate({
        trackedEntities: [
            {
                trackedEntityType: metadata.trackedEntityType.id,
                orgUnit: values.orgUnit,
                attributes,
            },
        ],
        enrollments: [
            {
                program: options.programId,
                orgUnit: values.orgUnit,
                enrolledAt: values.enrolledAt,
                ...(metadata.displayIncidentDate ? { occurredAt: values.occurredAt } : {}),
                status: 'ACTIVE',
            },
        ],
    });
});
```

`filterPayload` from `@dhis2-form-utils/rules` strips any field whose `FieldState.isHidden === true` from the submitted values. It is the same utility used by `useEventForm` consumers — shared, not duplicated.

The caller splits the flat form values into the TEA attributes array (for `trackedEntities`) and the system fields (for `enrollments`). The hook does not prescribe how this split happens — it is a straightforward Set membership check on the TEA uids from the metadata the caller already holds.

---

## Constraints and non-goals

**Hard constraints carried over from `useEventForm`:**

- No `useEffect` for subscriptions. `FormStore.init` / `FormStore.reinit` are called inside a render-time `if` block guarded by `prevEngineRef`. Wiring happens synchronously.
- No `form.watch`. Only `form.subscribe` is used — inside `FormStore`, never in the hook body.
- No `FieldStateMap` in React Context. Context carries the stable `{ formStore, form }` handle only. Consumers call `useFieldState(fieldId)` which reads from `formStore.fieldStore` via `useSyncExternalStore`.
- `effectHandlers` accessed via ref only. They are not kept current across renders — treated as stable at mount time.
- `shouldValidate: false` on all rule-driven `setValue` calls inside `FormStore`.
- No new runtime dependencies beyond `lodash-es`.

**Non-goals:**

- `useTrackerForm` does not handle the first program stage. First-stage data entry is a separate `useEventForm` call in the consuming application.
- `useTrackerForm` does not fetch metadata. The caller owns the fetch via `@dhis2/app-runtime`.
- `useTrackerForm` does not generate TEI UIDs, enrollment UIDs, or handle the `trackedEntity` / `enrollment` linkage. This is caller responsibility at submission time.
- Updating an existing enrollment is out of scope for this hook's initial implementation. The design does not foreclose it — `formOptions.defaultValues` can be populated with existing attribute values — but the submission path for updates (PATCH vs POST) is caller-owned.

---

## Affected packages and exports

| Package                      | Change                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `@dhis2-form-utils/rules`    | Add `buildEnrollmentRuleEngineContext(metadata: TrackerProgramMetadata): RuleEngineContextJs` to public exports       |
| `@dhis2-form-utils/metadata` | Add `buildTrackerSchema(metadata: TrackerProgramMetadata): z.ZodObject<...>` and export `TrackerProgramMetadata` type |
| `@dhis2-form-utils/hooks`    | Add `useTrackerForm`, `UseTrackerFormOptions`, `UseTrackerFormReturn` to public exports                               |

`TrackerProgramMetadata` and `ExpandedProgramRule` / `ExpandedProgramRuleAction` are exported from `@dhis2-form-utils/metadata` since that is where the type is consumed by `buildTrackerSchema`. They are re-exported from `@dhis2-form-utils/hooks` for consumer convenience.

---

## Implementation order

1. `ExpandedProgramRuleAction`, `ExpandedProgramRule`, `TrackerProgramMetadata` — types in `@dhis2-form-utils/metadata`
2. `buildTrackerSchema` — in `@dhis2-form-utils/metadata`
3. `buildEnrollmentRuleEngineContext` — in `@dhis2-form-utils/rules`
4. `useTrackerForm` — in `@dhis2-form-utils/hooks`
5. Unit tests for `buildEnrollmentRuleEngineContext` — TEI_ATTRIBUTE filtering, CALCULATED_VALUE handling, programStage-scoped rule exclusion
6. Unit tests for `buildTrackerSchema` — occurredAt conditional presence, mandatory field mapping, date constraints
7. Unit tests for `useTrackerForm` — mirrors `useEventForm` test structure
