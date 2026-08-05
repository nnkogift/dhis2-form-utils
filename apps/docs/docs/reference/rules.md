# `@nnkogift/dhis2-form-utils-rules`

Wraps [`@dhis2/rule-engine`](https://www.npmjs.com/package/@dhis2/rule-engine) — the official
DHIS2 program rule engine — and adapts its output into a typed shape a React form can consume.
`@dhis2/rule-engine` is a **peer dependency**, never bundled.

## Context and engine construction

```ts
function buildRuleEngineContext(
    metadata: ProgramStageMetadata,
    options?: BuildRuleEngineContextOptions
): RuleEngineContext;

function buildEnrollmentRuleEngineContext(metadata: TrackerProgramMetadata): RuleEngineContext;

function buildRuleEngine(
    context: RuleEngineContext,
    enrollmentData?: EnrollmentContext
): BuiltRuleEngine;
```

- `buildRuleEngineContext` — for event/stage forms. Maps `programRuleVariables` by data element
  uid.
- `buildEnrollmentRuleEngineContext` — for tracker registration. Maps variables by TEA uid,
  filters to `TEI_ATTRIBUTE`/`CALCULATED_VALUE` source types, and only includes rules with no
  `programStage` filter. Kept as a separate function rather than a shared one branching on form
  type — see [Tracker form design](../about/tracker-form-design.md).
- `buildRuleEngine` returns a `BuiltRuleEngine` that already knows whether to call
  `evaluateEvent` or `evaluateEnrollment` internally, based on how its context was built —
  callers never choose the evaluation method directly.

## Evaluation

### `evaluateAndMap`

```ts
function evaluateAndMap(
    engine: RuleEngineLike,
    currentValues: Record<string, unknown>,
    effectHandlers?: EffectHandlersMap
): EvaluateAndMapResult;

type EffectHandler = (effect: RuleEffect, state: FieldStateMap) => FieldStateMap;
type EffectHandlersMap = Partial<Record<string, EffectHandler>>;
```

`evaluateAndMap` is a pure function — no DOM, no network — so it's straightforward to unit test
against fixture rule sets. It runs the engine against the current form values and folds the
resulting `RuleEffect[]` into typed state maps. See
[Handle custom rule actions](../how-to/custom-rule-actions.md) for `effectHandlers` usage.

```ts
function applyEffect(state: FieldStateMap, effect: RuleEffect): FieldStateMap;
function buildFieldMap(effects: RuleEffect[]): FieldStateMap;
function partitionEffects(effects: RuleEffect[]): PartitionedEffects;
function buildSectionMap(effects: RuleEffect[]): SectionStateMap;
function buildFeedbackMap(effects: RuleEffect[]): FeedbackMap;
function feedbackItemKey(item: FeedbackItem): string;
```

## Types

```ts
type FieldState = {
    hidden: boolean;
    mandatory: boolean;
    warning: string | null;
    error: string | null;
    assignedValue: unknown | null;
    hiddenOptions: Set<string>;
    hiddenOptionGroups: Set<string>;
};
type FieldStateMap = Record<string, FieldState>;

type SectionState = { hidden: boolean };
type SectionStateMap = Record<string, SectionState>;

type FeedbackLocation = 'feedback' | 'indicators';
type FeedbackItem =
    | { type: 'text'; content: string; value: string; location: FeedbackLocation }
    | { type: 'keyValuePair'; content: string; value: string; location: FeedbackLocation };
type FeedbackMap = Record<string, FeedbackItem>;

function createEmptyFieldState(): FieldState;
function createEmptySectionState(): SectionState;
```

## Option group resolution

```ts
function resolveHiddenOptionCodes(
    fieldState: FieldState,
    optionGroups?: OptionGroupCodeMap
): Set<string>;
```

Unions a field's directly-hidden option codes (`HIDEOPTION`) with the members of any hidden
option groups (`HIDEOPTIONGROUP`), resolved via the `optionGroups` map (from
`@nnkogift/dhis2-form-utils-metadata`'s `resolveOptionGroups`). Used internally by
`useFieldControl` to compute `visibleOptions`, and by `filterPayload`'s optional third argument.

## Submission

```ts
function filterPayload(
    values: Record<string, unknown>,
    fieldState: FieldStateMap,
    optionGroups?: OptionGroupCodeMap
): Record<string, unknown>;
```

See [Filter hidden fields before submission](../how-to/filter-hidden-fields.md).

## Enrollment context helpers

```ts
function toRuleEventFromInput(input: RuleEventInput): /* engine event shape */ unknown;
function toRuleSupplementaryData(
    input: RuleSupplementaryDataInput
): /* engine supplementary data */ unknown;
function toRuleEnrollment(values: Record<string, unknown>): /* engine enrollment shape */ unknown;
```

Internal-facing conversion helpers, exported for advanced integration (e.g. passing prior
enrollment/event context into `useEventForm`'s `enrollment`/`events` options).

## Re-exported from `@nnkogift/dhis2-form-utils-metadata`

```ts
export {
    ProgramRuleActionType,
    ProgramRuleVariableSourceType,
} from '@nnkogift/dhis2-form-utils-metadata';
export type { OptionGroupCodeMap } from '@nnkogift/dhis2-form-utils-metadata';
export type { ValueType } from '@dhis2/api-types/v43';
```
