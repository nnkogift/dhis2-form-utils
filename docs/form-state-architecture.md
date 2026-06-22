# Form State Architecture

**Package:** `@dhis2-form-utils/hooks`  
**Primary file:** `useEventForm.ts`  
**Status:** Performance refactor in progress

---

## Why this document exists

DHIS2 forms are not simple. A single tracker event form may carry dozens of fields governed by a Program Rule Engine that hides sections, fills in values, shows feedback widgets, and makes fields mandatory — all based on what other fields contain. That rule evaluation must happen on every meaningful value change. Done naively, it turns every keystroke into a whole-form re-render and ignores entire categories of rule output entirely.

This document explains the root causes of both problems, the constraints that shaped the solution, and the architecture that replaces the original implementation. Every decision has a reason. The reasoning matters as much as the code, because DHIS2 data entry surfaces are large and the correctness and performance bars are real.

---

## Background: what the DHIS2 Program Rule Engine actually produces

Before designing any architecture, it is essential to understand the full surface of what `@dhis2/rule-engine` emits. The engine produces a flat list of `RuleEffect` objects, each with a `type` that maps to a `programRuleActionType`. These effects fall into two fundamentally different categories:

### Category 1 — Field-scoped effects

These effects are tied to a specific data element or tracked entity attribute UID. They describe state that belongs to a single field:

| Action type         | What it means                                                        |
| ------------------- | -------------------------------------------------------------------- |
| `HIDEFIELD`         | This field must not be rendered                                      |
| `SHOWWARNING`       | Show a non-blocking warning adjacent to this field                   |
| `SHOWERROR`         | Show a blocking error adjacent to this field                         |
| `WARNINGONCOMPLETE` | Warning surfaced only at form completion                             |
| `ERRORONCOMPLETE`   | Blocking error surfaced only at form completion                      |
| `ASSIGN`            | A value must be programmatically set on this field                   |
| `SETMANDATORYFIELD` | This field must be treated as required                               |
| `HIDEOPTION`        | A specific option within this field's option set must be hidden      |
| `HIDEOPTIONGROUP`   | All options in a group within this field's option set must be hidden |
| `SHOWOPTION`        | A previously hidden option must be shown                             |
| `SHOWOPTIONGROUP`   | A previously hidden option group must be shown                       |

These are keyed by field UID and slot naturally into a `FieldStateMap`.

### Category 2 — Non-field effects

These effects have **no field UID**. They describe state at the form or widget level. The current `FieldStateMap`-only architecture has no place for them — they are silently dropped:

| Action type           | Target                                        | What it means                                                                                  |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `HIDESECTION`         | Program stage section UID                     | This entire section of the form must not be rendered                                           |
| `DISPLAYTEXT`         | `location`: `feedback` or `indicators` widget | A text string (evaluated from `data`) must be shown in a widget, with a label from `content`   |
| `DISPLAYKEYVALUEPAIR` | `location`: `feedback` or `indicators` widget | A key/value pair (label from `content`, value from evaluated `data`) must be shown in a widget |

The `location` field on `DISPLAYTEXT` and `DISPLAYKEYVALUEPAIR` is set by the DHIS2 configurator when creating the rule action. It is either `feedback` (shown in the Feedback Widget panel) or `indicators` (shown in the Program Indicators Widget panel). The DHIS2 web Capture app renders both as collapsible side panels. In `dhis2-form-utils`, UI adapters decide how to surface these — but the hooks layer must produce and expose the data for them.

`HIDESECTION` carries the UID of the program stage section it targets. Section UIDs come from the `programStage.programStageSections` metadata, not from fields.

---

## What was wrong with the original implementation

### Problem 1 — Monolithic field state atom

```ts
const [fieldStateMap, setFieldStateMap] = useState<FieldStateMap>({});
```

`FieldStateMap` holds computed state for every field. Any time the rule engine finishes running, the entire map is replaced with a new object. React sees a new reference at the top of the tree and re-renders every consumer — even those whose state did not change. In a form with 30 fields, a single keystroke in Field A causes all 30 to re-render.

### Problem 2 — `form.watch` fires on every keystroke

```ts
useEffect(() => {
  const subscription = form.watch((values) => {
    const newMap = evaluateAndMap(values, rules, ...)
    setFieldStateMap(newMap)
  })
  return () => subscription.unsubscribe()
}, [rules, effectHandlers])
```

`form.watch` is a synchronous subscription that fires on every value change, including mid-word keystrokes. The callback immediately invokes `evaluateAndMap`, which runs the full rule engine. Rule evaluation is not cheap. Triggering it on every character typed is the wrong granularity.

### Problem 3 — `evaluateAndMap` produces new object references unconditionally

Every call returns a brand-new `FieldStateMap` object, even when the result is identical to the previous run. React's bailout mechanisms (`React.memo`, `useMemo`, `useCallback`) have nothing to hold onto — every downstream consumer sees a changed reference regardless of whether the computed state actually changed.

### Problem 4 — Non-field rule effects are silently dropped

`HIDESECTION`, `DISPLAYTEXT`, and `DISPLAYKEYVALUEPAIR` effects produced by the engine are not keyed by field UID. The `FieldStateMap`-only model has no slot for them. They are evaluated and discarded. Any DHIS2 program that uses section hiding or feedback widgets does not function correctly with the original implementation.

### Hidden bug 1 — Unstable `effectHandlers` reference

If `effectHandlers` is created inline at the call site, it has a new reference on every render. The `useEffect` dependency array tears down and recreates the `form.watch` subscription on every render.

### Hidden bug 2 — `setValue` feedback loop

Rule-driven `ASSIGN` effects call `form.setValue`, which triggers another `form.watch` emission, which triggers another evaluation. The loop settles only when values stabilise, producing several unnecessary evaluation cycles.

### Hidden bug 3 — `useEffect` for the subscription

The orchestration bridge uses `useEffect` to set up `form.subscribe`. This is a violation of the hard constraint (see below). The subscription must be set up at the store level, outside React entirely — not inside a hook lifecycle method.

---

## Constraints that shaped the solution

These are non-negotiable:

- **No `useEffect` anywhere.** All side effects — subscriptions, debounced callbacks, store writes — must be initiated at the store level, outside the React render and lifecycle system. This is the hardest constraint and shapes everything else.
- **No new runtime dependencies.** `lodash-es` (already in the graph) provides the debounce utility. Nothing else is added.
- **`effectHandlers` must always be accessed via a ref.** Prevents subscription churn from unstable references.
- **`shouldValidate: false` on all rule-driven `setValue` calls.** Rule assignments are not user input and must not trigger RHF's validation pipeline or re-enter the subscription.
- **No `FieldStateMap` in React Context.** Context re-renders all consumers on every value change. Context carries stable references, not mutable data.
- **No `form.watch`.** Replaced by `form.subscribe`, the lower-level RHF API.

---

## The full state model

The original implementation had one state container: `FieldStateMap`. The refactored implementation has three, each corresponding to a distinct category of rule output.

### `FieldStateMap`

Keyed by data element or tracked entity attribute UID. Holds per-field derived state.

```ts
type FieldState = {
    hidden: boolean;
    mandatory: boolean;
    warning: string | null;
    error: string | null;
    warningOnComplete: string | null;
    errorOnComplete: string | null;
    assignedValue: unknown | null;
    hiddenOptions: Set<string>;
    hiddenOptionGroups: Set<string>;
};

type FieldStateMap = Record<string, FieldState>;
```

### `SectionStateMap`

Keyed by program stage section UID. Holds only a `hidden` flag — because `HIDESECTION` is the only action that targets sections, and it produces exactly one boolean.

```ts
type SectionState = {
    hidden: boolean;
};

type SectionStateMap = Record<string, SectionState>;
```

Section UIDs are distinct from field UIDs. They come from `programStage.programStageSections[].id` in the metadata. The form layout knows which fields belong to which section, but the section's own visibility state must be tracked independently so a section wrapper component can subscribe to it without involving field-level state.

### `FeedbackMap`

Keyed by an arbitrary string ID. Holds the evaluated output of `DISPLAYTEXT` and `DISPLAYKEYVALUEPAIR` effects, partitioned by their `location` value.

```ts
type FeedbackItem =
    | { type: 'text'; content: string; value: string; location: 'feedback' | 'indicators' }
    | { type: 'keyValuePair'; content: string; value: string; location: 'feedback' | 'indicators' };

type FeedbackMap = Record<string, FeedbackItem>;
```

The key is constructed from the rule action's `content` (the label) combined with its `location`, making it stable and deduplication-safe across evaluations. Feedback items are not keyed by field UID — they have no field affiliation.

UI adapters read `FeedbackMap` to render feedback panels. The hooks layer produces the data; the adapter layer decides how to render it (collapsible panel, inline, tooltip, etc.). This keeps the headless contract clean.

---

## The four-layer architecture

The refactored architecture adds one layer to the original three: a dedicated store for non-field state, alongside the existing `FieldStateStore`.

```
┌──────────────────────────────────────────────────────┐
│  Layer 1 — RHF uncontrolled value layer              │
│  React Hook Form owns field values.                  │
│  No useState for values. No re-renders here.         │
└───────────────────────┬──────────────────────────────┘
                        │ form.subscribe — wired at store init, outside React
                        ▼
┌──────────────────────────────────────────────────────┐
│  Layer 2 — Orchestration bridge (inside the store)   │
│  Debounced (40ms) rule evaluation.                   │
│  Partitions RuleEffect list into three output maps.  │
│  Writes ASSIGN values back via setValue.             │
│  Pushes each map to its corresponding store.         │
└──────┬─────────────────────────────┬─────────────────┘
       │                             │
       ▼                             ▼
┌──────────────┐           ┌──────────────────────────┐
│FieldStateStore│           │  NonFieldStateStore       │
│per-field      │           │  SectionStateMap          │
│listener reg.  │           │  FeedbackMap              │
│useSyncExtStore│           │  useSyncExternalStore     │
│per-field sel. │           │  per-section / global sel.│
└──────────────┘           └──────────────────────────┘
```

### Why two stores, not one

The alternative — merging `SectionStateMap` and `FeedbackMap` into `FieldStateMap` — was rejected because:

1. Sections are not fields. A section wrapper component needs to subscribe to section visibility without knowing anything about field UIDs. Mixing section state into `FieldStateMap` would require the section wrapper to know which UID to look up, or would require a synthetic field-keyed entry for each section — both of which break the abstraction.
2. Feedback items have no UID affiliation at all. They are keyed by label + location. Folding them into `FieldStateMap` would require inventing UIDs or using a union type that every field consumer would have to discriminate against.
3. Selector isolation. A section component should only re-render when section visibility changes. A feedback panel should only re-render when feedback content changes. Neither should re-render due to field state changes. Separate stores enforce this cleanly.

### Layer 1: RHF uncontrolled value layer

React Hook Form stores field values in uncontrolled DOM inputs. Typing into a field does not produce React state updates. RHF exposes value changes through a subscription model, not through state.

Nothing changes here from a library-consumer perspective.

### Layer 2: Orchestration bridge — inside the store, outside React

This is the critical design decision that eliminates the `useEffect` violation. The orchestration bridge is not set up inside a hook. It is set up inside `FormStore.init()`, which is called once when the store is constructed — before any React component mounts.

```ts
// formStore.ts — simplified
class FormStore {
    private fieldStore: FieldStateStore;
    private nonFieldStore: NonFieldStateStore;
    private unsubscribe: (() => void) | null = null;

    init(form: UseFormReturn, rules: ProgramRule[], effectHandlersRef: RefObject<EffectHandlers>) {
        const debouncedEvaluate = debounce((values: FieldValues) => {
            const effects = runRuleEngine(values, rules);

            // Partition effects by category
            const { fieldEffects, sectionEffects, feedbackEffects } = partitionEffects(effects);

            // Handle ASSIGN effects: write values back without triggering re-evaluation
            for (const effect of fieldEffects.filter((e) => e.type === 'ASSIGN')) {
                form.setValue(effect.field, effect.value, { shouldValidate: false });
            }

            // Run custom handlers via ref (never via closure — avoids stale capture)
            const handlers = effectHandlersRef.current;
            if (handlers) {
                for (const effect of effects) {
                    handlers[effect.type]?.(effect);
                }
            }

            // Push each map to its store — selective notification fires from within
            this.fieldStore.setState(mapFieldEffects(fieldEffects));
            this.nonFieldStore.setState(
                mapSectionEffects(sectionEffects),
                mapFeedbackEffects(feedbackEffects)
            );
        }, 40);

        this.unsubscribe = form.subscribe({
            formState: { values: true },
            callback: ({ values }) => debouncedEvaluate(values),
        });
    }

    destroy() {
        this.unsubscribe?.();
    }
}
```

The store is created before the component tree mounts. The `form.subscribe` call wires value changes to the debounced evaluation pipeline entirely outside React. No `useEffect` is involved. React components later connect to the stores via `useSyncExternalStore` — but that is read-only subscription, not effect initiation.

The `destroy()` method is called when the hook that owns the store unmounts. The hook calls it via a cleanup ref pattern, not via `useEffect`.

### Layer 3: FieldStateStore

A plain external store with a per-field listener registry. `setState` compares each field's new state against its previous state using shallow equality, and only notifies listeners for fields that actually changed.

```ts
class FieldStateStore {
    private state: FieldStateMap = {};
    private listeners = new Map<string, Set<() => void>>();

    getFieldSnapshot(fieldId: string): FieldState | undefined {
        return this.state[fieldId];
    }

    setState(nextMap: FieldStateMap): void {
        const prev = this.state;
        this.state = nextMap;
        for (const [fieldId, listeners] of this.listeners) {
            if (prev[fieldId] !== nextMap[fieldId]) {
                for (const listener of listeners) listener();
            }
        }
    }

    subscribe(fieldId: string, listener: () => void): () => void {
        if (!this.listeners.has(fieldId)) this.listeners.set(fieldId, new Set());
        this.listeners.get(fieldId)!.add(listener);
        return () => this.listeners.get(fieldId)?.delete(listener);
    }
}
```

Field components subscribe via `useFieldState(fieldId)` which uses `useSyncExternalStore` with a per-field selector. Only the field whose state changed re-renders.

### Layer 4: NonFieldStateStore

A companion store for section and feedback state. It holds both maps and notifies registered listeners when either changes.

```ts
class NonFieldStateStore {
    private sections: SectionStateMap = {};
    private feedback: FeedbackMap = {};
    private sectionListeners = new Map<string, Set<() => void>>();
    private feedbackListeners = new Set<() => void>();

    getSectionSnapshot(sectionId: string): SectionState | undefined {
        return this.sections[sectionId];
    }

    getFeedbackSnapshot(): FeedbackMap {
        return this.feedback;
    }

    setState(nextSections: SectionStateMap, nextFeedback: FeedbackMap): void {
        const prevSections = this.sections;
        const prevFeedback = this.feedback;

        this.sections = nextSections;
        this.feedback = nextFeedback;

        // Notify per-section listeners
        for (const [sectionId, listeners] of this.sectionListeners) {
            if (prevSections[sectionId] !== nextSections[sectionId]) {
                for (const listener of listeners) listener();
            }
        }

        // Notify feedback listeners if the map reference changed
        if (prevFeedback !== nextFeedback) {
            for (const listener of this.feedbackListeners) listener();
        }
    }

    subscribeSection(sectionId: string, listener: () => void): () => void {
        if (!this.sectionListeners.has(sectionId)) {
            this.sectionListeners.set(sectionId, new Set());
        }
        this.sectionListeners.get(sectionId)!.add(listener);
        return () => this.sectionListeners.get(sectionId)?.delete(listener);
    }

    subscribeFeedback(listener: () => void): () => void {
        this.feedbackListeners.add(listener);
        return () => this.feedbackListeners.delete(listener);
    }
}
```

Section wrapper components subscribe via `useSectionState(sectionId)`. Feedback panel components subscribe via `useFormFeedback()`. Neither re-renders when field state changes, because they are subscribed to a different store.

---

## Context: stable references, not data

React Context carries a single object — `{ form, fieldStore, nonFieldStore }` — constructed once and never updated. This gives every component in the tree access to all three stores without prop drilling. Because the Context value itself never changes after mount, no Context-driven re-renders occur.

```ts
type FormStateContextValue = {
    form: UseFormReturn<FieldValues>;
    fieldStore: FieldStateStore;
    nonFieldStore: NonFieldStateStore;
};
```

---

## Consumer hooks

```ts
// useFieldState.ts — field components
function useFieldState(fieldId: string): FieldState | undefined {
    const { fieldStore } = useFormStateContext();
    return useSyncExternalStore(
        useCallback((notify) => fieldStore.subscribe(fieldId, notify), [fieldStore, fieldId]),
        () => fieldStore.getFieldSnapshot(fieldId),
        () => fieldStore.getFieldSnapshot(fieldId)
    );
}

// useSectionState.ts — section wrapper components
function useSectionState(sectionId: string): SectionState | undefined {
    const { nonFieldStore } = useFormStateContext();
    return useSyncExternalStore(
        useCallback(
            (notify) => nonFieldStore.subscribeSection(sectionId, notify),
            [nonFieldStore, sectionId]
        ),
        () => nonFieldStore.getSectionSnapshot(sectionId),
        () => nonFieldStore.getSectionSnapshot(sectionId)
    );
}

// useFormFeedback.ts — feedback panel components
function useFormFeedback(): FeedbackMap {
    const { nonFieldStore } = useFormStateContext();
    return useSyncExternalStore(
        useCallback((notify) => nonFieldStore.subscribeFeedback(notify), [nonFieldStore]),
        () => nonFieldStore.getFeedbackSnapshot(),
        () => nonFieldStore.getFeedbackSnapshot()
    );
}
```

---

## Effect partitioning

The orchestration bridge partitions the flat `RuleEffect[]` list into three buckets immediately after evaluation. This is a pure function with no side effects — it just routes effects to the right map.

```ts
function partitionEffects(effects: RuleEffect[]) {
    const fieldEffects: RuleEffect[] = [];
    const sectionEffects: RuleEffect[] = [];
    const feedbackEffects: RuleEffect[] = [];

    for (const effect of effects) {
        if (FIELD_SCOPED_TYPES.has(effect.type)) {
            fieldEffects.push(effect);
        } else if (effect.type === 'HIDESECTION') {
            sectionEffects.push(effect);
        } else if (effect.type === 'DISPLAYTEXT' || effect.type === 'DISPLAYKEYVALUEPAIR') {
            feedbackEffects.push(effect);
        }
        // SENDMESSAGE, SCHEDULEMESSAGE, HIDEPROGRAMSTAGE are server-side or stage-level;
        // they are passed to effectHandlers for custom interpretation and not stored here
    }

    return { fieldEffects, sectionEffects, feedbackEffects };
}

const FIELD_SCOPED_TYPES = new Set([
    'HIDEFIELD',
    'SHOWWARNING',
    'SHOWERROR',
    'WARNINGONCOMPLETE',
    'ERRORONCOMPLETE',
    'ASSIGN',
    'SETMANDATORYFIELD',
    'HIDEOPTION',
    'HIDEOPTIONGROUP',
    'SHOWOPTION',
    'SHOWOPTIONGROUP',
]);
```

`SENDMESSAGE` and `SCHEDULEMESSAGE` are server-side actions — the rule engine evaluates when they should trigger, but execution happens via the DHIS2 backend. They are passed to `effectHandlers` for any custom client-side handling (e.g. showing a notification to the user) but are not stored in any state map.

`HIDEPROGRAMSTAGE` is a stage-level action. Its handling is out of scope for `useEventForm` (which operates on a single stage) and is passed to `effectHandlers` for the consuming application to handle at the navigation or routing level.

---

## Referential stability in `evaluateAndMap`

The store's selective notification depends on `prev[id] !== next[id]` returning `false` when nothing actually changed. This requires `evaluateAndMap` to return the same object reference for unchanged entries. Without this, every evaluation cycle fires every listener.

```ts
export function evaluateAndMap(
    values: FieldValues,
    rules: ProgramRule[],
    previousFieldMap: FieldStateMap,
    previousSectionMap: SectionStateMap,
    previousFeedback: FeedbackMap
): { fieldMap: FieldStateMap; sectionMap: SectionStateMap; feedback: FeedbackMap } {
    const effects = runRuleEngine(values, rules);
    const { fieldEffects, sectionEffects, feedbackEffects } = partitionEffects(effects);

    const nextFieldMap = stableMap(previousFieldMap, buildFieldMap(fieldEffects));
    const nextSectionMap = stableMap(previousSectionMap, buildSectionMap(sectionEffects));
    const nextFeedback = stableMap(previousFeedback, buildFeedbackMap(feedbackEffects));

    return { fieldMap: nextFieldMap, sectionMap: nextSectionMap, feedback: nextFeedback };
}

// Returns previous object reference if shallowly equal to next
function stableMap<T extends Record<string, object>>(prev: T, next: T): T {
    const result = {} as T;
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    for (const key of keys) {
        result[key as keyof T] = shallowEqual(prev[key], next[key]) ? prev[key] : next[key];
    }
    return result;
}
```

---

## File structure

```
packages/hooks/src/
├── formStore.ts              # FormStore class — owns bridge init, holds both stores
├── fieldStateStore.ts        # FieldStateStore — per-field listener registry
├── nonFieldStateStore.ts     # NonFieldStateStore — section + feedback listener registry
├── FormStateContext.tsx       # Context: { form, fieldStore, nonFieldStore }
├── useFieldState.ts           # Per-field useSyncExternalStore hook
├── useSectionState.ts         # Per-section useSyncExternalStore hook
├── useFormFeedback.ts         # Feedback map useSyncExternalStore hook
├── useEventForm.ts            # Public hook — creates FormStore, exposes submit/isLoading
├── evaluateAndMap.ts          # Rule evaluation with referential stability
└── partitionEffects.ts        # Pure function: RuleEffect[] → three buckets
```

UI adapter packages:

- Field components call `useFieldState(fieldId)`
- Section wrapper components call `useSectionState(sectionId)`
- Feedback panel components call `useFormFeedback()`

---

## Hard constraints summary

| Constraint                                        | Reason                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| No `useEffect` anywhere                           | All subscriptions and effect initiation must happen at the store level, outside React's lifecycle            |
| No new runtime dependencies                       | `lodash-es` debounce is sufficient; no additional transitive deps for consumers                              |
| `effectHandlers` always via ref                   | Prevents stale closure capture inside the store-level debounced callback                                     |
| `shouldValidate: false` on rule-driven `setValue` | Prevents feedback loop; rule assignments are not user input                                                  |
| No `FieldStateMap` in Context                     | Context re-renders all consumers; Context carries stable references only                                     |
| No `form.watch`                                   | Replaced by `form.subscribe` called inside the store, not inside a hook                                      |
| Referential stability in `evaluateAndMap`         | Required for selective notification to work in all three stores                                              |
| Two stores, not one                               | Field, section, and feedback state must be independently subscribable; mixing them breaks selector isolation |

---

## Phase 2: rule dependency index

The architecture evaluates all rules on every debounced change. A future optimisation is a dependency index built at form initialisation:

```ts
type RuleDependencyIndex = Map<string, ProgramRule[]>;

function buildRuleDependencyIndex(rules: ProgramRule[]): RuleDependencyIndex {
    const index = new Map<string, ProgramRule[]>();
    for (const rule of rules) {
        for (const fieldId of extractConditionFields(rule)) {
            if (!index.has(fieldId)) index.set(fieldId, []);
            index.get(fieldId)!.push(rule);
        }
    }
    return index;
}
```

With this index, the bridge passes only changed field IDs to `evaluateAndMap`, which evaluates only rules whose condition references those fields. This reduces per-keystroke evaluation from O(all rules) to O(rules referencing changed field). This is intentionally deferred to Phase 2; correctness of Phase 1 is the prerequisite.

---

## Completion checklist

- [ ] `formStore.ts` — `FormStore` class: owns bridge init, constructs both stores, wires `form.subscribe` outside React
- [ ] `fieldStateStore.ts` — per-field listener registry with selective notification
- [ ] `nonFieldStateStore.ts` — per-section + global feedback listener registry
- [ ] `FormStateContext.tsx` — stable `{ form, fieldStore, nonFieldStore }`, never updates after mount
- [ ] `useFieldState.ts` — `useSyncExternalStore` + per-field selector
- [ ] `useSectionState.ts` — `useSyncExternalStore` + per-section selector
- [ ] `useFormFeedback.ts` — `useSyncExternalStore` for feedback map
- [ ] `partitionEffects.ts` — pure function routing `RuleEffect[]` to three buckets
- [ ] `evaluateAndMap.ts` — referential stability across all three output maps
- [ ] `useEventForm.ts` — creates `FormStore`, exposes public API, no `useEffect`
- [ ] UI adapter field components — call `useFieldState(fieldId)`
- [ ] UI adapter section components — call `useSectionState(sectionId)`
- [ ] UI adapter feedback panels — call `useFormFeedback()`
- [ ] `shouldValidate: false` on all rule-driven `setValue` calls
- [ ] No `form.watch` calls remain anywhere in the package
- [ ] No `useEffect` calls remain anywhere in the package
- [ ] React DevTools Profiler confirms: typing in Field A does not trigger re-renders in Fields B–Z, section wrappers, or feedback panels
- [ ] Vitest: per-field selective notification fires only for changed fields
- [ ] Vitest: per-section selective notification fires only for changed sections
- [ ] Vitest: feedback listeners fire only when feedback map changes
- [ ] Vitest: `setValue` feedback loop does not occur
- [ ] Vitest: `effectHandlers` ref captures latest handlers without subscription churn
