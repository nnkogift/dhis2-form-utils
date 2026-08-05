# Program rules — `@dhis2-form-utils/rules`

Wraps `@dhis2/rule-engine` — the same engine used by Tracker Capture, Event Capture, and
the Android app. This package never reimplements rule expression parsing or variable
resolution; `useEventForm`/`useTrackerForm` build on it internally, so most consumers only
need `filterPayload` directly and read the rest for headless/custom-widget work.

## How it fits into `useEventForm`/`useTrackerForm`

When the hook initializes, it builds a `RuleEngineContext` (event/stage) or
`EnrollmentRuleEngineContext` (tracker) from the supplied metadata, then a `FormStore`
subscribes to form value changes (**debounced 40ms**), evaluates the rules on each change,
and pushes results into two stores read via companion hooks:

- **Per-field state** — `formStore.fieldStore`, read via `useFieldState(fieldId)` or
  `useFieldControl`
- **Section visibility + feedback widgets** — `formStore.nonFieldStore`, read via
  `useSectionState(sectionId)` and `useFormFeedback()`

## `FieldState` shape

```ts
const ruleState = useFieldState('dataElementUid');
// {
//   hidden: false,
//   mandatory: true,
//   warning: null,
//   error: null,
//   assignedValue: null,
//   hiddenOptions: Set {},
//   hiddenOptionGroups: Set {},
// }
```

## Standard action types (all handled)

`HIDEFIELD`, `HIDESECTION`, `ASSIGN`, `SHOWWARNING`, `SHOWERROR`, `WARNINGONCOMPLETE`,
`ERRORONCOMPLETE`, `SETMANDATORYFIELD`, `HIDEOPTION`, `HIDEOPTIONGROUP`, `SHOWOPTION`,
`SHOWOPTIONGROUP`, `DISPLAYTEXT`, `DISPLAYKEYVALUEPAIR`.

Because evaluation goes through `@dhis2/rule-engine` directly, any new action type or
expression function DHIS2 adds to the engine is automatically available — no corresponding
change is needed in this library.

## Submitting: `filterPayload`

```ts
import { filterPayload } from '@dhis2-form-utils/rules';

const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
```

Strips fields hidden by `HIDEFIELD` and substitutes values set by `ASSIGN` effects. Call
this on RHF `values` right before submission, for both event and tracker forms.

## `effectHandlers` extension point

Some implementations reuse a standard action type (e.g. `DISPLAYTEXT`, `ASSIGN`) to pass
machine-readable instructions to a custom widget rather than for its literal DHIS2 meaning.
Pass a map into `options.effectHandlers` on `useEventForm`/`useTrackerForm` — each handler
runs **after** the standard evaluation pass for that action type, so it augments rather than
replaces default behavior:

```ts
effectHandlers: {
    SENDMESSAGE: (effect: RuleEffect) => { /* custom side-effect */ },
}
```

## Package surface (verified against `utils/rules/src/index.ts`)

- **Evaluation**: `evaluateAndMap` (pure function — runs the engine against current form
  values, folds `RuleEffect[]` into a `FieldStateMap`), `applyEffect`, `buildFieldMap`,
  `buildSectionMap`, `buildFeedbackMap`, `partitionEffects`
- **Context builders**: `buildRuleEngineContext`/`buildRuleEngine` (event/stage),
  `buildEnrollmentRuleEngineContext`/`buildEnrollmentRuleEngine` (tracker),
  `toRuleEventFromInput`, `toRuleSupplementaryData`, `toRuleEnrollment`
- **Submission**: `filterPayload`, `resolveHiddenOptionCodes`
- **Types**: `FieldState`, `FieldStateMap`, `SectionState`, `SectionStateMap`,
  `FeedbackItem`, `FeedbackLocation`, `FeedbackMap`, `RuleEffect`, `EffectHandler`,
  `EffectHandlersMap`, `RuleEngineContext`, `EnrollmentRuleEngineContext`,
  `BuiltRuleEngine`

`evaluateAndMap` is a pure function and useful for testing custom rule setups without
rendering a form — no DOM or network required.

For the `FormStore`/effect-taxonomy internals behind all of this, read
`docs/form-state-architecture.md` in the source repo.
