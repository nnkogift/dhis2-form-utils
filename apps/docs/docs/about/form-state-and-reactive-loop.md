# Form state and the reactive loop

A single tracker event form can carry dozens of fields governed by program rules that hide
sections, assign values, show feedback widgets, and change what's mandatory — all in response to
what other fields contain. That evaluation has to happen on every meaningful value change,
without turning every keystroke into a whole-form re-render.

## What the rule engine actually produces

`@dhis2/rule-engine` returns a flat list of `RuleEffect` objects. These fall into two
fundamentally different categories:

**Field-scoped effects** carry a specific data element or TEA uid — `HIDEFIELD`, `SHOWWARNING`,
`SHOWERROR`, `ASSIGN`, `SETMANDATORYFIELD`, `HIDEOPTION`, `HIDEOPTIONGROUP`, and their
`SHOWOPTION`/`SHOWOPTIONGROUP`/`*ONCOMPLETE` counterparts. These map naturally onto a
`FieldStateMap` keyed by field uid.

**Non-field effects** have no field uid — `HIDESECTION` targets a section uid, and
`DISPLAYTEXT`/`DISPLAYKEYVALUEPAIR` target a feedback or indicator widget, keyed by a label +
location rather than any field. A `FieldStateMap`-only model has nowhere to put these, so
`dhis2-form-utils` partitions evaluation output into three independent maps instead of one.

## Three stores, not one

| Store             | Keyed by               | Holds                                                                |
| ----------------- | ---------------------- | -------------------------------------------------------------------- |
| `FieldStateMap`   | data element / TEA uid | hidden, mandatory, warning/error, assignedValue, hidden option codes |
| `SectionStateMap` | section uid            | `{ hidden: boolean }`                                                |
| `FeedbackMap`     | label + location       | `DISPLAYTEXT` / `DISPLAYKEYVALUEPAIR` content                        |

Keeping these separate — rather than folding sections and feedback into `FieldStateMap` with
synthetic keys — means a section wrapper only re-renders on section-visibility changes, and a
feedback panel only re-renders on feedback-content changes, regardless of what's happening to
field state elsewhere in the form.

## Why not `useState` and `form.watch`

A naive implementation reaches for `useState<FieldStateMap>` plus `form.watch`, and runs into
three problems at once:

1. **One state atom, whole-tree re-render.** Every rule evaluation replaces the entire
   `FieldStateMap` with a new object. React sees a new reference at the top of the tree and
   re-renders every consumer, even fields whose state didn't change.
2. **`form.watch` fires on every keystroke**, including mid-word, immediately invoking a
   full rule-engine evaluation — the wrong granularity for something that isn't cheap to run.
3. **No referential stability.** Every evaluation call returns a brand-new object even when the
   result is identical, so `React.memo`/`useMemo` have nothing to bail out on.

## The design that replaces it

Rule evaluation happens inside a `FormStore`, entirely outside React's render lifecycle:

```
RHF uncontrolled values
        │  form.subscribe — wired once at store construction, never inside useEffect
        ▼
FormStore (debounced 40ms)
        │  evaluates rules, writes ASSIGN values back via setValue({ shouldValidate: false })
        │  partitions effects into three maps
        ├──▶ FieldStateStore     (per-field listener registry)
        └──▶ NonFieldStateStore  (per-section + feedback listener registry)
```

`FormStore.init()` is called once, before any component using it mounts — not inside a
`useEffect`. Each store compares new state against previous state per key and only notifies the
listeners for keys that actually changed, using `useSyncExternalStore` on the consuming side.
`useFieldState(fieldId)`, `useSectionState(sectionId)`, and `useFormFeedback()` are thin
`useSyncExternalStore` wrappers scoped to exactly one slice each.

React Context carries only a stable `{ form, fieldStore, nonFieldStore }` handle, constructed
once and never updated — so Context itself never triggers a re-render. All the actual state lives
outside Context, in the stores.

## Constraints this design holds to

- **No `useEffect`.** Every subscription and debounced callback is initiated inside the store,
  not a hook's effect.
- **No `form.watch`.** Replaced by `form.subscribe`, the lower-level React Hook Form API — called
  once, inside the store.
- **`effectHandlers` accessed only via a ref.** Prevents an unstable inline object from tearing
  down and recreating the subscription on every render.
- **`shouldValidate: false` on every rule-driven `setValue` call.** Rule assignments aren't user
  input and must not re-trigger validation or re-enter the evaluation loop.
- **Referential stability in evaluation output.** Unchanged entries keep their previous object
  reference across evaluation cycles — required for the stores' `prev[key] !== next[key]` check
  to skip notifying listeners that don't need to re-render.

## Effect partitioning

Effects that don't fit any of the three maps — `SENDMESSAGE`, `SCHEDULEMESSAGE` (server-side
notification triggers), `HIDEPROGRAMSTAGE` (stage-level, out of scope for a single-stage
`useEventForm`) — are passed to `effectHandlers` for custom interpretation rather than stored
anywhere. See [Handle custom rule actions](../how-to/custom-rule-actions.md).

## What this buys you as a consumer

None of the above is something you wire up yourself — `useEventForm`/`useTrackerForm` return
`{ form, formStore }` already fully wired. What it means in practice: typing in one field only
re-renders that field (and anything whose rule state actually depends on it), section visibility
and feedback content update independently, and none of it requires `useEffect` in your own
components either — `useFieldControl`, `useSectionState`, and `useFormFeedback` are all you need.
