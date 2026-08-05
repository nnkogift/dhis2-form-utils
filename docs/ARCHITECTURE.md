# dhis2-form-utils — Architecture

## Overview

`dhis2-form-utils` is an open-source library designed to make building forms against DHIS2 metadata
straightforward, composable, and design-system-agnostic. It acts as a foundation for higher-level
DHIS2 applications — from custom tracker data entry screens to public-facing data portals.

The library is organised as a monorepo with three distinct layers: core utilities, headless React
hooks, and UI adapter packages for common design systems. Each layer depends only on the layers
below it, keeping concerns cleanly separated and individual packages independently publishable.

Data fetching and API communication are delegated entirely to `@dhis2/app-runtime`, the official
DHIS2 application runtime. Program rule evaluation is built on top of `@dhis2/rule-engine`, the
official DHIS2 rule engine library, rather than reimplementing it from scratch.

## Architecture Diagram

![Architecture Diagram](/docs/dhis2_form_lib_architecture.svg)

---

## Repository Structure

```
dhis2-form-utils/
├── apps/
│   ├── playground/              # Vite + React dev sandbox
│   └── storybook/               # Storybook — component docs + browser tests
├── utils/
│   ├── rules/                   # @dhis2-form-utils/rules
│   └── hooks/                   # @dhis2-form-utils/hooks
├── packages/
│   ├── metadata/                # @dhis2-form-utils/metadata
│   └── config/                  # Shared tsconfig + ESLint config
├── components/
│   ├── dhis2-ui/                # @dhis2-form-utils/dhis2-ui
│   ├── mantine/                 # @dhis2-form-utils/mantine
│   └── mui/                     # @dhis2-form-utils/mui
├── pnpm-workspace.yaml
└── eslint.config.js
```

All internal packages reference each other via the workspace protocol
(`"@dhis2-form-utils/hooks": "workspace:*"`). `@dhis2/app-runtime` and `@dhis2/rule-engine` are
peer dependencies of the hooks and rules packages respectively — they are never bundled.

---

## Dependency Direction

```
apps/playground
      │
      ▼
@dhis2-form-utils/dhis2-ui
@dhis2-form-utils/mantine
@dhis2-form-utils/mui
      │
      ▼
@dhis2-form-utils/hooks
      │
      ├──▶ @dhis2-form-utils/rules
      │         └──▶ @dhis2/rule-engine   (peer — provided by the host application)
      ├──▶ @dhis2-form-utils/metadata
      └──▶ @dhis2/app-runtime             (peer — provided by the host application)
```

---

## Layer 3 — Core Utilities

### `@dhis2-form-utils/rules`

#### What `@dhis2/rule-engine` already provides

The official DHIS2 rule engine (`@dhis2/rule-engine`) is a Kotlin Multiplatform library compiled
to JavaScript, published to npm. It implements the full DHIS2 program rule model as it exists in
the backend and in the Android app — the same engine that powers Tracker Capture and Event Capture.
Its API follows a two-step initialization pattern:

1. **`RuleEngineContext`** — built once per program stage. Accepts the list of `ProgramRule`
   objects, their associated `ProgramRuleVariable` objects, and supplementary data (option sets,
   constants). The context is immutable and can be shared safely.

2. **`RuleEngine`** — built from the context, then given the contextual data for a specific
   session (an enrollment, previous events). Evaluation is invoked per target event or enrollment,
   returning a list of `RuleEffect` objects.

The `RuleEffect` model maps directly to DHIS2's `programRuleActionType`. The action types the
engine natively evaluates include:

| Action type           | Effect                                                        |
| --------------------- | ------------------------------------------------------------- |
| `HIDEFIELD`           | Field must not be rendered                                    |
| `HIDESECTION`         | Section must not be rendered                                  |
| `HIDEPROGRAMSTAGE`    | Stage must not be rendered                                    |
| `SHOWWARNING`         | Non-blocking warning message on a field                       |
| `SHOWERROR`           | Blocking error message on a field                             |
| `WARNINGONCOMPLETE`   | Warning surfaced only at completion                           |
| `ERRORONCOMPLETE`     | Blocking error surfaced only at completion                    |
| `ASSIGN`              | A value must be set programmatically on a field               |
| `DISPLAYTEXT`         | Text must be shown in a feedback widget                       |
| `DISPLAYKEYVALUEPAIR` | A key/value pair must be shown in a feedback widget           |
| `HIDEOPTION`          | A specific option in an option set must be hidden             |
| `HIDEOPTIONGROUP`     | All options in an option group must be hidden                 |
| `SHOWOPTION`          | A previously hidden option must be shown                      |
| `SHOWOPTIONGROUP`     | A previously hidden option group must be shown                |
| `SETMANDATORYFIELD`   | Field must be treated as required                             |
| `SENDMESSAGE`         | A program notification should be triggered                    |
| `SCHEDULEMESSAGE`     | A program notification should be scheduled at a computed date |

The engine handles expression parsing, variable resolution across the enrollment context, and
priority ordering of rules. It is the same runtime used across the DHIS2 platform on web and
Android — using it directly means `dhis2-form-utils` stays in sync with any updates to rule
behaviour or new action types without needing to track those changes independently.

#### What `@dhis2-form-utils/rules` adds

`@dhis2/rule-engine` solves expression evaluation correctly, but it does not address how evaluation
output is integrated into a React form lifecycle. `@dhis2-form-utils/rules` wraps the engine and
adds what is missing for a form-library context:

**Typed `RuleEffect` consumption** — the raw `RuleEffect` objects from the engine are translated
into a strongly-typed `FieldStateMap`, keyed by data element or tracked entity attribute UID. Each
entry aggregates all effects for that field into a single object the UI can consume directly:

```ts
// packages/rules/src/types.ts
export type FieldState = {
    hidden: boolean;
    mandatory: boolean;
    warning: string | null;
    error: string | null;
    assignedValue: unknown | null;
    hiddenOptions: Set<string>;
    hiddenOptionGroups: Set<string>;
};

export type FieldStateMap = Record<string, FieldState>;
```

`hiddenOptions` holds option codes hidden directly by `HIDEOPTION`; `hiddenOptionGroups` holds
optionGroup ids hidden by `HIDEOPTIONGROUP` — group _membership_ (which option codes belong to a
group) is resolved separately, since it requires an `optionGroups` API fetch the metadata package
doesn't do on its own. Callers fetch it (e.g. via `extractReferencedOptionGroupIds` +
`optionGroupsQuery` + `resolveOptionGroups` from `@dhis2-form-utils/metadata`) and pass it as the
`optionGroups` option to `useEventForm`/`useTrackerForm`. `resolveHiddenOptionCodes` (in
`@dhis2-form-utils/rules`) unions `hiddenOptions` with the resolved group members into a single
`Set<string>` of hidden codes — `useFieldControl` uses it to compute `FieldControlReturn.visibleOptions`
for widgets to render, and `filterPayload`'s optional third argument uses it to null out a submitted
value that references a now-hidden option.

**Context assembly** — the engine requires all program rule variables to be resolved before
evaluation. `@dhis2-form-utils/rules` provides `buildRuleEngineContext`, which takes fetched
program metadata and constructs the `RuleEngineContext` once, and `buildRuleEngine`, which
constructs the `RuleEngine` for a specific evaluation session (current values, existing enrollment
events). This separation keeps the expensive context-build step outside the reactive render loop.

```ts
// packages/rules/src/context.ts
import { RuleEngineContext, RuleEngine } from '@dhis2/rule-engine';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';

export function buildRuleEngineContext(metadata: ProgramStageMetadata): RuleEngineContext {
    return RuleEngineContext.builder()
        .rules(metadata.programRules)
        .ruleVariables(metadata.programRuleVariables)
        .build();
}

export function buildRuleEngine(
    context: RuleEngineContext,
    enrollmentData?: EnrollmentContext
): RuleEngine {
    const builder = context.toEngineBuilder();
    if (enrollmentData) {
        builder.enrollment(enrollmentData.enrollment);
        builder.events(enrollmentData.previousEvents);
    }
    return builder.build();
}
```

**`evaluateAndMap`** — runs the engine against a target event built from current form values, then
folds the resulting `RuleEffect` list into a `FieldStateMap`:

```ts
// packages/rules/src/evaluate.ts
export function evaluateAndMap(
    engine: RuleEngine,
    currentValues: Record<string, unknown>
): FieldStateMap {
    const targetEvent = toRuleEvent(currentValues);
    const effects = engine.evaluate(targetEvent);
    return effects.reduce<FieldStateMap>(applyEffect, {});
}
```

**Custom action support** — some DHIS2 implementations define local conventions on top of the
standard rule model (for example, using `DISPLAYTEXT` to pass machine-readable instructions to
custom widgets, or using `ASSIGN` to populate fields that only exist in the custom form layer).
`@dhis2-form-utils/rules` exposes an `effectHandlers` extension point: a map of action type
strings to handler functions that run after the standard `evaluateAndMap` pass. This lets consuming
apps add interpretation logic for these patterns without forking the library.

```ts
// packages/rules/src/evaluate.ts
export type EffectHandler = (effect: RuleEffect, state: FieldStateMap) => FieldStateMap;

export function evaluateAndMap(
    engine: RuleEngine,
    currentValues: Record<string, unknown>,
    effectHandlers?: Partial<Record<string, EffectHandler>>
): FieldStateMap {
    const effects = engine.evaluate(toRuleEvent(currentValues));
    return effects.reduce<FieldStateMap>((state, effect) => {
        const custom = effectHandlers?.[effect.ruleActionType];
        return custom ? custom(effect, state) : applyEffect(state, effect);
    }, {});
}
```

**Submission-time filtering** — before a form payload is sent, hidden fields must be stripped. The
rules package exports `filterPayload`, which takes a raw form values object and a `FieldStateMap`
and returns a clean payload with hidden fields removed and `ASSIGN`-sourced values substituted:

```ts
export function filterPayload(
    values: Record<string, unknown>,
    fieldState: FieldStateMap
): Record<string, unknown>;
```

In summary: `@dhis2/rule-engine` does the expression evaluation; `@dhis2-form-utils/rules` makes
that evaluation output usable inside a React Hook Form lifecycle.

---

### `@dhis2-form-utils/metadata`

Handles the translation from DHIS2 metadata objects (programs, program stages, data elements,
tracked entity attributes, option sets) into Zod schemas that React Hook Form can consume via
`@hookform/resolvers/zod`.

Each DHIS2 `valueType` maps to a Zod validator. Coercers normalise the raw strings that the DHIS2
API returns into proper JavaScript types before validation runs:

| DHIS2 valueType                | Zod schema                   | Coercion               |
| ------------------------------ | ---------------------------- | ---------------------- |
| `TEXT` / `LONG_TEXT`           | `z.string()`                 | None                   |
| `INTEGER` / `INTEGER_POSITIVE` | `z.number().int()`           | `Number(value)`        |
| `NUMBER`                       | `z.number()`                 | `parseFloat(value)`    |
| `BOOLEAN`                      | `z.boolean()`                | `value === 'true'`     |
| `DATE`                         | `z.string().date()`          | ISO format enforcement |
| `ORGANISATION_UNIT`            | `z.string().min(11).max(11)` | UID validation         |
| `FILE_RESOURCE`                | `z.string().uuid()`          | UID                    |

The primary export is `buildSchema`, which accepts a program stage or data set metadata object and
returns a `ZodObject` that can be passed directly into `useForm`:

```ts
// packages/metadata/src/buildSchema.ts
import { z } from 'zod';
import type { ProgramStageMetadata } from './types';

export function buildSchema(metadata: ProgramStageMetadata): z.ZodObject<z.ZodRawShape> {
    // iterates dataElements / trackedEntityAttributes, maps valueType → Zod
}
```

#### Query objects and resolvers

`@dhis2-form-utils/metadata` also owns the standardised query definitions and resolver functions
that produce `ProgramStageMetadata` and `TrackerProgramMetadata` from the DHIS2 API. This keeps
metadata _fetching_ decoupled from the form hooks: the query objects and resolvers are plain,
dependency-free exports — no React, no `@dhis2/app-runtime` runtime dependency, only a type-only
reference to `Query` from `@dhis2/data-engine`. See
[Data Fetching](#data-fetching--dhis2app-runtime) below for the full design.

```
packages/metadata/src/
├── buildSchema.ts
├── buildTrackerSchema.ts
├── queries/
│   ├── fields.const.ts              # named field-selection constants + withExtraFields
│   ├── programStageConfig.query.ts  # for useEventForm
│   └── trackerConfig.query.ts       # for useTrackerForm
├── resolvers/
│   ├── resolveEventProgramMetadata.ts
│   └── resolveTrackerProgramMetadata.ts
└── types.ts
```

---

## Data Fetching — `@dhis2/app-runtime`

Rather than shipping a custom API client, `dhis2-form-utils` delegates all data fetching and
mutation to `@dhis2/app-runtime`. This is the official DHIS2 platform runtime, already present in
any DHIS2 application. It provides:

- **`useDataQuery`** — declarative data fetching with built-in authentication, loading, and error
  state
- **`useDataMutation`** — declarative mutations supporting `create`, `update`, and `delete`
  operation types
- **`useDataEngine`** — imperative engine access for advanced use-cases such as chained mutations
- **`Provider`** — context provider that supplies the base URL and auth configuration to all hooks
  beneath it

Because `@dhis2/app-runtime`'s `Provider` owns the connection configuration, `dhis2-form-utils`
needs no equivalent setup of its own. Metadata _fetching_ is deliberately decoupled from the form
hooks: `@dhis2-form-utils/metadata` exports the query objects and resolver functions; the hooks
package never fetches internally. A consuming app fetches metadata however it likes — directly
with `useDataQuery` and an exported query object, or through the thin convenience hooks described
below — and passes the resolved result into `useEventForm` / `useTrackerForm` via `options.metadata`.

### Query objects, not query functions

A `Query` passed to `useDataQuery` is a static object, defined once outside the component. Dynamic
values are supplied by making individual `id` or `params` values functions of a `variables` object,
injected at call time via `useDataQuery(query, { variables })` (or `refetch(variables)`).
`@dhis2-form-utils/metadata` follows this exactly — every exported query is a plain object, never
a factory function:

```ts
// packages/metadata/src/queries/programStageConfig.query.ts
import type { Query } from '@dhis2/data-engine';
import {
    PROGRAM_STAGE_FIELDS,
    PROGRAM_RULE_FIELDS,
    PROGRAM_RULE_VARIABLE_FIELDS,
} from './fields.const';

export const programStageConfigQuery: Query = {
    programStage: {
        resource: 'programStages',
        id: ({ programStageId }: { programStageId: string }) => programStageId,
        params: { fields: PROGRAM_STAGE_FIELDS },
    },
    programRules: {
        resource: 'programRules',
        params: ({ programId }: { programId: string }) => ({
            fields: PROGRAM_RULE_FIELDS,
            filter: `program.id:eq:${programId}`,
        }),
    },
    programRuleVariables: {
        resource: 'programRuleVariables',
        params: ({ programId }: { programId: string }) => ({
            fields: PROGRAM_RULE_VARIABLE_FIELDS,
            filter: `program.id:eq:${programId}`,
        }),
    },
};
```

`programRules` and `programRuleVariables` are independent, top-level DHIS2 API resources — not
nested collections under `programs` or `programStages`. They are queried directly, filtered by
`program.id`, matching how the official Capture app (`dhis2/capture-app`) sources the same data.
`@dhis2/programs/{id}/metadata` (the dependency-export endpoint used to exchange metadata between
instances) and a nested `programs/{id}?fields=programRules[...]` selector are both unreliable
sources for this data — the former isn't a form-consumption endpoint, and the latter treats
`programRules` as if it were a field on `Program`, which it is not.

`trackerConfigQuery` mirrors this for tracker registration forms:

```ts
// packages/metadata/src/queries/trackerConfig.query.ts
export const trackerConfigQuery: Query = {
    program: {
        resource: 'programs',
        id: ({ programId }: { programId: string }) => programId,
        params: { fields: PROGRAM_TEA_FIELDS },
    },
    programRules: {
        resource: 'programRules',
        params: ({ programId }: { programId: string }) => ({
            fields: PROGRAM_RULE_FIELDS,
            filter: `program.id:eq:${programId}`,
        }),
    },
    programRuleVariables: {
        resource: 'programRuleVariables',
        params: ({ programId }: { programId: string }) => ({
            fields: PROGRAM_RULE_VARIABLE_FIELDS,
            filter: `program.id:eq:${programId}`,
        }),
    },
};
```

`useEventForm` and `useTrackerForm` used together on the same screen (registration plus a
first-stage event) issue separate `programRuleVariables` requests for the same program. This is
intentional: `useDataQuery` is backed by its own request cache, so an identical resource+params
request is deduplicated by `@dhis2/app-runtime` itself. `dhis2-form-utils` does not build a
shared-fetch layer on top — that would duplicate caching the runtime already owns.

### Resolvers

Each query has a matching pure resolver that reshapes the raw multi-resource `useDataQuery`
response into the type its form hook expects:

```ts
export function resolveEventProgramMetadata(raw: RawProgramStageConfigResult): ProgramStageMetadata;
export function resolveTrackerProgramMetadata(raw: RawTrackerConfigResult): TrackerProgramMetadata;
```

Resolvers are non-throwing. A program legitimately has zero program rules — `programRules: []` and
`programRuleVariables: []` are valid, expected states, not error conditions. Error surfacing stays
entirely with `useDataQuery`'s own `error` output; resolvers never inspect it.

### Extensibility

Every query is built from named field-selection constants (`PROGRAM_STAGE_FIELDS`,
`PROGRAM_RULE_FIELDS`, `PROGRAM_RULE_VARIABLE_FIELDS`, `PROGRAM_TEA_FIELDS`) plus a
`withExtraFields(base, extra?)` helper. A consuming app that needs additional fields — for a custom
`effectHandlers` interpretation of a nonstandard `DISPLAYTEXT` convention, for example — composes
its own query object by spreading the exported one and overriding only the resource it needs:

```ts
import {
    programStageConfigQuery,
    PROGRAM_RULE_FIELDS,
    withExtraFields,
} from '@dhis2-form-utils/metadata';

const customQuery = {
    ...programStageConfigQuery,
    programRules: {
        ...programStageConfigQuery.programRules,
        params: ({ programId }: { programId: string }) => ({
            fields: withExtraFields(PROGRAM_RULE_FIELDS, ['programRuleActions[displayContent]']),
            filter: `program.id:eq:${programId}`,
        }),
    },
};
```

The exported query objects stay genuine static objects; extension happens through composition, not
through a parameterised builder function.

### Piping into the hooks

`@dhis2-form-utils/hooks` adds two optional convenience hooks that compose the query and resolver.
Neither is called internally by `useEventForm` or `useTrackerForm`, and neither is required —
`useEventForm`/`useTrackerForm` keep their hard "no internal fetch" constraint unchanged:

```ts
// utils/hooks/src/queries/useProgramStageMetadataQuery.ts
import { useDataQuery } from '@dhis2/app-runtime';
import { programStageConfigQuery, resolveEventProgramMetadata } from '@dhis2-form-utils/metadata';

export function useProgramStageMetadataQuery(programId: string, programStageId: string) {
    const { data, loading, error } = useDataQuery(programStageConfigQuery, {
        variables: { programId, programStageId },
    });
    return { metadata: data ? resolveEventProgramMetadata(data) : undefined, loading, error };
}
```

```ts
const { metadata, loading } = useProgramStageMetadataQuery(programId, programStageId);
const { form, formStore } = useEventForm({ options: { programStageId, metadata } });
```

A consumer is free to skip the convenience hook entirely and call
`useDataQuery(programStageConfigQuery, { variables })` plus `resolveEventProgramMetadata` directly
— both are exported standalone from `@dhis2-form-utils/metadata` with no dependency on `hooks` or
React beyond what `useDataQuery` itself requires. The equivalent `useTrackerMetadataQuery` follows
the same shape for `trackerConfigQuery` / `resolveTrackerProgramMetadata`.

For standalone applications not built on the DHIS2 App Platform, the consuming app is responsible
for rendering `Provider` from `@dhis2/app-runtime` with the correct `baseUrl` and `authType`
before any hook from this library is called.

---

## Layer 2 — Headless Hooks (`@dhis2-form-utils/hooks`)

This package composes `@dhis2-form-utils/rules`, `@dhis2-form-utils/metadata`, and React Hook Form
into hooks that manage schema generation, form initialisation, and reactive rule evaluation.

Only **`useEventForm`** is implemented today. `useTrackerForm` and `useDataEntryForm` are planned.

For the full store design (external stores, debounced evaluation, selective re-renders), see
[form-state-architecture.md](./form-state-architecture.md).

### Primary hook

**`useEventForm({ options, formOptions? })`**

For single-event data entry. Accepts pre-fetched program stage metadata, builds the rule engine
context and engine synchronously, and wires a `FormStore` that evaluates rules on value changes.

```ts
const { form, formStore } = useEventForm({
    options: {
        programStageId: 'abc123',
        metadata: programStageMetadata,
        effectHandlers?: EffectHandlersMap,
    },
    formOptions?: {
        defaultValues?: Record<string, unknown>,
        // any other RHF useForm options except resolver
    },
});
```

| Return property | Type            | Purpose                                    |
| --------------- | --------------- | ------------------------------------------ |
| `form`          | `UseFormReturn` | React Hook Form instance with Zod resolver |
| `formStore`     | `FormStore`     | Owns rule evaluation and external stores   |

Wrap children in `FormStateProvider` before rendering fields — it wraps RHF's own
`FormProvider` internally, so there's no need to render `FormProvider` separately:

```tsx
<FormStateProvider formStore={formStore} form={form}>
    {/* D2Field or custom components using useFieldControl */}
</FormStateProvider>
```

**Planned hooks:**

- **`useTrackerForm`** — enrollment plus events; passes enrollment context into `buildRuleEngine`
- **`useDataEntryForm`** — aggregate data sets; section-aware schema and `dataValueSets` submission

### Rule reactivity inside `useEventForm`

Rule evaluation happens outside React's lifecycle in `FormStore`:

```ts
// utils/hooks/src/formStore.ts — simplified
class FormStore {
    readonly fieldStore = createFieldStateStore();
    readonly nonFieldStore = createNonFieldStateStore();

    init(form, engine, effectHandlersRef) {
        const evaluate = (values) => {
            const next = evaluateFormState(engine, values, effectHandlersRef.current);
            this.applyAssignments(next.fieldMap); // ASSIGN via form.setValue
            this.fieldStore.setState(next.fieldMap);
            this.nonFieldStore.setState(next.sectionMap, next.feedback);
        };

        this.debouncedEvaluate = debounce(() => evaluate(form.getValues()), 40);
        evaluate(form.getValues());

        form.subscribe({
            formState: { values: true },
            callback: () => this.debouncedEvaluate(),
        });
    }
}
```

The rule engine context is built once per metadata object. Evaluation is debounced (40ms) and
pushes results into per-field and non-field external stores. Field components subscribe via
`useFieldControl` or `useFieldState` and only re-render when their own state changes.

### Submission

Submission is the caller's responsibility. Use `filterPayload` from `@dhis2-form-utils/rules` to
strip hidden fields and substitute assigned values, then post via `useDataMutation`:

```ts
const onSubmit = form.handleSubmit((values) => {
    const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
    // mutate(payload)
});
```

Built-in `submit` on the hook is planned for a future release.

---

## Layer 1 — UI Adapters

Each adapter package exports field dispatchers, section wrappers, and feedback panels.

### Field components

`D2Field` is a thin dispatcher that calls `useFieldControl` and routes to the correct widget by
`valueType`. Widgets receive a single `control: FieldControlReturn` prop:

```tsx
// components/dhis2-ui/src/fields/D2Field.tsx
import { useFieldControl } from '@dhis2-form-utils/hooks';

export function D2Field({ field }: { field: FieldControlInput }) {
    const control = useFieldControl(field);
    if (control.isHidden) return null;

    switch (control.widgetKind) {
        case 'text':
            return <D2TextField control={control} />;
        // ... other widget kinds
    }
}
```

```tsx
// components/dhis2-ui/src/fields/widgets/TextField.tsx
import { resolveFieldValidation, type WidgetProps } from '@dhis2-form-utils/hooks';

export function D2TextField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);

    return (
        <InputField
            name={field.name}
            value={field.value as string}
            label={fieldConfig.label}
            required={isMandatory}
            disabled={isDisabled}
            warning={hasWarning}
            error={hasError}
            validationText={validationText}
            onChange={({ value }) => field.onChange(value ?? '')}
            onBlur={field.onBlur}
        />
    );
}
```

The same `D2Field` + `useFieldControl` pattern is implemented in `@dhis2-form-utils/mantine` and
`@dhis2-form-utils/mui`. Only the design-system widget implementations differ.

`useFieldState(fieldId)` is exported for advanced use cases but is not called directly by adapter
field components — `useFieldControl` composes it internally.

### Composed form components

Plug-and-play `EventForm` and `TrackerForm` components that wire a hook to a full rendered field
set are planned but not yet exported. Today, compose `useEventForm` + `FormStateProvider` +
`D2Field` as shown in the [README](../README.md).

---

## Configuration

### TypeScript

Each package has its own `tsconfig.json` extending `packages/config/tsconfig.base.json`. Strict
mode is on across the board. No implicit `any`. Types are derived from Zod schemas with `z.infer<>`.

```json
// packages/config/tsconfig.base.json
{
    "compilerOptions": {
        "strict": true,
        "moduleResolution": "bundler",
        "target": "ES2020",
        "lib": ["ES2020", "DOM"],
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    }
}
```

### Linting

ESLint is configured at the monorepo root with a flat config using `typescript-eslint` for
type-aware rules.

```js
// eslint.config.js
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(...tseslint.configs.strictTypeChecked, {
    plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
    },
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        '@typescript-eslint/no-explicit-any': 'error',
    },
    languageOptions: {
        parserOptions: { projectService: true },
    },
});
```

### Build

Each package builds to `dist/` using `tsup`, outputting both ESM and CJS with type declarations.

### Testing

Unit tests are co-located beside the source files they cover. The rules package is especially
well-suited to unit testing — `evaluateAndMap` is a pure function and can be tested against
fixture rule sets without any DOM or network involvement. End-to-end tests live in
`apps/playground/e2e/`. CI runs unit tests and e2e in separate jobs.

### CI

GitHub Actions runs:

```
lint → type-check → unit-test → build → e2e
```

---

## Future Considerations

**Public data entry portal** — because authentication and base URL are fully owned by
`@dhis2/app-runtime`, a public portal application only needs to configure the runtime's `Provider`
with the appropriate anonymous access settings. The form hooks and components beneath it require no
changes.

**Offline support** — `@dhis2/app-runtime` ships with offline tools including query caching and
mutation queuing. The hooks layer can opt into these using the runtime's `useOnlineStatus` hook and
offline-aware mutation options, without touching the UI adapter layer.

**New rule action types** — because `@dhis2-form-utils/rules` wraps `@dhis2/rule-engine` rather
than reimplementing it, any new action types that DHIS2 adds to the engine are automatically
available. Support for surfacing them in the `FieldStateMap` or `effectHandlers` can be added
incrementally without changing the underlying evaluation logic.
