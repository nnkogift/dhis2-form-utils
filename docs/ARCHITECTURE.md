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
├── packages/
│   ├── rules/                   # @dhis2-form-utils/rules
│   ├── metadata/                # @dhis2-form-utils/metadata
│   ├── hooks/                   # @dhis2-form-utils/hooks
│   ├── dhis2-ui/                # @dhis2-form-utils/dhis2-ui
│   ├── mantine/                 # @dhis2-form-utils/mantine
│   ├── mui/                     # @dhis2-form-utils/mui
│   └── config/                  # Shared tsconfig + ESLint config
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
needs no equivalent setup of its own. The hooks package calls `useDataQuery` and `useDataMutation`
internally to fetch program metadata and submit form payloads, but the transport layer is entirely
owned by the runtime.

### Query pattern inside hooks

```ts
// packages/hooks/src/queries/programStage.query.ts
import type { Query } from '@dhis2/data-engine';

export const programStageQuery = (id: string): Query => ({
  programStage: {
    resource: 'programStages',
    id,
    params: {
      fields: [
        'id,displayName',
        'programStageDataElements[dataElement[id,displayName,valueType,optionSet[options[code,displayName]]]]',
        'programRules[id,condition,priority,programRuleActions[programRuleActionType,dataElement,content,data]]',
        'programRuleVariables[id,name,dataElement,programRuleVariableSourceType]',
      ].join(','),
    },
  },
});
```

For standalone applications not built on the DHIS2 App Platform, the consuming app is responsible
for rendering `Provider` from `@dhis2/app-runtime` with the correct `baseUrl` and `authType`
before any hook from this library is called.

---

## Layer 2 — Headless Hooks (`@dhis2-form-utils/hooks`)

This package composes `@dhis2-form-utils/rules`, `@dhis2-form-utils/metadata`, and
`@dhis2/app-runtime` into hooks that manage the full lifecycle of a DHIS2 form: metadata fetching,
context and engine construction, schema generation, form initialisation, reactive rule evaluation,
and submission.

### Primary hooks

**`useEventForm(options)`**

For single-event data entry. Fetches a program stage, builds the rule engine context once, then
re-evaluates rules reactively on every field change via `form.watch()`.

```ts
const {
		form,          // React Hook Form UseFormReturn
		fieldState,    // FieldStateMap — hidden, mandatory, warning, error, assignedValue per field
		isLoading,
		submit,
} = useEventForm({
		programStageId: 'abc123',
		existingValues? : Record<string, unknown>,
		effectHandlers? : Partial<Record<string, EffectHandler>>,  // custom action overrides
})
```

**`useTrackerForm(options)`**

For tracker programs — enrollment plus one or more events. Passes the full enrollment context
(enrollment attributes, previous events) into `buildRuleEngine` so that rules that reference data
from earlier events evaluate correctly.

**`useDataEntryForm(options)`**

For aggregate data entry. Accepts a data set ID and period, builds a section-aware schema, and
handles the `dataValueSets` submission format.

### Rule reactivity inside a hook

```ts
// Simplified illustration of the reactive loop inside useEventForm
const ruleEngineContext = useMemo(
  () => (data ? buildRuleEngineContext(data.programStage) : null),
  [data]
);

const ruleEngine = useMemo(
  () => (ruleEngineContext ? buildRuleEngine(ruleEngineContext) : null),
  [ruleEngineContext]
);

const [fieldState, dispatch] = useReducer(fieldStateReducer, {});

useEffect(() => {
  const subscription = form.watch((currentValues) => {
    if (!ruleEngine) return;
    const nextState = evaluateAndMap(ruleEngine, currentValues, effectHandlers);
    dispatch({ type: 'SET', payload: nextState });
  });
  return () => subscription.unsubscribe();
}, [form, ruleEngine, effectHandlers]);
```

The rule engine context is built once when metadata loads. The engine itself is rebuilt only when
enrollment context changes. Expression evaluation happens on every `watch` emission but is a pure
synchronous operation — it does not trigger additional renders beyond the `dispatch` that follows.

### Submission

At submission time, the hook calls `filterPayload` from `@dhis2-form-utils/rules` to strip hidden
fields and substitute assigned values before passing the clean payload to `useDataMutation`.

---

## Layer 1 — UI Adapters

Each adapter package exports two categories of components.

### Field components

Thin wrappers connecting a design system's native input to React Hook Form's `Controller`. They
accept a `name` prop, read from the nearest form context, and apply `fieldState`:

```tsx
// packages/dhis2-ui/src/fields/TextInput.tsx
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@dhis2/ui';
import { useFieldState } from '@dhis2-form-utils/hooks';

type Props = { name: string; label: string };

export function TextInput({ name, label }: Props) {
  const { control } = useFormContext();
  const state = useFieldState(name);

  if (state.hidden) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: rhfState }) => (
        <Input
          {...field}
          label={label}
          required={state.mandatory}
          warning={state.warning}
          error={rhfState.error?.message ?? state.error}
        />
      )}
    />
  );
}
```

The same pattern is implemented in `@dhis2-form-utils/mantine` and `@dhis2-form-utils/mui`. The
hook contract is identical across all three adapters.

### Plug-and-play form components

Composed forms that wire a hook to a full rendered field set:

```tsx
<EventForm programStageId="abc123" onSuccess={(event) => console.log('submitted', event)} />
```

Internally `EventForm` calls `useEventForm`, iterates the metadata's data elements in section
order, and renders the appropriate field component for each value type.

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
